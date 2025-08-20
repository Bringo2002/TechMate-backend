import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";

const protect = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        res.status(401).json({ message: "Not authorized" });
        return;
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ message: "Token failed" });
    }
  } else {
    res.status(401).json({ message: "No token, authorization denied" });
  }
};

export { protect };
