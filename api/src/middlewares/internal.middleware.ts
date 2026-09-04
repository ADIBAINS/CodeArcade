import { timingSafeEqual } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { assertProductionSecret } from "../config/security";

function tokensEqual(expected: string, actual: string) {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(actual, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function internalMiddleware(req: Request, res: Response, next: NextFunction) {
  let expectedToken: string;
  try {
    expectedToken = assertProductionSecret("INTERNAL_JUDGE_TOKEN", [
      "judge-secret-token",
      "change-me",
      "change-me-use-openssl-rand-hex-32"
    ]);
  } catch {
    return res.status(500).json({ message: "Judge integration is not configured" });
  }
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;

  if (!expectedToken || !token || !tokensEqual(expectedToken, token)) {
    return res.status(401).json({ message: "Invalid internal judge token" });
  }

  next();
}
