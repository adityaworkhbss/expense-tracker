import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
export declare class BudgetsController {
    private readonly budgetsService;
    constructor(budgetsService: BudgetsService);
    findAll(userId: string): Promise<any>;
    getStatus(userId: string): Promise<any[]>;
    create(userId: string, dto: CreateBudgetDto): Promise<any>;
    update(userId: string, id: string, dto: UpdateBudgetDto): Promise<any>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
