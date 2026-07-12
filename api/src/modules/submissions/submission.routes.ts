import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { byProblem, create, detail, mine } from "./submission.controller";
import { createSubmissionSchema, problemSubmissionsParamsSchema, submissionIdParamsSchema } from "./submission.schema";

export const submissionRoutes = Router();

submissionRoutes.post("/", authMiddleware, validate(createSubmissionSchema), create);
submissionRoutes.get("/me", authMiddleware, mine);
submissionRoutes.get("/problem/:problemId", authMiddleware, validate(problemSubmissionsParamsSchema), byProblem);
submissionRoutes.get("/:id", authMiddleware, validate(submissionIdParamsSchema), detail);
