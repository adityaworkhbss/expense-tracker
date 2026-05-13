import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'Aditya Sharma' }) @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ example: 'Asia/Kolkata' }) @IsOptional() @IsString() timezone?: string;
  @ApiPropertyOptional({ example: 'INR' }) @IsOptional() @IsString() currency?: string;
}

export class UpdateSalaryRuleDto {
  @ApiPropertyOptional({ example: 10 }) @IsOptional() @Type(() => Number) @IsNumber() salaryDay?: number;
  @ApiPropertyOptional({ example: 87500 }) @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) expectedAmount?: number;
  @ApiPropertyOptional({ example: 10 }) @IsOptional() @Type(() => Number) @IsNumber() cycleStartDay?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
  @ApiPropertyOptional({ example: 'Asia/Kolkata' }) @IsOptional() @IsString() timezone?: string;
}
