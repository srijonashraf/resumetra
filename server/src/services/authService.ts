import { OAuth2Client } from "google-auth-library";
import jwt, { SignOptions, type JwtPayload } from "jsonwebtoken";
import type { GoogleProfile } from "./userService";
import { requireEnv } from "../utils";

export interface AppJwtPayload extends JwtPayload {
  /** Internal user id in our Postgres `users` table. */
  sub: string;
}

// Environment configuration
const GOOGLE_CLIENT_ID = requireEnv("GOOGLE_CLIENT_ID");
const JWT_SECRET = requireEnv("JWT_SECRET");
const JWT_EXPIRES_IN = requireEnv("JWT_EXPIRES_IN");

// Google OAuth client used to verify ID tokens from the frontend
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verify a Google ID token using Google's public keys and return a normalized profile.
 */
export const verifyGoogleIdToken = async (
  idToken: string,
): Promise<GoogleProfile> => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub) {
    throw new Error("Invalid Google ID token payload");
  }

  return {
    sub: payload.sub,
    email: payload.email || undefined,
    name: payload.name || undefined,
    picture: payload.picture || undefined,
  };
};

/**
 * Sign an application JWT for a user, using our shared secret.
 */
export const signAppToken = (userId: string): string => {
  const payload: AppJwtPayload = { sub: userId };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
};

/**
 * Verify an application JWT and return the decoded payload.
 */
export const verifyAppToken = (token: string): AppJwtPayload => {
  return jwt.verify(token, JWT_SECRET) as AppJwtPayload;
};
