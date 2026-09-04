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
import { NotificationsModule } from './notifications/notifications.module';
import { ProjectsModule } from './projects/projects.module';
import { InvoicesModule } from './invoices/invoices.module';
import { BusinessesModule } from './businesses/businesses.module';
import { ClientInquiriesModule } from './client-inquiries/client-inquiries.module';
import { ProposalsModule } from './proposals/proposals.module';
import { OrdersModule } from './orders/orders.module';
import { TeamsModule } from './teams/teams.module';
import { RevenueTargetsModule } from './revenue-targets/revenue-targets.module';
import { ServiceCategoriesModule } from './service-categories/service-categories.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { EnvironmentsModule } from './environments/environments.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { SupportTicketsModule } from './support-tickets/support-tickets.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { AdminMetricsModule } from './admin-metrics/admin-metrics.module';

@Module({
  imports: [
    // Load .env and make ConfigService available globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM — connects to Postgres using DATABASE_URL (Railway) or individual env vars
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');

        const connectionOptions = databaseUrl
          ? {
              url: databaseUrl,
              ssl: { rejectUnauthorized: false } as const,
            }
          : {
              host: config.get<string>('DB_HOST', 'localhost'),
              port: config.get<number>('DB_PORT', 5432),
              username: config.get<string>('DB_USERNAME', 'postgres'),
              password: config.get<string>('DB_PASSWORD', ''),
              database: config.get<string>('DB_NAME', 'techmate'),
            };

        return {
          type: 'postgres' as const,
          ...connectionOptions,
          autoLoadEntities: true,       // auto-registers entities from feature modules
          synchronize: config.get<string>('DB_SYNCHRONIZE') !== 'false', // Auto-creates all tables unless explicitly set to false
          logging: config.get<string>('NODE_ENV') !== 'production',
        };
      },
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
    NotificationsModule,
    ProjectsModule,
    InvoicesModule,
    BusinessesModule,
    ClientInquiriesModule,
    ProposalsModule,
    OrdersModule,
    TeamsModule,
    RevenueTargetsModule,
    ServiceCategoriesModule,
    ActivityLogsModule,
    EnvironmentsModule,
    DeploymentsModule,
    SupportTicketsModule,
    UserSettingsModule,
    AdminMetricsModule,
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
