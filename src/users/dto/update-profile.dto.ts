import { IsString, IsOptional, MinLength, MaxLength, IsUrl, IsEnum, IsBoolean, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums';
import { UserType } from '../entities/user.entity';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Brian Harrington' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  fullName?: string;

  @ApiPropertyOptional({ example: 'Full-stack developer from Nairobi' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'TechMate' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  /**
   * Self-service email change. No re-verification flow exists in this
   * backend yet (matches the prior Supabase-based behavior, which also
   * allowed a direct edit) — a real product would want to gate this
   * behind a confirmation email. Flagging, not silently "fixing" UX
   * that predates this migration. email is unique at the DB level, so
   * a collision surfaces as a save error, not silent data loss.
   */
  @ApiPropertyOptional({ example: 'brian@techmate.dev' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'bharrington' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @ApiPropertyOptional({ example: '+254712345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'https://techmate.dev' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'Founder' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @ApiPropertyOptional({ example: 'Nairobi, Kenya' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}

/**
 * Admin-only fields — deliberately separate from UpdateProfileDto so a
 * user can never set their own role/admin flag/active status through
 * the self-service PUT /users/profile route.
 */
export class AdminUpdateUserDto {
  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ enum: UserType })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
