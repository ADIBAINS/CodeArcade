import { Router } from "express";
import { list } from "./leaderboard.controller";

export const leaderboardRoutes = Router();

leaderboardRoutes.get("/", list);

