import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { CurrentUser } from '../common';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'List all budgets' })
  findAll(@CurrentUser('id') userId: string) {
    return this.budgetsService.findAll(userId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get budget status with actual vs limit' })
  getStatus(@CurrentUser('id') userId: string) {
    return this.budgetsService.getStatus(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a budget' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a budget' })
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.budgetsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.budgetsService.remove(userId, id);
  }
}
