import { PrismaService } from '../prisma';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
export declare class BudgetsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<any>;
    create(userId: string, dto: CreateBudgetDto): Promise<any>;
    createMany(userId: string, dtos: CreateBudgetDto[]): Promise<any>;
    update(userId: string, id: string, dto: UpdateBudgetDto): Promise<any>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    getStatus(userId: string): Promise<any[]>;
}
