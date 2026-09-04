import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { getAllowedOrigins } from "./config/security";
import { disconnectPrisma, prisma } from "./db/prisma";
import { authMiddleware } from "./middlewares/auth.middleware";
import { requestIdMiddleware, requestLogger } from "./middlewares/requestId.middleware";
import { validate } from "./middlewares/validate.middleware";
import { Prisma } from "@prisma/client";
import { authRoutes } from "./modules/auth/auth.routes";
import { judgeRoutes } from "./modules/judge/judge.routes";
import { leaderboardRoutes } from "./modules/leaderboard/leaderboard.routes";
import { problemRoutes } from "./modules/problems/problem.routes";
import { requestRoutes } from "./modules/requests/requests.routes";
import { byProblem, mine } from "./modules/submissions/submission.controller";
import { submissionRoutes } from "./modules/submissions/submission.routes";
import { mySubmissionsQuerySchema, problemSubmissionsParamsSchema } from "./modules/submissions/submission.schema";
import { testcaseRoutes } from "./modules/testcases/testcase.routes";
import { ApiError } from "./utils/ApiError";

export const app = express();

const trustProxy = Number(process.env.TRUST_PROXY ?? (process.env.NODE_ENV === "production" ? 1 : 0));
if (Number.isSafeInteger(trustProxy) && trustProxy > 0) {
  app.set("trust proxy", trustProxy);
}

function parseLimit(raw: string | undefined, fallback: number) {
  const value = Number(raw ?? fallback);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

const allowedOrigins = getAllowedOrigins();

app.use(requestIdMiddleware);
app.use(requestLogger);
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
  limit: parseLimit(process.env.GLOBAL_RATE_LIMIT, 300),
  skip: (req) => req.path.startsWith("/api/internal/judge"),
  standardHeaders: true,
  legacyHeaders: false
}));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

const judgeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: parseLimit(process.env.JUDGE_RATE_LIMIT, 600),
  standardHeaders: true,
  legacyHeaders: false
});

const submissionRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: parseLimit(process.env.SUBMISSION_RATE_LIMIT, 10),
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/readyz", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch {
    res.status(503).json({ message: "Database not ready" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/problems/:problemId/testcases", testcaseRoutes);
app.use("/api/submissions", (req, res, next) => {
  if (req.method === "POST") {
    return submissionRateLimit(req, res, next);
  }

  return next();
}, submissionRoutes);
// Legacy aliases for the canonical /api/submissions routes below; kept for
// backwards compatibility and validated identically.
app.get("/api/users/me/submissions", authMiddleware, validate(mySubmissionsQuerySchema), mine);
app.get("/api/problems/:problemId/submissions", authMiddleware, validate(problemSubmissionsParamsSchema), byProblem);
app.use("/api/internal/judge", judgeRateLimit, judgeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/requests", requestRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Resource already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Resource not found" });
    }
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

export async function closeApp() {
  await disconnectPrisma();
}
