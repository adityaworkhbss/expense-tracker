import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TransactionTypeEnum {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export enum TransactionStatusEnum {
  PENDING = 'PENDING',
  CLEARED = 'CLEARED',
  REVERSED = 'REVERSED',
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'EXPENSE' })
  @IsEnum(TransactionTypeEnum)
  type: TransactionTypeEnum;

  @ApiProperty({ example: 555.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({ example: '2026-05-12T18:30:00.000Z' })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({ description: 'Account ID' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Target account for transfers' })
  @IsOptional()
  @IsString()
  transferToAccountId?: string;

  @ApiPropertyOptional({ example: 'Dinner at restaurant' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 'Swiggy' })
  @IsOptional()
  @IsString()
  merchant?: string;

  @ApiPropertyOptional({ example: 'Credit Card' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: ['food', 'weekend'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ enum: TransactionStatusEnum, default: 'CLEARED' })
  @IsOptional()
  @IsEnum(TransactionStatusEnum)
  status?: TransactionStatusEnum;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSalary?: boolean;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  type?: TransactionTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transferToAccountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  merchant?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TransactionStatusEnum)
  status?: TransactionStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSalary?: boolean;
}

export class TransactionQueryDto {
  @ApiPropertyOptional({ description: 'From date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'To date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ enum: TransactionTypeEnum })
  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  type?: TransactionTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;
}
