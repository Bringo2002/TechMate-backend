// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

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

  // Users
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'hashed_password_1', // hash in prod
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'hashed_password_2',
    },
  });

  // Services (match schema: name, price, provider)
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

  // Post (uses author/authorId)
  const post = await prisma.post.create({
    data: {
      title: 'Why You Need a Professional Website',
      content: 'A professional website boosts credibility and conversions.',
      author: { connect: { id: alice.id } },
    },
  });

  // Comment on the post
  await prisma.comment.create({
    data: {
      content: 'Totally agree — it’s a trust signal.',
      post: { connect: { id: post.id } },
      author: { connect: { id: bob.id } },
    },
  });

  // Booking (no status in your schema; just date + relations)
  await prisma.booking.create({
    data: {
      date: new Date(), // or a specific date
      service: { connect: { id: webDev.id } },
      user: { connect: { id: bob.id } },
    },
  });

  // Review (comment is required in your schema)
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

  console.log('✅ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
