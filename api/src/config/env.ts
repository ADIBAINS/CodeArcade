import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  INTERNAL_JUDGE_TOKEN: z.string().min(16, "INTERNAL_JUDGE_TOKEN must be at least 16 characters"),
  CORS_ORIGIN: z.string().optional(),
  FRONTEND_ORIGIN: z.string().optional(),
  GLOBAL_RATE_LIMIT: z.coerce.number().int().min(1).max(100000).default(300),
  AUTH_RATE_LIMIT: z.coerce.number().int().min(1).max(10000).default(20),
  SUBMISSION_RATE_LIMIT: z.coerce.number().int().min(1).max(10000).default(10),
  JUDGE_RESULT_RETRY_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  JUDGE_STALE_THRESHOLD_MS: z.coerce.number().int().min(5000).max(3600000).default(60000),
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  if (parsed.data.NODE_ENV === "production") {
    const weak = ["replace-this-with-a-long-secret", "change-me", "change-me-use-openssl-rand-hex-32", "codearcade", "admin123"];
    for (const key of ["JWT_SECRET", "INTERNAL_JUDGE_TOKEN"] as const) {
      if (weak.includes(parsed.data[key])) {
        throw new Error(`${key} must be changed before running in production`);
      }
    }
  }
  cached = parsed.data;
  return cached;
}

/** Test-only hook to reset the cached env between tests. */
export function resetEnvCache() {
  cached = null;
}
