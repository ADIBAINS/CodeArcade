import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getLeaderboard } from "./leaderboard.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  res.json(await getLeaderboard(page, limit));
});

