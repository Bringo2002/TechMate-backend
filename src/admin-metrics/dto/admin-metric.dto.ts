import { IsDateString, IsOptional, IsInt, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminMetricDto {
  @ApiProperty()
  @IsDateString()
  metricDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalUsers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  activeUsers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  newUsers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalProjects?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  activeProjects?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalOrders?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  completedOrders?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalRevenue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pendingRevenue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalRequests?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  openRequests?: number;
}
