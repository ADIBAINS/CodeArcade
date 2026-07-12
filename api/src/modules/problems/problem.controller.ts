import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { createProblem, deleteProblem, getProblemBySlug, listProblems, updateProblem } from "./problem.service";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await listProblems());
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const includeHidden = req.user?.role === "ADMIN";
  res.json(await getProblemBySlug(req.params.slug as string, includeHidden));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await createProblem(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await updateProblem(req.params.id as string, req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  res.json(await deleteProblem(req.params.id as string));
});
