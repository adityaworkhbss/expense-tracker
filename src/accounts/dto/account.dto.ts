import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum AccountTypeEnum {
  PAY_NOW = 'PAY_NOW',
  PAY_LATER = 'PAY_LATER',
}

export class CreateAccountDto {
  @ApiProperty({ example: 'HDFC Bank' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: AccountTypeEnum, example: 'BANK' })
  @IsEnum(AccountTypeEnum)
  type: AccountTypeEnum;

  @ApiPropertyOptional({ example: 5000.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  openingBalance?: number;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'HDFC Savings' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: AccountTypeEnum })
  @IsOptional()
  @IsEnum(AccountTypeEnum)
  type?: AccountTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
