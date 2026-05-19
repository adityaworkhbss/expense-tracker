import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserCustomizationService } from './user-customization.service';
import { UpdateUserCustomizationDto } from './dto/user-customization.dto';
import { CurrentUser } from '../common';

@ApiTags('User Customization')
@ApiBearerAuth()
@Controller('user-customization')
export class UserCustomizationController {
  constructor(private readonly service: UserCustomizationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user customization flags (ai_transaction, reminder)' })
  get(@CurrentUser('id') userId: string) {
    return this.service.get(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update user customization flags' })
  update(@CurrentUser('id') userId: string, @Body() dto: UpdateUserCustomizationDto) {
    return this.service.update(userId, dto);
  }
}
