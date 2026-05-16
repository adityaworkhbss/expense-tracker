import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';

export class CreateEmiDto {
  @ApiProperty({ example: 'Home Loan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'account-uuid' })
  @IsString()
  @IsOptional()
  accountId?: string;

  @ApiPropertyOptional({ example: 'transaction-uuid', description: 'Original transaction if any' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  principal: number;

  @ApiProperty({ example: 60, description: 'Tenure in months' })
  @IsNumber()
  @Min(1)
  tenure: number;

  @ApiProperty({ example: 10000, description: 'Monthly EMI amount' })
  @IsNumber()
  @Min(0)
  monthlyEmi: number;

  @ApiProperty({ example: '2024-01-05' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-06-05' })
  @IsDateString()
  nextDueDate: string;

  @ApiPropertyOptional({ example: 5, description: 'Months already crossed' })
  @IsNumber()
  @IsOptional()
  monthsPaid?: number;
}

export class UpdateEmiDto {
  @ApiPropertyOptional({ example: 'Home Loan Update' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 10000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyEmi?: number;

  @ApiPropertyOptional({ example: '2024-07-05' })
  @IsDateString()
  @IsOptional()
  nextDueDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  active?: boolean;
}
