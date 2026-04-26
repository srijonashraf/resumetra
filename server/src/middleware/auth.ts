import { Request, Response, NextFunction } from "express";
import { checkGuestUsage, GuestUsageResult } from "../services/guestService";
import { findUserById, User } from "../services/userService";
import { verifyAppToken } from "../services/authService";

export type AuthRequest = Request & {
  user?: User;
  guestUsage?: GuestUsageResult;
};

/**
 * Request type guaranteed to have an authenticated user.
 * Use this for routes behind `requireAuth` middleware.
 */
export type AuthenticatedRequest = Request & {
  user: User;
};

/**
 * Authentication middleware that requires a valid user token.
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAppToken(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

/**
 * Authentication middleware that allows guest users with limitations
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  // Try to authenticate user
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const payload = verifyAppToken(token);
      const user = await findUserById(payload.sub);

      if (user) {
        req.user = user;
        next();
        return;
      }
    } catch (error) {
      console.warn("Token verification failed, proceeding as guest");
    }
  }

  // Guest user flow
  try {
    const guestUsage = await checkGuestUsage(req);
    req.guestUsage = guestUsage;

    if (!guestUsage.allowed) {
      res.status(429).json({
        error: "Guest limit reached",
        message: guestUsage.message,
        requiresLogin: true,
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: "Guest verification failed",
      message: "Please login to continue",
    });
  }
};
