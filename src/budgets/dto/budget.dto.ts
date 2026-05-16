import { IsString, IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum BudgetPeriodEnum {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  SALARY_CYCLE = 'SALARY_CYCLE',
  CUSTOM = 'CUSTOM',
}

export class CreateBudgetDto {
  @ApiPropertyOptional({ description: 'Category ID (null = overall budget)', nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @ApiProperty({ enum: BudgetPeriodEnum })
  @IsEnum(BudgetPeriodEnum)
  periodType: BudgetPeriodEnum;

  @ApiProperty({ example: 5000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  limitAmount: number;

  @ApiProperty({ example: '2026-05-10' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2026-06-09' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateBudgetDto {
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() categoryId?: string | null;
  @ApiPropertyOptional({ enum: BudgetPeriodEnum }) @IsOptional() @IsEnum(BudgetPeriodEnum) periodType?: BudgetPeriodEnum;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) limitAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
}
