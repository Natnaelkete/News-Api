import { NextFunction, Request, Response } from "express";

const sanitizeString = (value: string): string => {
  return value.replace(/<[^>]*>/g, "").trim();
};

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      output[key] = sanitizeValue(nested);
    }
    return output;
  }

  return value;
};

const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query) as Request["query"];
  req.params = sanitizeValue(req.params) as Request["params"];
  next();
};

export { sanitizeInput };
