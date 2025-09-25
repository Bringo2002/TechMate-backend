import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import { validateSession } from "../services/sessionService";

interface DecodedToken {
  id: string;
  jti: string;
}

const protect = async (
  req: Request & { user?: any; session?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 🔑 Get token from either Bearer header OR HttpOnly cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.token; // requires cookie-parser middleware

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // 🧾 Verify and decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    // 🔒 Validate session in DB
    const session = await validateSession(decoded.jti);
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // 👤 Fetch user (optimize if session has userId)
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // ✅ Attach to req
    req.user = user;
    req.session = session;

    return next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    console.error("Auth error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export { protect };
