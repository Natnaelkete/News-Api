import { Response } from "express";

type ErrorPayload = string[] | null;

const successResponse = <T>(
  res: Response,
  message: string,
  object: T,
  status = 200,
): Response => {
  return res.status(status).json({
    Success: true,
    Message: message,
    Object: object,
    Errors: null,
  });
};

const paginatedResponse = <T>(
  res: Response,
  message: string,
  object: T,
  pageNumber: number,
  pageSize: number,
  totalSize: number,
  status = 200,
): Response => {
  return res.status(status).json({
    Success: true,
    Message: message,
    Object: object,
    PageNumber: pageNumber,
    PageSize: pageSize,
    TotalSize: totalSize,
    Errors: null,
  });
};

const errorResponse = (
  res: Response,
  message: string,
  errors: ErrorPayload,
  status = 400,
): Response => {
  return res.status(status).json({
    Success: false,
    Message: message,
    Object: null,
    Errors: errors,
  });
};

export { successResponse, paginatedResponse, errorResponse };
