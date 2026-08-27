import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

import { User } from './users/entities/user.entity';
import { Service } from './services/entities/service.entity';
import { Role } from './common/enums';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'techmate',
  entities: [User, Service],
  synchronize: false,
  logging: true,
});

async function seed() {
  console.log('🌱 Starting database seed...');
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const serviceRepo = AppDataSource.getRepository(Service);

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

  // 3. Default Services
  const defaultServices = [
    {
      name: 'Web Application Development',
      description: 'Custom React / Next.js web applications, e-commerce, and SaaS platforms.',
      price: 2500,
      deliveryDays: 14,
      isActive: true,
    },
    {
      name: 'Mobile App Development',
      description: 'Cross-platform iOS and Android mobile apps built with React Native / Flutter.',
      price: 3500,
      deliveryDays: 21,
      isActive: true,
    },
    {
      name: 'API & Microservices Architecture',
      description: 'Scalable NestJS REST & GraphQL APIs, microservices, and database design.',
      price: 1800,
      deliveryDays: 10,
      isActive: true,
    },
    {
      name: 'UI/UX Design & Prototyping',
      description: 'Figma prototypes, UI component libraries, design systems, and UX audits.',
      price: 1200,
      deliveryDays: 7,
      isActive: true,
    },
  ];

  for (const svcData of defaultServices) {
    const existing = await serviceRepo.findOne({ where: { name: svcData.name } });
    if (!existing) {
      const svc = serviceRepo.create(svcData);
      await serviceRepo.save(svc);
      console.log(`✅ Service created: ${svcData.name}`);
    }
  }

  console.log('🎉 Seeding finished successfully!');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
