import { IsUUID, IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Theme, ColorMode, AiPersonality, DataUsage } from '../entities/user-settings.entity';

export class UpsertUserSettingsDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ enum: Theme })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiPropertyOptional({ enum: ColorMode })
  @IsOptional()
  @IsEnum(ColorMode)
  colorMode?: ColorMode;

  @ApiPropertyOptional({ enum: AiPersonality })
  @IsOptional()
  @IsEnum(AiPersonality)
  aiPersonality?: AiPersonality;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aiVoice?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reduceMotion?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  highContrast?: boolean;

  @ApiPropertyOptional({ enum: DataUsage })
  @IsOptional()
  @IsEnum(DataUsage)
  dataUsage?: DataUsage;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoSave?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notificationEmail?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notificationPush?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notificationSms?: boolean;
}
