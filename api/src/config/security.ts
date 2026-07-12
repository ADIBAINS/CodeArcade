import { CookieOptions } from "express";

const SESSION_COOKIE_NAME = "codearcade_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function getRequiredEnv(key: string) {
  const value = process.env[key];

  if (!value?.trim()) {
    throw new Error(`${key} is required`);
  }

  return value;
}

export function assertProductionSecret(key: string, rejectedValues: string[]) {
  const value = getRequiredEnv(key);

  if (process.env.NODE_ENV === "production" && rejectedValues.includes(value)) {
    throw new Error(`${key} must be changed before running in production`);
  }

  return value;
}

export function getAllowedOrigins() {
  const configured = process.env.CORS_ORIGIN ?? process.env.FRONTEND_ORIGIN;

  if (!configured?.trim()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CORS_ORIGIN or FRONTEND_ORIGIN is required in production");
    }

    return ["http://localhost:3000"];
  }

  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getSessionCookieName() {
  return process.env.SESSION_COOKIE_NAME?.trim() || SESSION_COOKIE_NAME;
}

export function getSessionCookieOptions(): CookieOptions {
  const sameSite = process.env.COOKIE_SAME_SITE === "lax" ? "lax" : process.env.NODE_ENV === "production" ? "none" : "lax";

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite,
    maxAge: SESSION_MAX_AGE_MS,
    path: "/",
    domain: process.env.COOKIE_DOMAIN?.trim() || undefined
  };
}
