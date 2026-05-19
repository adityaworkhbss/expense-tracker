import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';
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
export declare class ParseTransactionService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private genAI;
    constructor(prisma: PrismaService, config: ConfigService);
    parseTransaction(userId: string, rawText: string): Promise<ParseTransactionResponse>;
    private preprocess;
    private fetchCategories;
    private fetchAccounts;
    private buildPrompt;
    private callGemini;
    private cleanupResponse;
    private validate;
    private getMissingRequiredFields;
}
