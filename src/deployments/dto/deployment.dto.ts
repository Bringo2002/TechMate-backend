import {
  IsUUID,
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsNumber,
  IsInt,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeploymentStatus, DeploymentTriggerType } from '../entities/deployment.entity';
import { StageStatus } from '../entities/deployment-stage.entity';
import { LogLevel } from '../entities/deployment-log.entity';

export class CreateDeploymentStageDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsInt()
  stageOrder: number;

  @ApiPropertyOptional({ enum: StageStatus })
  @IsOptional()
  @IsEnum(StageStatus)
  status?: StageStatus;
}

export class CreateDeploymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  environmentId?: string;

  @ApiProperty()
  @IsString()
  projectName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  environmentName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branch?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commitHash?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commitMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  triggeredBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  triggeredByName?: string;

  @ApiPropertyOptional({ enum: DeploymentTriggerType })
  @IsOptional()
  @IsEnum(DeploymentTriggerType)
  triggerType?: DeploymentTriggerType;

  @ApiPropertyOptional({
    type: [CreateDeploymentStageDto],
    description: 'Defaults to the standard 6-stage pipeline (Clone/Install/Build/Test/Deploy/Verify) if omitted.',
  })
  @IsOptional()
  @IsArray()
  stages?: CreateDeploymentStageDto[];
}

export class UpdateDeploymentDto {
  @ApiPropertyOptional({ enum: DeploymentStatus })
  @IsOptional()
  @IsEnum(DeploymentStatus)
  status?: DeploymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  progress?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentStage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  buildMetrics?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  lighthouse?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration?: number;
}

export class UpdateDeploymentStageDto {
  @ApiPropertyOptional({ enum: StageStatus })
  @IsOptional()
  @IsEnum(StageStatus)
  status?: StageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  logs?: string[];
}

export class AddDeploymentLogDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stageName?: string;

  @ApiPropertyOptional({ enum: LogLevel })
  @IsOptional()
  @IsEnum(LogLevel)
  level?: LogLevel;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;
}

export class RequestApprovalDto {
  @ApiProperty()
  @IsUUID()
  requestedBy: string;

  @ApiProperty()
  @IsString()
  requestedByName: string;
}

export class ResolveApprovalDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @ApiProperty()
  @IsUUID()
  reviewerId: string;

  @ApiProperty()
  @IsString()
  reviewerName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SearchDeploymentsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  environmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  pageSize?: number;
}

export class PromoteDeploymentDto {
  @ApiProperty()
  @IsUUID()
  targetEnvironmentId: string;

  @ApiProperty()
  @IsUUID()
  promoterId: string;
}
