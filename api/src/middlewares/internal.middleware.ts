import { NextFunction, Request, Response } from "express";
import { assertProductionSecret } from "../config/security";

export function internalMiddleware(req: Request, res: Response, next: NextFunction) {
  const expectedToken = assertProductionSecret("INTERNAL_JUDGE_TOKEN", [
    "judge-secret-token",
    "change-me",
    "change-me-use-openssl-rand-hex-32"
  ]);
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;

  if (!expectedToken || token !== expectedToken) {
    return res.status(401).json({ message: "Invalid internal judge token" });
  }

  next();
}
