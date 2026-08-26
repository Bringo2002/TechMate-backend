import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Brian Harrington' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'brian@techmate.co.ke' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ss1', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
