import { z } from "zod";

export const testCaseProblemParamsSchema = z.object({
  params: z.object({
    problemId: z.string().min(1)
  })
});

export const createTestCaseSchema = z.object({
  params: z.object({
    problemId: z.string().min(1)
  }),
  body: z.object({
    input: z.string().min(1),
    expected: z.string().min(1),
    isHidden: z.boolean().default(true)
  })
});

