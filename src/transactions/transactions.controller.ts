import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Res, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionQueryDto } from './dto/transaction.dto';
import { CurrentUser } from '../common';
import dayjs from 'dayjs';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions with filters and pagination' })
  findAll(@CurrentUser('id') userId: string, @Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(userId, query);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export transactions as CSV' })
  async exportCsv(
    @CurrentUser('id') userId: string,
    @Query('from') from: string, @Query('to') to: string, @Res() res: Response,
  ) {
    const data = await this.transactionsService.getExportData(userId, from, to);
    const csv = [
      'Date,Type,Category,Account,Amount,Note,Merchant,Status,Is Salary',
      ...data.map(tx => [
        dayjs(tx.transactionDate).format('YYYY-MM-DD HH:mm:ss'), tx.type,
        tx.category?.name || '', tx.account?.name || '', tx.amount.toString(),
        `"${(tx.note || '').replace(/"/g, '""')}"`, tx.merchant || '', tx.status, tx.isSalary,
      ].join(',')),
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${dayjs().format('YYYY-MM-DD')}.csv`);
    res.send(csv);
  }

  @Get('export/xlsx')
  @ApiOperation({ summary: 'Export transactions as XLSX' })
  async exportXlsx(
    @CurrentUser('id') userId: string,
    @Query('from') from: string, @Query('to') to: string, @Res() res: Response,
  ) {
    const ExcelJS = await import('exceljs');
    const data = await this.transactionsService.getExportData(userId, from, to);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Transactions');
    sheet.columns = [
      { header: 'Date', key: 'date', width: 20 }, { header: 'Type', key: 'type', width: 12 },
      { header: 'Category', key: 'category', width: 18 }, { header: 'Account', key: 'account', width: 18 },
      { header: 'Amount', key: 'amount', width: 15 }, { header: 'Note', key: 'note', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
    ];
    for (const tx of data) {
      sheet.addRow({
        date: dayjs(tx.transactionDate).format('YYYY-MM-DD HH:mm:ss'), type: tx.type,
        category: tx.category?.name || '', account: tx.account?.name || '',
        amount: Number(tx.amount), note: tx.note || '', status: tx.status,
      });
    }
    sheet.getRow(1).font = { bold: true };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  }

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(userId, dto);
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import transactions from JSON array' })
  importTransactions(@CurrentUser('id') userId: string, @Body() transactions: CreateTransactionDto[]) {
    return this.transactionsService.importTransactions(userId, transactions);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a transaction' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.transactionsService.remove(userId, id);
  }
}
