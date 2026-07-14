import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  approveRequest,
  createRequest,
  getAllRequests,
  getRequestById,
  getUserRequests,
  rejectRequest,
  setInReview,
  updateRequest
} from "./requests.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const request = await createRequest(userId, req.body);
  res.status(201).json(request);
});

export const mine = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const requests = await getUserRequests(userId);
  res.json(requests);
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const request = await getRequestById(req.params.id as string);

  if (req.user!.role !== "ADMIN" && request.userId !== req.user!.id) {
    return res.status(403).json({ message: "Unauthorized to view this request" });
  }

  res.json(request);
});

export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const requests = await getAllRequests(status);
  res.json(requests);
});

export const adminDetail = asyncHandler(async (req: Request, res: Response) => {
  const request = await getRequestById(req.params.id as string);
  res.json(request);
});

export const adminUpdate = asyncHandler(async (req: Request, res: Response) => {
  const updated = await updateRequest(req.params.id as string, req.body);
  res.json(updated);
});

export const adminApprove = asyncHandler(async (req: Request, res: Response) => {
  const result = await approveRequest(req.params.id as string, req.user!.id);
  res.json(result);
});

export const adminReject = asyncHandler(async (req: Request, res: Response) => {
  const result = await rejectRequest(req.params.id as string, req.user!.id, req.body.adminNotes);
  res.json(result);
});

export const adminSetInReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await setInReview(req.params.id as string, req.user!.id);
  res.json(result);
});
