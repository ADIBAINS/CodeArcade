import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { paginationQuerySchema } from "../../utils/pagination";
import { list } from "./leaderboard.controller";
import { z } from "zod";

export const leaderboardRoutes = Router();

const leaderboardQuerySchema = z.object({ query: paginationQuerySchema });

leaderboardRoutes.get("/", validate(leaderboardQuerySchema), list);

