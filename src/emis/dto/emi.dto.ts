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

  @ApiPropertyOptional({ example: 'transaction-uuid' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional({ example: 500000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  principal?: number;

  @ApiPropertyOptional({ example: 60, description: 'Tenure in months' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  tenure?: number;

  @ApiPropertyOptional({ example: 10000, description: 'Monthly amount (alias for monthlyEmi)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 10000, description: 'Monthly EMI amount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyEmi?: number;

  @ApiPropertyOptional({ example: 'emi' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: '2024-01-05' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2029-01-05' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: '2024-06-05' })
  @IsDateString()
  @IsOptional()
  nextDueDate?: string;

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

  @ApiPropertyOptional({ example: 10000, description: 'Monthly amount (alias for monthlyEmi)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

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
