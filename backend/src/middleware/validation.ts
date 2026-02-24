import { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { errorResponse } from "../utils/response";

const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);
      errorResponse(res, "Validation failed", errors, 422);
      return;
    }

    req.body = result.data;
    next();
  };
};

export { validate };
