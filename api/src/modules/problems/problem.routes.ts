import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { authMiddleware, optionalAuthMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { count, create, detail, list, remove, update } from "./problem.controller";
import { createProblemSchema, problemIdParamsSchema, problemParamsSchema, updateProblemSchema } from "./problem.schema";

export const problemRoutes = Router();

problemRoutes.get("/", list);
problemRoutes.get("/count", count);
problemRoutes.get("/:slug", optionalAuthMiddleware, validate(problemParamsSchema), detail);
problemRoutes.post("/", authMiddleware, adminMiddleware, validate(createProblemSchema), create);
problemRoutes.put("/:id", authMiddleware, adminMiddleware, validate(updateProblemSchema), update);
problemRoutes.delete("/:id", authMiddleware, adminMiddleware, validate(problemIdParamsSchema), remove);
