import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express handler so that rejected promises
 * are automatically forwarded to the error-handling middleware
 * instead of silently disappearing.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
