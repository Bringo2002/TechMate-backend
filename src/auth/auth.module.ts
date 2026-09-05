import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

import { Session } from './entities/session.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { PasswordResetToken } from './entities/token.entity';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // Import User repository from UsersModule
    UsersModule,

    // Register auth-owned entities
    TypeOrmModule.forFeature([Session, LoginAttempt, PasswordResetToken]),

    // Passport with JWT as default strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT configuration — reads secret and expiry from env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'techmate_jwt_secret_key_production_2026_fallback'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRATION', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
