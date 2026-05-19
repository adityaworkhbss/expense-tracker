import { UserCustomizationService } from './user-customization.service';
import { UpdateUserCustomizationDto } from './dto/user-customization.dto';
export declare class UserCustomizationController {
    private readonly service;
    constructor(service: UserCustomizationService);
    get(userId: string): Promise<any>;
    update(userId: string, dto: UpdateUserCustomizationDto): Promise<any>;
}
