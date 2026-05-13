import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum RecurringFrequencyEnum {
  DAILY = 'DAILY', WEEKLY = 'WEEKLY', MONTHLY = 'MONTHLY', YEARLY = 'YEARLY', CUSTOM = 'CUSTOM',
}
export enum RecurringTypeEnum {
  INCOME = 'INCOME', EXPENSE = 'EXPENSE', TRANSFER = 'TRANSFER',
}

export class CreateRecurringDto {
  @ApiProperty() @IsString() accountId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiProperty({ enum: RecurringTypeEnum }) @IsEnum(RecurringTypeEnum) type: RecurringTypeEnum;
  @ApiProperty({ example: 10000 }) @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) amount: number;
  @ApiProperty({ enum: RecurringFrequencyEnum }) @IsEnum(RecurringFrequencyEnum) frequency: RecurringFrequencyEnum;
  @ApiProperty() @IsDateString() nextRunAt: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class UpdateRecurringDto {
  @ApiPropertyOptional() @IsOptional() @IsString() accountId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional({ enum: RecurringTypeEnum }) @IsOptional() @IsEnum(RecurringTypeEnum) type?: RecurringTypeEnum;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) amount?: number;
  @ApiPropertyOptional({ enum: RecurringFrequencyEnum }) @IsOptional() @IsEnum(RecurringFrequencyEnum) frequency?: RecurringFrequencyEnum;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextRunAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}
