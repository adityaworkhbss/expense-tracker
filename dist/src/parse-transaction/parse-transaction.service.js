"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ParseTransactionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseTransactionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_1 = require("../prisma");
const generative_ai_1 = require("@google/generative-ai");
const dayjs_1 = __importDefault(require("dayjs"));
let ParseTransactionService = ParseTransactionService_1 = class ParseTransactionService {
    prisma;
    config;
    logger = new common_1.Logger(ParseTransactionService_1.name);
    genAI = null;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        const apiKey = this.config.get('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
        else {
            this.logger.warn('GEMINI_API_KEY not configured — AI parsing disabled');
        }
    }
    async parseTransaction(userId, rawText) {
        if (!this.genAI) {
            return {
                success: false,
                message: 'AI transaction parsing is not configured',
            };
        }
        try {
            const cleanedText = this.preprocess(rawText);
            if (!cleanedText || cleanedText.length < 2) {
                return { success: false, message: 'Unable to parse transaction' };
            }
            const [categories, accounts] = await Promise.all([
                this.fetchCategories(userId),
                this.fetchAccounts(userId),
            ]);
            const prompt = this.buildPrompt(cleanedText, categories, accounts);
            const aiResponse = await this.callGemini(prompt);
            if (!aiResponse) {
                return {
                    success: false,
                    message: 'Temporary parsing unavailable',
                };
            }
            const parsed = this.cleanupResponse(aiResponse);
            if (!parsed) {
                return { success: false, message: 'Unable to parse transaction' };
            }
            const validated = this.validate(parsed, categories, accounts);
            const missingRequired = this.getMissingRequiredFields(validated);
            return {
                success: true,
                requires_user_input: missingRequired.length > 0,
                missing_required_fields: missingRequired,
                data: validated,
            };
        }
        catch (error) {
            this.logger.error(`Parse transaction failed: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Temporary parsing unavailable',
            };
        }
    }
    preprocess(text) {
        return text
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase();
    }
    async fetchCategories(userId) {
        return this.prisma.category.findMany({
            where: { userId, isActive: true },
            select: { id: true, name: true, type: true },
            orderBy: { name: 'asc' },
        });
    }
    async fetchAccounts(userId) {
        return this.prisma.account.findMany({
            where: { userId, isActive: true },
            select: { id: true, name: true, type: true },
            orderBy: { name: 'asc' },
        });
    }
    buildPrompt(text, categories, accounts) {
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const yesterday = (0, dayjs_1.default)().subtract(1, 'day').format('YYYY-MM-DD');
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
    async callGemini(prompt) {
        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 500,
                    responseMimeType: 'application/json',
                },
            });
            const result = await model.generateContent(prompt);
            const response = result.response;
            return response.text();
        }
        catch (error) {
            this.logger.error(`Gemini API error: ${error.message}`);
            return null;
        }
    }
    cleanupResponse(raw) {
        try {
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
        }
        catch (error) {
            this.logger.error(`Failed to parse AI response: ${error.message}`);
            this.logger.debug(`Raw AI response: ${raw}`);
            return null;
        }
    }
    validate(data, categories, accounts) {
        const validCategoryIds = new Set(categories.map((c) => c.id));
        const validAccountIds = new Set(accounts.map((a) => a.id));
        if (data.amount !== null) {
            const num = Number(data.amount);
            if (isNaN(num) || num <= 0) {
                data.amount = null;
            }
            else {
                data.amount = Math.round(num * 100) / 100;
            }
        }
        if (data.category_id && !validCategoryIds.has(data.category_id)) {
            data.category_id = null;
            data.category_name = null;
        }
        if (data.account_id && !validAccountIds.has(data.account_id)) {
            data.account_id = null;
            data.account_name = null;
        }
        if (data.date) {
            const parsed = (0, dayjs_1.default)(data.date, 'YYYY-MM-DD', true);
            if (!parsed.isValid()) {
                data.date = (0, dayjs_1.default)().format('YYYY-MM-DD');
            }
        }
        else {
            data.date = (0, dayjs_1.default)().format('YYYY-MM-DD');
        }
        const validTypes = ['INCOME', 'EXPENSE', 'TRANSFER'];
        if (!validTypes.includes(data.transaction_type)) {
            data.transaction_type = 'EXPENSE';
        }
        if (data.merchant) {
            data.merchant = data.merchant.trim();
            if (data.merchant.length === 0)
                data.merchant = null;
        }
        return data;
    }
    getMissingRequiredFields(data) {
        const missing = [];
        if (data.amount === null) {
            missing.push('amount');
        }
        return missing;
    }
};
exports.ParseTransactionService = ParseTransactionService;
exports.ParseTransactionService = ParseTransactionService = ParseTransactionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        config_1.ConfigService])
], ParseTransactionService);
//# sourceMappingURL=parse-transaction.service.js.map