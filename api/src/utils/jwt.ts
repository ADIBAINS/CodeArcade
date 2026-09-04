import jwt from "jsonwebtoken";
import { assertProductionSecret } from "../config/security";

export type JwtPayload = {
  userId: string;
  role: "USER" | "ADMIN";
};

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "24h" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

function getJwtSecret() {
  return assertProductionSecret("JWT_SECRET", [
    "replace-this-with-a-long-secret",
    "change-me",
    "change-me-use-openssl-rand-hex-32"
  ]);
}
