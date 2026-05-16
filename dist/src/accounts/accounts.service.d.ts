import { PrismaService } from '../prisma';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
export declare class AccountsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<any>;
    findOne(userId: string, id: string): Promise<any>;
    create(userId: string, dto: CreateAccountDto): Promise<any>;
    createMany(userId: string, dtos: CreateAccountDto[]): Promise<any>;
    update(userId: string, id: string, dto: UpdateAccountDto): Promise<any>;
    remove(userId: string, id: string): Promise<any>;
    recalculateBalance(accountId: string): Promise<void>;
}
