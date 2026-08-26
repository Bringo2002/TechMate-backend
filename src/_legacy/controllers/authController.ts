import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prismaClient.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import { sendNotification } from "../services/notificationService.js";;
import { createSession } from "../services/sessionService.js";


export const register = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "USER" },
    });

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    // IP-based rate limiting
    const MAX_IP_ATTEMPTS = 10; 
    const IP_WINDOW_MINUTES = 15;

    const ipCutoff = new Date(Date.now() - IP_WINDOW_MINUTES * 60 * 1000);
    const recentIpAttempts = await prisma.loginAttempt.count({
      where: {
        ip,
        success: false,
        createdAt: { gte: ipCutoff },
      },
    });

    if (recentIpAttempts >= MAX_IP_ATTEMPTS) {
      // 🚨 notify about suspicious IP
      await sendNotification(
        null,
        "LOGIN_ALERT",
        `IP ${ip} temporarily blocked due to too many failed login attempts.`
      );

      return res.status(429).json({
        message: `Too many login attempts from this IP. Try again in ${IP_WINDOW_MINUTES} minutes.`,
      });
    }

    // fetch user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { loginAttempts: { orderBy: { createdAt: 'desc' }, take: 5 } }
    });

    if (!user) {
      await prisma.loginAttempt.create({
        data: { email, ip, success: false }
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if account is locked due to too many failed attempts
    const failedAttempts = user.loginAttempts.filter(a => !a.success);
    const lastFailed = failedAttempts[0];

    if (
      failedAttempts.length >= 5 && 
      lastFailed && 
      Date.now() - new Date(lastFailed.createdAt).getTime() < 15 * 60 * 1000
    ) {
      // 🚨 notify about locked account
      await sendNotification(
        user.id,
        "LOGIN_ALERT",
        `Account locked due to too many failed attempts.`
      );

      return res.status(429).json({ message: "Account temporarily locked. Try again in 15 minutes." });
    }

    // validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    await prisma.loginAttempt.create({
      data: { userId: user.id, ip, success: isPasswordValid }
    });

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a new session after successful login
    const session = await createSession(user.id, req.ip, req.headers["user-agent"] || "unknown");
    

    // ✅ success (optional: later add geo check here)
    // await sendNotification({
    //   userId: user.id,
    //   email: user.email,
    //   type: "LOGIN_ALERT",
    //   message: `Successful login from new location: ${ip}.`
    // });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const refresh = async (req: Request, res: Response): Promise<Response | void> => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    return res.json({ token: generateToken(decoded.id) });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


export default { register, login, refresh };
