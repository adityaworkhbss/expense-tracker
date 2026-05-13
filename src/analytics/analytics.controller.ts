import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../common';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('excel-dashboard')
  @ApiOperation({ summary: 'Get comprehensive Excel-like dashboard summary' })
  getExcelDashboard(@CurrentUser('id') userId: string) {
    return this.analyticsService.getExcelDashboard(userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get overall summary: today, week, month, salary-cycle totals' })
  getSummary(@CurrentUser('id') userId: string) {
    return this.analyticsService.getSummary(userId);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily totals for a date range' })
  @ApiQuery({ name: 'from', required: true, example: '2026-04-01' })
  @ApiQuery({ name: 'to', required: true, example: '2026-05-12' })
  getDaily(@CurrentUser('id') userId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.analyticsService.getDaily(userId, from, to);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly totals for a date range' })
  @ApiQuery({ name: 'from', required: true }) @ApiQuery({ name: 'to', required: true })
  getWeekly(@CurrentUser('id') userId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.analyticsService.getWeekly(userId, from, to);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly totals for a date range' })
  @ApiQuery({ name: 'from', required: true }) @ApiQuery({ name: 'to', required: true })
  getMonthly(@CurrentUser('id') userId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.analyticsService.getMonthly(userId, from, to);
  }

  @Get('category-wise')
  @ApiOperation({ summary: 'Get category-wise expense totals' })
  @ApiQuery({ name: 'from', required: true }) @ApiQuery({ name: 'to', required: true })
  getCategoryWise(@CurrentUser('id') userId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.analyticsService.getCategoryWise(userId, from, to);
  }

  @Get('cashflow')
  @ApiOperation({ summary: 'Get cashflow (income vs expense) over time' })
  @ApiQuery({ name: 'from', required: true }) @ApiQuery({ name: 'to', required: true })
  getCashflow(@CurrentUser('id') userId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.analyticsService.getCashflow(userId, from, to);
  }

  @Get('salary-cycle/current')
  @ApiOperation({ summary: 'Get current salary cycle analytics' })
  getCurrentSalaryCycle(@CurrentUser('id') userId: string) {
    return this.analyticsService.getCurrentSalaryCycle(userId);
  }

  @Get('salary-cycle/history')
  @ApiOperation({ summary: 'Get salary cycle history (last 12 cycles)' })
  getSalaryCycleHistory(@CurrentUser('id') userId: string) {
    return this.analyticsService.getSalaryCycleHistory(userId);
  }
}
