import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'Web Development' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Full-stack web application development' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 25000 })
  @IsOptional()
  @IsNumber()
  price?: number;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Web Development' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Full-stack web application development' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 30000 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
