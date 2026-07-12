import { Router } from "express";
import { internalMiddleware } from "../../middlewares/internal.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { pending, results } from "./judge.controller";
import { judgeResultSchema, pendingSubmissionsSchema } from "./judge.schema";

export const judgeRoutes = Router();

judgeRoutes.post("/pending", internalMiddleware, validate(pendingSubmissionsSchema), pending);
judgeRoutes.post("/results", internalMiddleware, validate(judgeResultSchema), results);

