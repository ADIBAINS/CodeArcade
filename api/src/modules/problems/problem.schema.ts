import { z } from "zod";
import { paginationQuerySchema } from "../../utils/pagination";

// Canonical driver type system shared with the judge's FunctionAdapter.
// Nested arrays (e.g. int[][]) are rejected: drivers print 1-D arrays only.
const functionTypePattern = /^(int|long|double|boolean|char|String)(\[\])?$/;

const argumentTypesField = z
  .string()
  .max(200)
  .refine(
    (v) => v.trim() === "" || v.split(",").every((t) => functionTypePattern.test(t.trim())),
    { message: "argumentTypes must be a comma list of int, long, double, boolean, char, String or 1-D arrays" }
  );

const returnTypeField = z
  .string()
  .max(100)
  .refine((v) => functionTypePattern.test(v.trim()), {
    message: "returnType must be int, long, double, boolean, char, String or a 1-D array"
  });

export const problemListQuerySchema = z.object({
  query: paginationQuerySchema.partial().optional()
});

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
    statement: z.string().min(20).max(50000),
    inputFormat: z.string().min(5).max(10000),
    outputFormat: z.string().min(5).max(10000),
    constraints: z.string().min(5).max(10000),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    timeLimitMs: z.number().int().min(500).max(10000).default(2000),
    memoryLimitMb: z.number().int().min(64).max(1024).default(256)
    ,judgeMode: z.enum(["STDIN", "FUNCTION"]).default("STDIN")
    ,functionName: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).default("solve")
    ,argumentTypes: argumentTypesField.default("")
    ,returnType: returnTypeField.default("int")
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
    ,argumentTypes: argumentTypesField.optional()
    ,returnType: returnTypeField.optional()
  })
});
