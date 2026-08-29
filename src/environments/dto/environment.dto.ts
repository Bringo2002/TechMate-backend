import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EnvironmentType, EnvironmentStatus } from '../entities/environment.entity';

export class UpdateEnvironmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: EnvironmentType })
  @IsOptional()
  @IsEnum(EnvironmentType)
  type?: EnvironmentType;

  @ApiPropertyOptional({ enum: EnvironmentStatus })
  @IsOptional()
  @IsEnum(EnvironmentStatus)
  status?: EnvironmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  uptime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  responseTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  errorRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  traffic?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  instances?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
