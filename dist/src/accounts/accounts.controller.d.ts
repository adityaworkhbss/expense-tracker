import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    findAll(userId: string): Promise<any>;
    create(userId: string, dto: CreateAccountDto | CreateAccountDto[]): Promise<any>;
    update(userId: string, id: string, dto: UpdateAccountDto): Promise<any>;
    remove(userId: string, id: string): Promise<any>;
}
