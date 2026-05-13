import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CategoryTypeEnum {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Dining' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CategoryTypeEnum, example: 'EXPENSE' })
  @IsEnum(CategoryTypeEnum)
  type: CategoryTypeEnum;

  @ApiPropertyOptional({ description: 'Parent category ID for hierarchy' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: '#FF6B6B' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'utensils' })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: CategoryTypeEnum })
  @IsOptional()
  @IsEnum(CategoryTypeEnum)
  type?: CategoryTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
