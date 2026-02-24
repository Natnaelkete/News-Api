import { NextFunction, Request, Response } from "express";
import { login, signup } from "../services/authService";
import { successResponse } from "../utils/response";

const signupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user, token } = await signup(req.body);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    successResponse(res, "Signup successful", { user: safeUser, token }, 201);
  } catch (error) {
    next(error);
  }
};

const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user, token } = await login(req.body);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    successResponse(res, "Login successful", { user: safeUser, token }, 200);
  } catch (error) {
    next(error);
  }
};

export { signupHandler, loginHandler };
