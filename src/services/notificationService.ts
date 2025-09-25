import nodemailer from "nodemailer";
import axios from "axios";
import prisma from "../prismaClient.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNotification(userId: string | null, type: string, message: string) {
  // Save to DB
  const notification = await prisma.notification.create({
    data: { userId, type, message },
  });

  // Email (if user has one)
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      await transporter.sendMail({
        from: `"TechMate" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `Notification: ${type}`,
        text: message,
      });
    }
  }

  // Telegram (global ops channel)
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `🔔 ${type}: ${message}`,
      }
    );
  }

  return notification;
}
