import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { RequestsModule } from './requests/requests.module';

@Module({
  imports: [
    // Load .env and make ConfigService available globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM — connects to Postgres using env vars
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'techmate'),
        autoLoadEntities: true,       // auto-registers entities from feature modules
        synchronize: false,           // NEVER true in production — use migrations
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    // Rate limiting — replaces the old express-rate-limit middleware
    ThrottlerModule.forRoot([{
      ttl: 60000,   // 60 seconds window
      limit: 30,    // 30 requests per window per IP
    }]),

    // Feature modules
    UsersModule,
    AuthModule,
    MessagesModule,
    RequestsModule,
  ],
  controllers: [],
  providers: [
    // Global guards — applied in this order:
    // 1. Throttler (rate limiting)
    // 2. JwtAuth (authentication — skippable with @Public())
    // 3. Roles (authorization — skippable without @Roles())
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
