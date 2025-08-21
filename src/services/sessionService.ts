import prisma from "@/prismaClient";
import { v4 as uuid } from "uuid";

export const createSession = async (userId: string, ip?: string, userAgent?: string) => {
  const token = uuid(); // could also embed this into JWT jti
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  return prisma.session.create({
    data: { userId, token, ip, userAgent, expiresAt },
  });
};

export const getUserSessions = async (userId: string) => {
  return prisma.session.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
};

export const invalidateSession = async (token: string) => {
  return prisma.session.deleteMany({ where: { token } });
};

export const cleanupExpiredSessions = async () => {
  return prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
};
