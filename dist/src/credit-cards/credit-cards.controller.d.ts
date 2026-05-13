import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto, UpdateCreditCardDto } from './dto/credit-card.dto';
export declare class CreditCardsController {
    private readonly creditCardsService;
    constructor(creditCardsService: CreditCardsService);
    create(req: any, createCreditCardDto: CreateCreditCardDto): Promise<any>;
    findAll(req: any): Promise<any>;
    findOne(req: any, id: string): Promise<any>;
    update(req: any, id: string, updateCreditCardDto: UpdateCreditCardDto): Promise<any>;
    remove(req: any, id: string): Promise<any>;
}
