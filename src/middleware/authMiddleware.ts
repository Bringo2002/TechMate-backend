import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import { validateSession } from "../services/sessionService";

const protect = async (
  req: Request & { user?: any; session?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      // 🔑 Decode JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; jti: string };

      // 🔒 Validate session against DB
      const session = await validateSession(decoded.jti);
      if (!session) {
        res.status(401).json({ message: "Session expired or revoked" });
        return;
      }

      // 👤 Attach user
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        res.status(401).json({ message: "Not authorized" });
        return;
      }

      req.user = user;
      req.session = session; // store session for later use
      next();
    } catch (err) {
      console.error("Auth error:", err);
      res.status(401).json({ message: "Token failed" });
    }
  } else {
    res.status(401).json({ message: "No token, authorization denied" });
  }
};

export { protect };
