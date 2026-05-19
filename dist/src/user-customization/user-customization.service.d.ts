import { PrismaService } from '../prisma';
import { UpdateUserCustomizationDto } from './dto/user-customization.dto';
export declare class UserCustomizationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    get(userId: string): Promise<any>;
    update(userId: string, dto: UpdateUserCustomizationDto): Promise<any>;
}
