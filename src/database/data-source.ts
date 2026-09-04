import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * TypeORM DataSource for CLI commands (migrations).
 * This is NOT used at runtime — NestJS uses TypeOrmModule.forRootAsync() instead.
 * Kept in sync manually: if you change DB config in app.module.ts, update here too.
 *
 * Supports Railway's DATABASE_URL or individual DB_* env vars.
 */
const baseOptions: DataSourceOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'techmate',
    };

export default new DataSource({
  ...baseOptions,
  // Scan ALL feature-module entity dirs (not just database/entities)
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
