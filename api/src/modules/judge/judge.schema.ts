import { z } from "zod";

export const pendingSubmissionsSchema = z.object({
  body: z.object({
    limit: z.number().int().min(1).max(50).default(5)
  })
});

export const judgeResultSchema = z.object({
  body: z.object({
    submissionId: z.string().min(1),
    verdict: z.enum(["AC", "WA", "CE", "RE", "TLE", "MLE"]),
    passedTests: z.number().int().min(0).max(1000),
    totalTests: z.number().int().min(0).max(1000),
    executionTimeMs: z.number().int().nonnegative().optional(),
    errorMessage: z.string().nullable().optional(),
    failedTestInput: z.string().nullable().optional(),
    expectedOutput: z.string().nullable().optional(),
    actualOutput: z.string().max(20000).nullable().optional()
  }).refine((v) => v.passedTests <= v.totalTests, {
    message: "passedTests must not exceed totalTests",
    path: ["passedTests"]
  })
});
