import { IsUUID, IsString, IsOptional, IsEnum, IsNumber, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeamMemberRole, TeamDepartment, Seniority, TeamMemberStatus } from '../entities/team-member.entity';
import { ProjectRoleOnProject, AllocationStatus } from '../entities/developer-allocation.entity';

export class CreateTeamMemberDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ enum: TeamMemberRole })
  @IsOptional()
  @IsEnum(TeamMemberRole)
  role?: TeamMemberRole;

  @ApiPropertyOptional({ enum: TeamDepartment })
  @IsOptional()
  @IsEnum(TeamDepartment)
  department?: TeamDepartment;

  @ApiPropertyOptional({ enum: Seniority })
  @IsOptional()
  @IsEnum(Seniority)
  seniority?: Seniority;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  availability?: number;

  @ApiPropertyOptional({ enum: TeamMemberStatus })
  @IsOptional()
  @IsEnum(TeamMemberStatus)
  status?: TeamMemberStatus;
}

export class UpdateTeamMemberDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ enum: TeamMemberRole })
  @IsOptional()
  @IsEnum(TeamMemberRole)
  role?: TeamMemberRole;

  @ApiPropertyOptional({ enum: TeamDepartment })
  @IsOptional()
  @IsEnum(TeamDepartment)
  department?: TeamDepartment;

  @ApiPropertyOptional({ enum: Seniority })
  @IsOptional()
  @IsEnum(Seniority)
  seniority?: Seniority;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  availability?: number;

  @ApiPropertyOptional({ enum: TeamMemberStatus })
  @IsOptional()
  @IsEnum(TeamMemberStatus)
  status?: TeamMemberStatus;
}

export class CreateAllocationDto {
  @ApiProperty()
  @IsUUID()
  teamMemberId: string;

  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ enum: ProjectRoleOnProject })
  @IsOptional()
  @IsEnum(ProjectRoleOnProject)
  roleOnProject?: ProjectRoleOnProject;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  allocationPct?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hoursEstimated?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAllocationDto {
  @ApiPropertyOptional({ enum: ProjectRoleOnProject })
  @IsOptional()
  @IsEnum(ProjectRoleOnProject)
  roleOnProject?: ProjectRoleOnProject;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  allocationPct?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hoursEstimated?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hoursLogged?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: AllocationStatus })
  @IsOptional()
  @IsEnum(AllocationStatus)
  status?: AllocationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
