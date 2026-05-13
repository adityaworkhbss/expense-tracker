import { RecurringService } from './recurring.service';
import { CreateRecurringDto, UpdateRecurringDto } from './dto/recurring.dto';
export declare class RecurringController {
    private readonly recurringService;
    constructor(recurringService: RecurringService);
    findAll(userId: string): Promise<any>;
    create(userId: string, dto: CreateRecurringDto): Promise<any>;
    update(userId: string, id: string, dto: UpdateRecurringDto): Promise<any>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
