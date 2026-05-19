import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParseTransactionDto {
  @ApiProperty({
    description: 'Natural language text describing a transaction',
    example: 'paid 450 to zomato using credit card yesterday',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
