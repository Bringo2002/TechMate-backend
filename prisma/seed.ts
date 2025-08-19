// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear tables in FK-safe order
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  // Pre-hash passwords
  const adminPass = await bcrypt.hash('admin123', 10);
  const alicePass = await bcrypt.hash('user123', 10);
  const bobPass   = await bcrypt.hash('user123', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@techmate.com',
      password: adminPass,
      role: 'ADMIN',
    },
  });

  // Users
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: alicePass,
      role: 'USER',
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: bobPass,
      role: 'USER',
    },
  });

  // Services
  const webDev = await prisma.service.create({
    data: {
      name: 'Web Development',
      price: 1200,
      provider: { connect: { id: alice.id } },
    },
  });

  const appDev = await prisma.service.create({
    data: {
      name: 'Mobile App Development',
      price: 2500,
      provider: { connect: { id: bob.id } },
    },
  });

  // Post
  const post = await prisma.post.create({
    data: {
      title: 'Why You Need a Professional Website',
      content: 'A professional website boosts credibility and conversions.',
      author: { connect: { id: alice.id } },
    },
  });

  // Comment
  await prisma.comment.create({
    data: {
      content: 'Totally agree — it’s a trust signal.',
      post: { connect: { id: post.id } },
      author: { connect: { id: bob.id } },
    },
  });

  // Booking
  await prisma.booking.create({
    data: {
      date: new Date(),
      service: { connect: { id: webDev.id } },
      user: { connect: { id: bob.id } },
    },
  });

  // Review
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Excellent work and great communication!',
      service: { connect: { id: webDev.id } },
      user: { connect: { id: bob.id } },
    },
  });

  // Messages
  await prisma.message.createMany({
    data: [
      {
        senderId: alice.id,
        receiverId: bob.id,
        content: 'Hi Bob, thanks for reaching out about your app!',
      },
      {
        senderId: bob.id,
        receiverId: alice.id,
        content: 'Hi Alice, excited to work together!',
      },
    ],
  });

  console.log('✅ Database seed completed with Admin + Users + Demo data!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

