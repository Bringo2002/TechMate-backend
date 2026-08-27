import {
  IsUUID,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  Min,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProposalStatus } from '../entities/proposal.entity';

export class CreateProposalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  inquiryId?: string;

  @ApiProperty()
  @IsUUID()
  createdBy: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  executiveSummary?: string;

  @ApiProperty()
  @IsString()
  scopeOfWork: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  deliverables?: unknown[];

  @ApiProperty()
  @IsInt()
  @Min(1)
  timelineWeeks: number;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  milestones?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assumptions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exclusions?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalCost: number;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  paymentSchedule?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateProposalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  executiveSummary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scopeOfWork?: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  deliverables?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  timelineWeeks?: number;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  milestones?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCost?: number;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  paymentSchedule?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ enum: ProposalStatus })
  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class RespondToProposalDto {
  @ApiProperty({ enum: [ProposalStatus.ACCEPTED, ProposalStatus.REJECTED] })
  @IsEnum(ProposalStatus)
  status: ProposalStatus.ACCEPTED | ProposalStatus.REJECTED;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientNotes?: string;

  @ApiPropertyOptional({ description: 'Required in practice when status is rejected' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
