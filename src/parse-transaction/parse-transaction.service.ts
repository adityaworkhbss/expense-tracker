import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dayjs from 'dayjs';

// ─── Response Interfaces ────────────────────────────────────────────

export interface ParsedTransactionData {
  amount: number | null;
  merchant: string | null;
  category_id: string | null;
  category_name: string | null;
  account_id: string | null;
  account_name: string | null;
  payment_method: string | null;
  date: string | null;
  transaction_type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  note: string | null;
}

export interface ParseTransactionResponse {
  success: boolean;
  requires_user_input?: boolean;
  missing_required_fields?: string[];
  data?: ParsedTransactionData;
  message?: string;
}

@Injectable()
export class ParseTransactionService {
  private readonly logger = new Logger(ParseTransactionService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn('GEMINI_API_KEY not configured — AI parsing disabled');
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAIN ENTRY POINT
  // ═══════════════════════════════════════════════════════════════════

  async parseTransaction(
    userId: string,
    rawText: string,
  ): Promise<ParseTransactionResponse> {
    // STEP 1 — Guard: is AI configured?
    if (!this.genAI) {
      return {
        success: false,
        message: 'AI transaction parsing is not configured',
      };
    }

    try {
      // STEP 2 — Preprocess text
      const cleanedText = this.preprocess(rawText);
      if (!cleanedText || cleanedText.length < 2) {
        return { success: false, message: 'Unable to parse transaction' };
      }

      // STEP 3 — Fetch dynamic data from DB
      const [categories, accounts] = await Promise.all([
        this.fetchCategories(userId),
        this.fetchAccounts(userId),
      ]);

      // STEP 4 — Build dynamic prompt
      const prompt = this.buildPrompt(cleanedText, categories, accounts);

      // STEP 5 — Call Gemini
      const aiResponse = await this.callGemini(prompt);
      if (!aiResponse) {
        return {
          success: false,
          message: 'Temporary parsing unavailable',
        };
      }

      // STEP 6 — Clean up AI response
      const parsed = this.cleanupResponse(aiResponse);
      if (!parsed) {
        return { success: false, message: 'Unable to parse transaction' };
      }

      // STEP 7 — Validate against business rules
      const validated = this.validate(parsed, categories, accounts);

      // STEP 8 — Determine missing required fields
      const missingRequired = this.getMissingRequiredFields(validated);

      // STEP 9 — Return structured response
      return {
        success: true,
        requires_user_input: missingRequired.length > 0,
        missing_required_fields: missingRequired,
        data: validated,
      };
    } catch (error: any) {
      this.logger.error(`Parse transaction failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Temporary parsing unavailable',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2 — PREPROCESSING
  // ═══════════════════════════════════════════════════════════════════

  private preprocess(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')  // collapse multiple spaces
      .toLowerCase();
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 3 — FETCH DYNAMIC DATA
  // ═══════════════════════════════════════════════════════════════════

  private async fetchCategories(userId: string) {
    return this.prisma.category.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    });
  }

  private async fetchAccounts(userId: string) {
    return this.prisma.account.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 4 — PROMPT BUILDER
  // ═══════════════════════════════════════════════════════════════════

  private buildPrompt(
    text: string,
    categories: { id: string; name: string; type: string }[],
    accounts: { id: string; name: string; type: string | null }[],
  ): string {
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    const categoryList = categories
      .map((c) => `  "${c.id}" -> ${c.name} (${c.type})`)
      .join('\n');

    const accountList = accounts
      .map((a) => `  "${a.id}" -> ${a.name}${a.type ? ` (${a.type})` : ''}`)
      .join('\n');

    return `You are a transaction parser. Extract structured transaction data from natural language text.

TODAY'S DATE: ${today}
YESTERDAY'S DATE: ${yesterday}

AVAILABLE CATEGORIES (id -> name (type)):
${categoryList || '  (none available)'}

AVAILABLE ACCOUNTS (id -> name (type)):
${accountList || '  (none available)'}

RULES:
1. Return ONLY valid JSON, no markdown, no explanation, no backticks.
2. For "date": resolve relative dates like "today", "yesterday", "last monday" to YYYY-MM-DD format. If no date mentioned, use today: ${today}.
3. For "transaction_type": default to "EXPENSE" unless clearly income (salary, received, earned, etc.).
4. For "category_id": match the merchant/description to the most relevant category from the list above. Use the exact ID string. Set null if no match.
5. For "account_id": match payment method keywords to accounts. For example "credit card" might match a PAY_LATER account, "cash"/"upi"/"bank" might match a PAY_NOW account. Use the exact ID string. Set null if unsure.
6. For "payment_method": extract if mentioned (cash, upi, credit card, debit card, net banking, etc.). Set null if not mentioned.
7. For "amount": extract the numeric amount. Set null if not found. MUST be a number, not a string.
8. For "merchant": capitalize the merchant/vendor name properly. Set null if not identified.
9. For "note": generate a short descriptive note from the text. Set null if text is too vague.
10. For "category_name": provide the matched category name (for frontend display). Set null if no match.
11. For "account_name": provide the matched account name (for frontend display). Set null if no match.

MERCHANT → CATEGORY HINTS:
- Food delivery (Swiggy, Zomato, Uber Eats) → Food/Dining category
- Ride services (Uber, Ola, Rapido) → Transport category
- Shopping (Amazon, Flipkart, Myntra) → Shopping category
- Groceries (BigBasket, Blinkit, Zepto) → Groceries category
- Entertainment (Netflix, Spotify, Hotstar) → Entertainment category
- Fuel/Petrol/Diesel → Transport/Fuel category

RESPONSE FORMAT (strict JSON):
{
  "amount": <number|null>,
  "merchant": <string|null>,
  "category_id": <string|null>,
  "category_name": <string|null>,
  "account_id": <string|null>,
  "account_name": <string|null>,
  "payment_method": <string|null>,
  "date": "<YYYY-MM-DD>",
  "transaction_type": "EXPENSE"|"INCOME"|"TRANSFER",
  "note": <string|null>
}

USER INPUT: "${text}"`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 5 — CALL GEMINI
  // ═══════════════════════════════════════════════════════════════════

  private async callGemini(prompt: string): Promise<string | null> {
    try {
      const model = this.genAI!.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.1,        // low temp = deterministic
          maxOutputTokens: 500,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      this.logger.error(`Gemini API error: ${error.message}`);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 6 — RESPONSE CLEANUP
  // ═══════════════════════════════════════════════════════════════════

  private cleanupResponse(raw: string): ParsedTransactionData | null {
    try {
      // Strip markdown code fences if present
      let cleaned = raw.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleaned);

      return {
        amount: parsed.amount ?? null,
        merchant: parsed.merchant ?? null,
        category_id: parsed.category_id ?? null,
        category_name: parsed.category_name ?? null,
        account_id: parsed.account_id ?? null,
        account_name: parsed.account_name ?? null,
        payment_method: parsed.payment_method ?? null,
        date: parsed.date ?? null,
        transaction_type: parsed.transaction_type ?? 'EXPENSE',
        note: parsed.note ?? null,
      };
    } catch (error: any) {
      this.logger.error(`Failed to parse AI response: ${error.message}`);
      this.logger.debug(`Raw AI response: ${raw}`);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 7 — VALIDATION LAYER
  // ═══════════════════════════════════════════════════════════════════

  private validate(
    data: ParsedTransactionData,
    categories: { id: string; name: string; type: string }[],
    accounts: { id: string; name: string; type: string | null }[],
  ): ParsedTransactionData {
    const validCategoryIds = new Set(categories.map((c) => c.id));
    const validAccountIds = new Set(accounts.map((a) => a.id));

    // Validate amount is numeric and positive
    if (data.amount !== null) {
      const num = Number(data.amount);
      if (isNaN(num) || num <= 0) {
        data.amount = null;
      } else {
        data.amount = Math.round(num * 100) / 100; // round to 2 decimal places
      }
    }

    // Validate category exists
    if (data.category_id && !validCategoryIds.has(data.category_id)) {
      data.category_id = null;
      data.category_name = null;
    }

    // Validate account exists
    if (data.account_id && !validAccountIds.has(data.account_id)) {
      data.account_id = null;
      data.account_name = null;
    }

    // Validate date format
    if (data.date) {
      const parsed = dayjs(data.date, 'YYYY-MM-DD', true);
      if (!parsed.isValid()) {
        data.date = dayjs().format('YYYY-MM-DD');
      }
    } else {
      data.date = dayjs().format('YYYY-MM-DD');
    }

    // Validate transaction type enum
    const validTypes = ['INCOME', 'EXPENSE', 'TRANSFER'];
    if (!validTypes.includes(data.transaction_type)) {
      data.transaction_type = 'EXPENSE';
    }

    // Sanitize merchant name
    if (data.merchant) {
      data.merchant = data.merchant.trim();
      if (data.merchant.length === 0) data.merchant = null;
    }

    return data;
  }

  // ═══════════════════════════════════════════════════════════════════
  // STEP 8 — MISSING REQUIRED FIELDS
  // ═══════════════════════════════════════════════════════════════════

  private getMissingRequiredFields(data: ParsedTransactionData): string[] {
    const missing: string[] = [];

    // Only amount is truly required for MVP
    if (data.amount === null) {
      missing.push('amount');
    }

    return missing;
  }
}
