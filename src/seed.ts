import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

import { User } from './users/entities/user.entity';
import { Role } from './common/enums';

const baseOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      type: 'postgres' as const,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'techmate',
    };

const AppDataSource = new DataSource({
  ...baseOptions,
  entities: [User],
  synchronize: false,
  logging: true,
});

async function seed() {
  console.log('🌱 Starting database seed...');
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  // 1. Admin User
  const adminEmail = 'admin@techmate.com';
  let admin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
    admin = userRepo.create({
      fullName: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      emailVerified: true,
    });
    await userRepo.save(admin);
    console.log('✅ Admin user created: admin@techmate.com / AdminPassword123!');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // 2. Sample Client User
  const clientEmail = 'client@techmate.com';
  let client = await userRepo.findOne({ where: { email: clientEmail } });
  if (!client) {
    const hashedPassword = await bcrypt.hash('ClientPassword123!', 10);
    client = userRepo.create({
      fullName: 'John Client',
      email: clientEmail,
      password: hashedPassword,
      role: Role.USER,
      emailVerified: true,
    });
    await userRepo.save(client);
    console.log('✅ Sample client created: client@techmate.com / ClientPassword123!');
  } else {
    console.log('ℹ️ Client user already exists');
  }

  console.log('🎉 Seeding finished successfully!');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
