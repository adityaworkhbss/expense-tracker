import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCreditCardDto {
  @ApiProperty({ example: 'HDFC Regalia' })
  @IsString()
  @IsNotEmpty()
  cardName: string;

  @ApiProperty({ example: 'uuid-account-id' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  limit: number;

  @ApiProperty({ example: 15, description: 'Day of the month for statement generation' })
  @IsNumber()
  @Min(1)
  statementDate: number;

  @ApiProperty({ example: 20, description: 'Number of days after statement when payment is due' })
  @IsNumber()
  @Min(0)
  dueDays: number;
}

export class UpdateCreditCardDto {
  @ApiPropertyOptional({ example: 'HDFC Regalia' })
  @IsString()
  @IsOptional()
  cardName?: string;

  @ApiPropertyOptional({ example: 150000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  statementDate?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  dueDays?: number;
}
