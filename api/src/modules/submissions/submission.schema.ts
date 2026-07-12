import { z } from "zod";

export const createSubmissionSchema = z.object({
  body: z.object({
    problemId: z.string().min(1),
    language: z.enum(["JAVA", "CPP"]),
    sourceCode: z.string().min(20, "Code is too short").max(20000, "Code is too large")
  })
});

export const submissionIdParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

export const problemSubmissionsParamsSchema = z.object({
  params: z.object({
    problemId: z.string().min(1)
  })
});

