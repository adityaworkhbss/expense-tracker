import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'Aditya Sharma', required: false })
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Asia/Kolkata', required: false })
  @IsString()
  timezone?: string;

  @ApiProperty({ example: 'INR', required: false })
  @IsString()
  currency?: string;
}



export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
