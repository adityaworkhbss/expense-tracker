import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto, UpdateSalaryRuleDto } from './dto/settings.dto';
import { CurrentUser } from '../common';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user settings and salary rule' })
  getSettings(@CurrentUser('id') userId: string) {
    return this.settingsService.getSettings(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update user settings' })
  updateSettings(@CurrentUser('id') userId: string, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(userId, dto);
  }

  @Put('salary-rule')
  @ApiOperation({ summary: 'Update salary rule' })
  updateSalaryRule(@CurrentUser('id') userId: string, @Body() dto: UpdateSalaryRuleDto) {
    return this.settingsService.updateSalaryRule(userId, dto);
  }
}
