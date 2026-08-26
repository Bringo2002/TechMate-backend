import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import { User } from '../users/entities/user.entity';
import { Session } from './entities/session.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const SALT_ROUNDS = 10;
const MAX_IP_ATTEMPTS = 10;
const IP_WINDOW_MINUTES = 15;
const MAX_ACCOUNT_ATTEMPTS = 5;
const ACCOUNT_LOCK_MINUTES = 15;
const SESSION_EXPIRY_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,

    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepo: Repository<LoginAttempt>,

    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ──────────────────────────────────────────
  // REGISTER
  // ──────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Check for existing user
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });
    await this.userRepo.save(user);

    // Create session + tokens
    const { accessToken, sessionToken } = await this.createTokens(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken: sessionToken,
    };
  }

  // ──────────────────────────────────────────
  // LOGIN
  // ──────────────────────────────────────────
  async login(dto: LoginDto, ip: string, userAgent: string) {
    // ── IP-based rate limiting ──
    const ipCutoff = new Date(Date.now() - IP_WINDOW_MINUTES * 60 * 1000);
    const recentIpAttempts = await this.loginAttemptRepo.count({
      where: {
        ip,
        success: false,
        createdAt: MoreThan(ipCutoff),
      },
    });

    if (recentIpAttempts >= MAX_IP_ATTEMPTS) {
      throw new HttpException(
        `Too many login attempts from this IP. Try again in ${IP_WINDOW_MINUTES} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // ── Find user ──
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    if (!user) {
      // Record failed attempt (no userId — user doesn't exist)
      await this.recordLoginAttempt(null, dto.email, ip, false);
      throw new UnauthorizedException('Invalid credentials');
    }

    // ── Account lockout check ──
    const lockCutoff = new Date(Date.now() - ACCOUNT_LOCK_MINUTES * 60 * 1000);
    const recentFailedAttempts = await this.loginAttemptRepo.count({
      where: {
        userId: user.id,
        success: false,
        createdAt: MoreThan(lockCutoff),
      },
    });

    if (recentFailedAttempts >= MAX_ACCOUNT_ATTEMPTS) {
      throw new HttpException(
        'Account temporarily locked. Try again in 15 minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // ── Validate password ──
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    // Record attempt (success or fail)
    await this.recordLoginAttempt(user.id, user.email, ip, isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ── Success — create session + tokens ──
    const { accessToken, sessionToken } = await this.createTokens(user, ip, userAgent);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken: sessionToken,
    };
  }

  // ──────────────────────────────────────────
  // REFRESH
  // ──────────────────────────────────────────
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const session = await this.sessionRepo.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!session || !session.valid || session.revoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > session.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Issue new access token (session stays the same)
    const accessToken = this.signAccessToken(session.user);

    return {
      accessToken,
      user: this.sanitizeUser(session.user),
    };
  }

  // ──────────────────────────────────────────
  // LOGOUT
  // ──────────────────────────────────────────
  async logout(refreshToken: string) {
    if (!refreshToken) return;

    await this.sessionRepo.update(
      { token: refreshToken },
      { valid: false, revoked: true },
    );
  }

  // ──────────────────────────────────────────
  // GET CURRENT USER (for /me)
  // ──────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  // ══════════════════════════════════════════
  // PRIVATE HELPERS
  // ══════════════════════════════════════════

  private signAccessToken(user: User): string {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return this.jwtService.sign(payload);
  }

  private async createTokens(user: User, ip?: string, userAgent?: string) {
    const accessToken = this.signAccessToken(user);

    // Create a DB-backed session (acts as refresh token)
    const sessionToken = uuid();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const session = this.sessionRepo.create({
      userId: user.id,
      token: sessionToken,
      ip: ip || null,
      userAgent: userAgent || null,
      expiresAt,
      valid: true,
      revoked: false,
    });
    await this.sessionRepo.save(session);

    return { accessToken, sessionToken };
  }

  private async recordLoginAttempt(
    userId: string | null,
    email: string | null,
    ip: string,
    success: boolean,
  ) {
    const attempt = this.loginAttemptRepo.create({ userId, email, ip, success });
    await this.loginAttemptRepo.save(attempt);
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user;
    return safe;
  }
}
