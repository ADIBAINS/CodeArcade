import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => {
        const path = issue.path
          .filter((segment) => segment !== "body" && segment !== "params" && segment !== "query")
          .join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten(),
        details
      });
    }

    req.body = result.data.body ?? req.body;
    req.params = result.data.params ?? req.params;
    req.query = result.data.query ?? req.query;

    next();
  };

