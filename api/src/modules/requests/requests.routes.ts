import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  adminApprove,
  adminDetail,
  adminReject,
  adminSetInReview,
  adminUpdate,
  create,
  detail,
  listAll,
  mine
} from "./requests.controller";
import {
  createRequestSchema,
  listRequestsQuerySchema,
  rejectRequestSchema,
  requestIdParamsSchema,
  updateRequestSchema
} from "./requests.schema";

export const requestRoutes = Router();

requestRoutes.use(authMiddleware);

// User endpoints
requestRoutes.post("/", validate(createRequestSchema), create);
requestRoutes.get("/mine", mine);
requestRoutes.get("/:id", validate(requestIdParamsSchema), detail);

// Admin endpoints
requestRoutes.get("/admin/all", adminMiddleware, validate(listRequestsQuerySchema), listAll);
requestRoutes.get("/admin/:id", adminMiddleware, validate(requestIdParamsSchema), adminDetail);
requestRoutes.put("/admin/:id", adminMiddleware, validate(updateRequestSchema), adminUpdate);
requestRoutes.post("/admin/:id/approve", adminMiddleware, validate(requestIdParamsSchema), adminApprove);
requestRoutes.post("/admin/:id/reject", adminMiddleware, validate(rejectRequestSchema), adminReject);
requestRoutes.post("/admin/:id/in-review", adminMiddleware, validate(requestIdParamsSchema), adminSetInReview);
