import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { login, logout, me, register } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", authMiddleware, me);
