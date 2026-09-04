import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incoming = req.headers["x-request-id"];
  const requestId = (Array.isArray(incoming) ? incoming[0] : incoming)?.trim() || randomUUID();
  (req as Request & { requestId?: string }).requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const requestId = (req as Request & { requestId?: string }).requestId ?? "-";
    // Structured, greppable single-line log (no extra deps).
    console.log(
      JSON.stringify({
        level: res.statusCode >= 500 ? "error" : "info",
        msg: "http_request",
        method: req.method,
        path: req.originalUrl ?? req.url,
        status: res.statusCode,
        durationMs: Date.now() - start,
        requestId,
      }),
    );
  });
  next();
}
