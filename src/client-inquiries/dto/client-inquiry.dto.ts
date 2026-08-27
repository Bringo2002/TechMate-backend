import {
  IsUUID,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  InquiryProjectType,
  InquiryStatus,
  InquiryPriority,
} from '../entities/client-inquiry.entity';

export class CreateInquiryDto {
  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiProperty({ enum: InquiryProjectType })
  @IsEnum(InquiryProjectType)
  projectType: InquiryProjectType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  budgetRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  budgetMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  budgetMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredTimeline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ enum: InquiryPriority })
  @IsOptional()
  @IsEnum(InquiryPriority)
  priority?: InquiryPriority;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  requirements?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateInquiryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  budgetRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  budgetMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  budgetMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredTimeline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ enum: InquiryStatus })
  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;

  @ApiPropertyOptional({ enum: InquiryPriority })
  @IsOptional()
  @IsEnum(InquiryPriority)
  priority?: InquiryPriority;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  requirements?: unknown[];
}

export class AssignInquiryDto {
  @ApiProperty()
  @IsUUID()
  userId: string;
}
