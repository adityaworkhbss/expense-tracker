import { SettingsService } from './settings.service';
import { UpdateSettingsDto, UpdateSalaryRuleDto } from './dto/settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(userId: string): Promise<{
        user: any;
        salaryRule: any;
    }>;
    updateSettings(userId: string, dto: UpdateSettingsDto): Promise<any>;
    updateSalaryRule(userId: string, dto: UpdateSalaryRuleDto): Promise<any>;
}
