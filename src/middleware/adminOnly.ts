// ======================================
// FILE: src/middleware/adminOnly.ts
// ======================================
import { Request, Response, NextFunction } from "express";


export function adminOnly(req: Request, res: Response, next: NextFunction) {
// assumes req.user is set by your auth middleware
const user: any = (req as any).user;
if (!user) return res.status(401).json({ message: "Unauthorized" });
if (user.role !== "ADMIN" && user.role !== "MANAGER") {
return res.status(403).json({ message: "Forbidden" });
}
next();
}