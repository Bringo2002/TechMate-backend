import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { User } from '../users/entities/user.entity';

/**
 * Auth controller
 *
 * POST /api/auth/register  — create account (public)
 * POST /api/auth/login     — login (public)
 * POST /api/auth/refresh   — refresh access token (public — uses refresh token)
 * POST /api/auth/logout    — invalidate session (authenticated)
 * GET  /api/auth/me        — get current user (authenticated)
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.login(dto, ip, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — invalidate session' })
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  async me(@Req() req: Request & { user: User }) {
    return this.authService.getMe(req.user.id);
  }
}
