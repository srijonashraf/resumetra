import { Response, NextFunction } from "express";
import { isAppError } from "../errors";
import type { AuthRequest } from "./auth";

const GENERIC_SERVER_ERROR = { error: "Internal server error" };

/**
 * Centralized Express error-handling middleware.
 * - AppError subclasses → structured JSON at the appropriate HTTP status.
 * - `trusted: true` → client sees the message (4xx client errors).
 * - `trusted: false` → client gets a generic message, details logged server-side only.
 * - Unknown errors → 500 with a generic message (details logged server-side).
 */
export const errorHandler = (
  err: Error,
  req: AuthRequest,
  res: Response,
  _next: NextFunction,
): void => {
  if (isAppError(err)) {
    console.error(
      `[${req.id}] AppError (${err.constructor.name}) on ${req.method} ${req.path}:`,
      err.message,
      err.details ?? "",
    );

    res.status(err.statusCode).json({
      error: err.trusted ? err.message : GENERIC_SERVER_ERROR.error,
    });
    return;
  }

  console.error(
    `[${req.id}] Unhandled error on ${req.method} ${req.path}:`,
    err,
  );

  res.status(500).json(GENERIC_SERVER_ERROR);
};
