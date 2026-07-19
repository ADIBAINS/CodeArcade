import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { getAllowedOrigins } from "./config/security";
import { authMiddleware } from "./middlewares/auth.middleware";
import { validate } from "./middlewares/validate.middleware";
import { authRoutes } from "./modules/auth/auth.routes";
import { judgeRoutes } from "./modules/judge/judge.routes";
import { leaderboardRoutes } from "./modules/leaderboard/leaderboard.routes";
import { problemRoutes } from "./modules/problems/problem.routes";
import { requestRoutes } from "./modules/requests/requests.routes";
import { byProblem, mine } from "./modules/submissions/submission.controller";
import { submissionRoutes } from "./modules/submissions/submission.routes";
import { problemSubmissionsParamsSchema } from "./modules/submissions/submission.schema";
import { testcaseRoutes } from "./modules/testcases/testcase.routes";
import { ApiError } from "./utils/ApiError";

export const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = getAllowedOrigins();

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.GLOBAL_RATE_LIMIT ?? 300),
  skip: (req) => req.path.startsWith("/api/internal/judge"),
  standardHeaders: true,
  legacyHeaders: false
}));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT ?? 20),
  standardHeaders: true,
  legacyHeaders: false
});

const submissionRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.SUBMISSION_RATE_LIMIT ?? 10),
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRateLimit, authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/problems/:problemId/testcases", testcaseRoutes);
app.use("/api/submissions", (req, res, next) => {
  if (req.method === "POST") {
    return submissionRateLimit(req, res, next);
  }

  return next();
}, submissionRoutes);
app.get("/api/users/me/submissions", authMiddleware, mine);
app.get("/api/problems/:problemId/submissions", authMiddleware, validate(problemSubmissionsParamsSchema), byProblem);
app.use("/api/internal/judge", judgeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/requests", requestRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});
