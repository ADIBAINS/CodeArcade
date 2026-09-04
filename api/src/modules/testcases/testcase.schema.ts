import { z } from "zod";
import { paginationQuerySchema } from "../../utils/pagination";

export const testCaseProblemParamsSchema = z.object({
  params: z.object({
    problemId: z.string().min(1)
  }),
  query: z.object({
    page: paginationQuerySchema.shape.page.optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  }).optional()
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

