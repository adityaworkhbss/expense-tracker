import { PrismaService } from '../prisma';
export declare class AggregationService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    recalculateDaily(userId: string, date: Date): Promise<void>;
    recalculateMonthly(userId: string, date: Date): Promise<void>;
    recalculateForTransaction(userId: string, transactionDate: Date): Promise<void>;
    fullRebuild(userId: string): Promise<void>;
}
