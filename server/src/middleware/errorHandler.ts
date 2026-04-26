import { Response, NextFunction } from "express";
import { isAppError } from "../errors";
import type { AuthRequest } from "./auth";

/**
 * Centralized Express error-handling middleware.
 * - AppError subclasses → structured JSON at the appropriate HTTP status.
 * - Unknown errors → 500 with a generic message (details logged server-side).
 */
export const errorHandler = (
  err: Error,
  req: AuthRequest,
  res: Response,
  _next: NextFunction,
): void => {
  if (isAppError(err)) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  console.error(`[${req.id}] Unhandled error on ${req.method} ${req.path}:`, err);

  res.status(500).json({ error: "Internal server error" });
};
