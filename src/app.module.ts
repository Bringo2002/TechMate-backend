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
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentsModule } from './payments/payments.module';
import { ProjectsModule } from './projects/projects.module';
import { InvoicesModule } from './invoices/invoices.module';
import { BusinessesModule } from './businesses/businesses.module';
import { ClientInquiriesModule } from './client-inquiries/client-inquiries.module';
import { ProposalsModule } from './proposals/proposals.module';
import { OrdersModule } from './orders/orders.module';
import { TeamsModule } from './teams/teams.module';

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
    DashboardModule,
    NotificationsModule,
    ServicesModule,
    BookingsModule,
    ReviewsModule,
    PaymentsModule,
    ProjectsModule,
    InvoicesModule,
    BusinessesModule,
    ClientInquiriesModule,
    ProposalsModule,
    OrdersModule,
    TeamsModule,
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
