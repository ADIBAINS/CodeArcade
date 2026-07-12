import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { authMiddleware, optionalAuthMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { create, list } from "./testcase.controller";
import { createTestCaseSchema, testCaseProblemParamsSchema } from "./testcase.schema";

export const testcaseRoutes = Router({ mergeParams: true });

testcaseRoutes.get("/", optionalAuthMiddleware, validate(testCaseProblemParamsSchema), list);
testcaseRoutes.post("/", authMiddleware, adminMiddleware, validate(createTestCaseSchema), create);

