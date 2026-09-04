import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { createTestCase, listTestCases } from "./testcase.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await createTestCase(req.params.problemId as string, req.body));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const includeHidden = req.user?.role === "ADMIN";
  res.json(await listTestCases(req.params.problemId as string, includeHidden, Number(req.query.page ?? 1), Math.min(Number(req.query.limit ?? 100), 100)));
});
