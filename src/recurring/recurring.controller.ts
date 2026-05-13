import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecurringService } from './recurring.service';
import { CreateRecurringDto, UpdateRecurringDto } from './dto/recurring.dto';
import { CurrentUser } from '../common';

@ApiTags('Recurring Transactions')
@ApiBearerAuth()
@Controller('recurring-transactions')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get()
  @ApiOperation({ summary: 'List all recurring transactions' })
  findAll(@CurrentUser('id') userId: string) {
    return this.recurringService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a recurring transaction' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateRecurringDto) {
    return this.recurringService.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a recurring transaction' })
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateRecurringDto) {
    return this.recurringService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recurring transaction' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.recurringService.remove(userId, id);
  }
}
