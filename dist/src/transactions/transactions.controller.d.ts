import type { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionQueryDto } from './dto/transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(userId: string, query: TransactionQueryDto): Promise<import("../common").PaginatedResult<unknown>>;
    exportCsv(userId: string, from: string, to: string, res: Response): Promise<void>;
    exportXlsx(userId: string, from: string, to: string, res: Response): Promise<void>;
    create(userId: string, dto: CreateTransactionDto): Promise<any>;
    importTransactions(userId: string, transactions: CreateTransactionDto[]): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    update(userId: string, id: string, dto: UpdateTransactionDto): Promise<any>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
