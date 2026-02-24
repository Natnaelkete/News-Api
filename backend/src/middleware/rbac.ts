import { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { errorResponse } from "../utils/response";

const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, "Unauthorized", ["Missing authenticated user"], 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(res, "Forbidden", ["Insufficient permissions"], 403);
      return;
    }

    next();
  };
};

export { requireRole };
