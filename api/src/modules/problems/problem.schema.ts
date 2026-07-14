import { z } from "zod";

export const problemParamsSchema = z.object({
  params: z.object({
    slug: z.string().min(1)
  })
});

export const problemIdParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

export const createProblemSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    slug: z
      .string()
      .min(3)
      .max(120)
      .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers and hyphens only")
      .optional(),
    statement: z.string().min(20),
    inputFormat: z.string().min(5),
    outputFormat: z.string().min(5),
    constraints: z.string().min(5),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    timeLimitMs: z.number().int().min(500).max(10000).default(2000),
    memoryLimitMb: z.number().int().min(64).max(1024).default(256)
    ,judgeMode: z.enum(["STDIN", "FUNCTION"]).default("STDIN")
    ,functionName: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).default("solve")
    ,argumentTypes: z.string().max(200).default("")
    ,returnType: z.string().max(100).default("int")
  })
});

export const updateProblemSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    slug: z
      .string()
      .min(3)
      .max(120)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    statement: z.string().min(20).optional(),
    inputFormat: z.string().min(5).optional(),
    outputFormat: z.string().min(5).optional(),
    constraints: z.string().min(5).optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    timeLimitMs: z.number().int().min(500).max(10000).optional(),
    memoryLimitMb: z.number().int().min(64).max(1024).optional()
    ,judgeMode: z.enum(["STDIN", "FUNCTION"]).optional()
    ,functionName: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).optional()
    ,argumentTypes: z.string().max(200).optional()
    ,returnType: z.string().max(100).optional()
  })
});
