import { Request } from "express";
import pool from "../config/database";
import { DatabaseError } from "../errors";

// ==================== TYPE DEFINITIONS ====================

interface GuestAnalytics {
  id: string;
  ip_address: string;
  user_agent?: string;
  analysis_count: number;
  last_analysis_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface GuestUsageResult {
  allowed: boolean;
  guestId?: string;
  message?: string;
  analysisCount?: number;
}

// ==================== CONSTANTS ====================
const GUEST_ANALYSIS_LIMIT = parseInt(
  process.env.GUEST_ANALYSIS_LIMIT || "1",
  10,
);

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get client IP address from request
 */
const getClientIP = (req: Request): string => {
  // Only trust x-forwarded-for if app is behind a proxy
  if (process.env.TRUST_PROXY === "true") {
    const forwarded = req.headers["x-forwarded-for"];
    const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (forwardedValue) return forwardedValue.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "";
};

/**
 * Get user agent from request
 */
const getUserAgent = (req: Request): string => {
  return req.headers["user-agent"] || "Unknown";
};

// ==================== PRIVATE HELPERS ====================

const createGuestEntry = async (
  guestId: string,
  ipAddress: string,
  userAgent?: string,
): Promise<void> => {
  const query = `
    INSERT INTO guest_usage (id, ip_address, user_agent, analysis_count)
    VALUES ($1, $2, $3, $4)
  `;

  await pool.query(query, [guestId, ipAddress, userAgent, 1]);
};

const incrementGuestUsage = async (guestId: string): Promise<void> => {
  const query = `
    UPDATE guest_usage
    SET analysis_count = analysis_count + 1,
        last_analysis_at = NOW()
    WHERE id = $1
  `;

  await pool.query(query, [guestId]);
};

const generateGuestId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// ==================== GUEST USAGE MANAGEMENT ====================

/**
 * Check if guest user is allowed to analyze resume
 */
export const checkGuestUsage = async (
  req: Request,
): Promise<GuestUsageResult> => {
  const ipAddress = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    const existingGuestQuery = `
      SELECT id, analysis_count, last_analysis_at
      FROM guest_usage
      WHERE ip_address = $1
      ORDER BY last_analysis_at DESC
      LIMIT 1
    `;

    const result = await pool.query(existingGuestQuery, [ipAddress]);
    const guest = result.rows[0];

    if (guest) {
      if (guest.analysis_count >= GUEST_ANALYSIS_LIMIT) {
        return {
          allowed: false,
          message:
            "You've reached your free resume analysis limit. Please login to analyze more resumes.",
          analysisCount: guest.analysis_count,
        };
      }

      await incrementGuestUsage(guest.id);
      return {
        allowed: true,
        guestId: guest.id,
        analysisCount: guest.analysis_count + 1,
      };
    }

    const newGuestId = generateGuestId();
    await createGuestEntry(newGuestId, ipAddress, userAgent);
    return {
      allowed: true,
      guestId: newGuestId,
      analysisCount: 1,
    };
  } catch (error) {
    console.error("Error checking guest usage:", error);
    throw new DatabaseError("Failed to verify guest usage", { details: error });
  }
};
