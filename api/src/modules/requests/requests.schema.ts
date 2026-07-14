import { z } from "zod";

export const createRequestSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    statement: z.string().min(20),
    inputFormat: z.string().min(5),
    outputFormat: z.string().min(5),
    constraints: z.string().min(5),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"])
  })
});

export const requestIdParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

export const updateRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    statement: z.string().min(20).optional(),
    inputFormat: z.string().min(5).optional(),
    outputFormat: z.string().min(5).optional(),
    constraints: z.string().min(5).optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional()
  })
});

export const rejectRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    adminNotes: z.string().min(3).max(2000)
  })
});

export const listRequestsQuerySchema = z.object({
  query: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "IN_REVIEW"]).optional()
  })
});
