import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getLeaderboard } from "./leaderboard.service";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getLeaderboard());
});

