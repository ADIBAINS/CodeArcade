import { NextFunction, Request, Response } from "express";
import { getSessionCookieName } from "../config/security";
import { prisma } from "../db/prisma";
import { verifyToken } from "../utils/jwt";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid authentication token" });
  }
}

export async function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = getBearerToken(req);

  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (user) {
      req.user = user;
    }
  } catch {
    // Optional auth deliberately ignores invalid tokens.
  }

  next();
}

function getBearerToken(req: Request) {
  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }

  const cookieToken = req.cookies?.[getSessionCookieName()];
  return typeof cookieToken === "string" ? cookieToken : null;
}
