import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditCardDto, UpdateCreditCardDto } from './dto/credit-card.dto';
export declare class CreditCardsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateCreditCardDto): Promise<any>;
    findAll(userId: string): Promise<any>;
    findOne(userId: string, id: string): Promise<any>;
    update(userId: string, id: string, dto: UpdateCreditCardDto): Promise<any>;
    remove(userId: string, id: string): Promise<any>;
}
