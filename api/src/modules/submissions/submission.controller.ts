import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { createSubmission, getSubmission, listMySubmissions, listProblemSubmissions } from "./submission.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await createSubmission(req.user!.id, req.body));
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getSubmission(req.params.id as string, { id: req.user!.id, role: req.user!.role }));
});

export const mine = asyncHandler(async (req: Request, res: Response) => {
  res.json(await listMySubmissions(req.user!.id, Number(req.query.page ?? 1), Number(req.query.limit ?? 20)));
});

export const byProblem = asyncHandler(async (req: Request, res: Response) => {
  res.json(await listProblemSubmissions(req.params.problemId as string, { id: req.user!.id, role: req.user!.role }, Number(req.query.page ?? 1), Number(req.query.limit ?? 20)));
});
