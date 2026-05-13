import { PrismaService } from '../prisma';
import { UpdateSettingsDto, UpdateSalaryRuleDto } from './dto/settings.dto';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSettings(userId: string): Promise<{
        user: any;
        salaryRule: any;
    }>;
    updateSettings(userId: string, dto: UpdateSettingsDto): Promise<any>;
    updateSalaryRule(userId: string, dto: UpdateSalaryRuleDto): Promise<any>;
}
