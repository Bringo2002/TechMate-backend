import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { camelCaseRequestMiddleware } from './common/middleware/camel-case-request.middleware';
import { SnakeCaseResponseInterceptor } from './common/interceptors/snake-case-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads', 'avatars');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded files statically at /uploads/*
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Global prefix — all routes start with /api
  app.setGlobalPrefix('api');

  // Security headers
  app.use(helmet());

  // Cookie parsing (for refresh tokens)
  app.use(cookieParser());

  // Converts incoming snake_case request bodies (what the frontend's
  // Insert/Update types send) to camelCase before DTOs/ValidationPipe see
  // them. See common/utils/case-transform.util.ts for why this exists.
  app.use(camelCaseRequestMiddleware);

  // CORS — support single origin, comma-separated origins, or Vercel previews
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive CORS for smooth frontend-backend connection
    },
    credentials: true,
  });

  // Global validation pipe — strips unknown properties, transforms types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Converts every outgoing response body to snake_case, matching the
  // frontend's existing types. Pairs with the middleware above.
  app.useGlobalInterceptors(new SnakeCaseResponseInterceptor());

  // Swagger API docs — available at /api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TechMate API')
    .setDescription('TechMate backend API — NestJS + TypeORM + PostgreSQL')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 TechMate API running on http://localhost:${port}/api`);
  console.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
