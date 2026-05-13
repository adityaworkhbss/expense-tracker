import { PrismaService } from '../prisma';
import { CreateRecurringDto, UpdateRecurringDto } from './dto/recurring.dto';
export declare class RecurringService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<any>;
    create(userId: string, dto: CreateRecurringDto): Promise<any>;
    update(userId: string, id: string, dto: UpdateRecurringDto): Promise<any>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    processDueRecurring(): Promise<number>;
    private calculateNextRun;
}
