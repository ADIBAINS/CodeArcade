import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { login, logout, me, register } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";

export const authRoutes = Router();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT ?? 20),
  standardHeaders: true,
  legacyHeaders: false
});

authRoutes.post("/register", loginRateLimit, validate(registerSchema), register);
authRoutes.post("/login", loginRateLimit, validate(loginSchema), login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", authMiddleware, me);
