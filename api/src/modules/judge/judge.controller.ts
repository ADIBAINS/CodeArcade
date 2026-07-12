import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { fetchPendingSubmissions, saveJudgeResult } from "./judge.service";

export const pending = asyncHandler(async (req: Request, res: Response) => {
  res.json(await fetchPendingSubmissions(req.body.limit));
});

export const results = asyncHandler(async (req: Request, res: Response) => {
  const submission = await saveJudgeResult(req.body);
  res.json({ success: true, submission });
});

