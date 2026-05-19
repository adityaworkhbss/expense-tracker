import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserCustomizationDto {
  @ApiPropertyOptional({ description: 'Enable AI-powered transaction entry', default: false })
  @IsOptional()
  @IsBoolean()
  aiTransaction?: boolean;

  @ApiPropertyOptional({ description: 'Enable reminders', default: false })
  @IsOptional()
  @IsBoolean()
  reminder?: boolean;
}
