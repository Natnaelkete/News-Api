import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/jwt";
import { errorResponse } from "../utils/response";
import type { Role } from "@prisma/client";

type JwtPayload = {
  sub?: string;
  role?: Role;
};

const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    errorResponse(res, "Unauthorized", ["Missing bearer token"], 401);
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret!) as JwtPayload;

    if (!payload.sub || !payload.role) {
      errorResponse(res, "Unauthorized", ["Invalid token payload"], 401);
      return;
    }

    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (error) {
    errorResponse(res, "Unauthorized", ["Invalid or expired token"], 401);
  }
};

const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret!) as JwtPayload;

    if (payload.sub && payload.role) {
      req.user = { id: payload.sub, role: payload.role };
      next();
      return;
    }

    errorResponse(res, "Unauthorized", ["Invalid token payload"], 401);
  } catch (error) {
    errorResponse(res, "Unauthorized", ["Invalid or expired token"], 401);
  }
};

export { authenticate, optionalAuthenticate };
