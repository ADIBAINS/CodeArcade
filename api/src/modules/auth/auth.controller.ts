import { Request, Response } from "express";
import { getSessionCookieName, getSessionCookieOptions } from "../../config/security";
import { asyncHandler } from "../../utils/asyncHandler";
import { loginUser, registerUser } from "./auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  setSessionCookie(res, result.token);
  res.status(201).json({ user: result.user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  setSessionCookie(res, result.token);
  res.json({ user: result.user });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(getSessionCookieName(), {
    ...getSessionCookieOptions(),
    maxAge: undefined
  });
  res.json({ success: true });
});

function setSessionCookie(res: Response, token: string) {
  res.cookie(getSessionCookieName(), token, getSessionCookieOptions());
}
