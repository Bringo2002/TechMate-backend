import prisma from "@/prismaClient";
import { v4 as uuid } from "uuid";

export const createSession = async (userId: string, ip?: string, userAgent?: string) => {
  const token = uuid(); // could also embed this into JWT jti
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  return prisma.session.create({
    data: { userId, token, ip, userAgent, expiresAt, valid: true, revoked: false },
  });
};

export const getUserSessions = async (userId: string) => {
  return prisma.session.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
};

export const invalidateSession = async (token: string) => {
  return prisma.session.updateMany({
    where: { token },
    data: { valid: false, revoked: true },
  });
};

export const cleanupExpiredSessions = async () => {
  return prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
};

// ✅ New function: validate a session before trusting it
export const validateSession = async (token: string) => {
  const session = await prisma.session.findFirst({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (!session.valid || session.revoked) return null;
  if (new Date() > session.expiresAt) return null;

  return session; // trusted + active
};
