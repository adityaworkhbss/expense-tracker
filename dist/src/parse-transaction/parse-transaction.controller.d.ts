import { ParseTransactionService } from './parse-transaction.service';
import { ParseTransactionDto } from './dto/parse-transaction.dto';
import { UserCustomizationService } from '../user-customization/user-customization.service';
export declare class ParseTransactionController {
    private readonly parseService;
    private readonly customizationService;
    constructor(parseService: ParseTransactionService, customizationService: UserCustomizationService);
    parse(userId: string, dto: ParseTransactionDto): Promise<import("./parse-transaction.service").ParseTransactionResponse>;
}
