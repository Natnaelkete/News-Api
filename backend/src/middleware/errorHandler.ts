import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { errorResponse } from "../utils/response";

type ApiError = {
  status?: number;
  errors?: string[];
  message?: string;
};

const errorHandler = (
  err: ApiError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => issue.message);
    errorResponse(res, "Validation failed", errors, 422);
    return;
  }

  const status = err.status || 500;
  const message = err.message || "Internal server error";
  const errors = err.errors || null;

  errorResponse(res, message, errors, status);
};

export { errorHandler };
