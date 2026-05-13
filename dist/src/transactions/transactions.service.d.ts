import { PrismaService } from '../prisma';
import { AccountsService } from '../accounts/accounts.service';
import { AggregationService } from './aggregation.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionQueryDto } from './dto/transaction.dto';
export declare class TransactionsService {
    private readonly prisma;
    private readonly accountsService;
    private readonly aggregationService;
    private readonly logger;
    constructor(prisma: PrismaService, accountsService: AccountsService, aggregationService: AggregationService);
    findAll(userId: string, query: TransactionQueryDto): Promise<import("../common").PaginatedResult<unknown>>;
    findOne(userId: string, id: string): Promise<any>;
    create(userId: string, dto: CreateTransactionDto): Promise<any>;
    update(userId: string, id: string, dto: UpdateTransactionDto): Promise<any>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    importTransactions(userId: string, transactions: CreateTransactionDto[]): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    getExportData(userId: string, from?: string, to?: string): Promise<any>;
}
