import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../prismaClient";
import generateToken from "../utils/generateToken";
import jwt from "jsonwebtoken";

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

    // IP-based rate limiting here 
    const MAX_IP_ATTEMPTS = 10; // Max failed attempts per IP
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
      return res.status(429).json({
        message: `Too many login attempts from this IP. Try again in ${IP_WINDOW_MINUTES} minutes.`,
      });
    }
    // End IP-based rate limiting 

    // fetch user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { loginAttempts: { orderBy: { createdAt: 'desc' }, take: 5 } } // get last 5 attempts
    });

    if (!user) {
      await prisma.loginAttempt.create({
        data: { email, ip: req.ip || "unknown", success: false }
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if account is locked due to too many failed attempts
    const failedAttempts = user.loginAttempts.filter(a => !a.success);
    const lastFailed = failedAttempts[0];

    if (failedAttempts.length >= 5 && lastFailed && Date.now() - new Date(lastFailed.createdAt).getTime() < 15 * 60 * 1000) {
      return res.status(429).json({ message: "Account temporarily locked. Try again in 15 minutes." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    await prisma.loginAttempt.create({
      data: { userId: user.id, ip: req.ip || "unknown", success: isPasswordValid }
    });

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

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
