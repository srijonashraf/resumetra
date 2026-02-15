import express from "express";
import {
  requireAuth,
  optionalAuth,
  type AuthRequest,
} from "../middleware/auth";
import {
  validateResume,
  validateResumeAndJob,
  validateRewriteInput,
} from "../middleware/validation";
import { verifyGoogleIdToken, signAppToken } from "../services/authService";
import { checkGuestUsage } from "../services/guestService";
import {
  analyzeResume,
  compareWithJobDescription,
  generateCareerMap,
  smartRewrite,
  tailorResume,
  type ResumeAnalysisSuccess,
} from "../services/geminiService";
import {
  createHistoryEntry,
  deleteAllUserHistory,
  deleteHistoryEntry,
  getExperienceLevelProgression,
  getHistoryEntryById,
  getSkillGapTrends,
  getUserHistory,
  getUserHistoryCount,
  getUserHistorySummary,
} from "../services/historyService";
import { upsertUserFromGoogleProfile } from "../services/userService";
import pool from "../config/database";

const router = express.Router();

// ==================== AUTH ====================

// Google login endpoint: exchanges Google ID token for app JWT
router.post("/auth/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== "string") {
      res.status(400).json({ error: "idToken is required" });
      return;
    }

    const profile = await verifyGoogleIdToken(idToken);
    const user = await upsertUserFromGoogleProfile(profile);
    const token = signAppToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Error during Google auth:", error);
    res.status(401).json({ error: "Google authentication failed" });
  }
});

// ==================== HEALTH & STATUS ====================

// Health check
router.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1"); // Check DB
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// Check guest usage status
router.get("/guest-status", async (req, res) => {
  try {
    const guestUsage = await checkGuestUsage(req);

    res.json({
      allowed: guestUsage.allowed,
      message: guestUsage.message,
      requiresLogin: !guestUsage.allowed,
    });
  } catch (error) {
    console.error("Error checking guest status:", error);
    res.status(500).json({ error: "Failed to check guest status" });
  }
});

// ==================== ANALYSIS ROUTES ====================

// Resume analysis (allows guest users with 1 analysis limit)
router.post(
  "/analyze",
  optionalAuth,
  validateResume,
  async (req: AuthRequest, res) => {
    try {
      const { resumeText } = req.body;

      const result = await analyzeResume(resumeText);

      // Check if AI detected non-resume content
      if ("error" in result && result.error === "NOT_A_RESUME") {
        res.status(400).json({
          error: result.message,
          detectedType: result.detectedType,
        });
        return;
      }

      // Type guard - ensure we have a successful analysis
      const analysis = result as ResumeAnalysisSuccess;

      // Prepare response with enhanced data
      const response: any = {
        ...analysis,
        metadata: {
          analyzedAt: new Date().toISOString(),
          analysisVersion: "2.0",
        },
      };

      // Add guest usage info if applicable
      if (req.guestUsage && !req.user) {
        response.isGuest = true;
        response.guestId = req.guestUsage.guestId;
        response.remainingAnalyses = Math.max(
          0,
          1 - (req.guestUsage.analysisCount || 0),
        );
        response.message =
          req.guestUsage.analysisCount === 1
            ? "You've used your free analysis. Login to analyze more resumes."
            : null;
      }

      res.json(response);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      res.status(500).json({
        error: "Failed to analyze resume. Please try again later.",
      });
    }
  },
);

// Compare resume with job description
router.post(
  "/job-match",
  requireAuth,
  validateResumeAndJob,
  async (req: AuthRequest, res) => {
    try {
      const { resumeText, jobDescription } = req.body;

      const result = await compareWithJobDescription(
        resumeText,
        jobDescription,
      );

      res.json({
        ...result,
        metadata: {
          analyzedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error comparing with job description:", error);
      res.status(500).json({
        error:
          "Failed to compare with job description. Please try again later.",
      });
    }
  },
);

// Tailor resume for specific job
router.post(
  "/tailor",
  requireAuth,
  validateResumeAndJob,
  async (req: AuthRequest, res) => {
    try {
      const { resumeText, jobDescription } = req.body;

      const result = await tailorResume(resumeText, jobDescription);

      res.json(result);
    } catch (error) {
      console.error("Error tailoring resume:", error);
      res.status(500).json({
        error: "Failed to tailor resume. Please try again later.",
      });
    }
  },
);

// Generate career map from resume
router.post(
  "/career-map",
  requireAuth,
  validateResume,
  async (req: AuthRequest, res) => {
    try {
      const { resumeText } = req.body;

      const result = await generateCareerMap(resumeText);

      res.json({
        ...result,
        metadata: {
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error generating career map:", error);
      res.status(500).json({
        error: "Failed to generate career map. Please try again later.",
      });
    }
  },
);

// Smart rewrite text for job context
router.post(
  "/rewrite",
  requireAuth,
  validateRewriteInput,
  async (req: AuthRequest, res) => {
    try {
      const { originalText, jobDescription } = req.body;

      const result = await smartRewrite(originalText, jobDescription);

      res.json({
        ...result,
        metadata: {
          rewrittenAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error rewriting text:", error);
      res.status(500).json({
        error: "Failed to rewrite text. Please try again later.",
      });
    }
  },
);

// ==================== HISTORY ROUTES ====================

// Get user's analysis history with pagination
router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Validate pagination params
    if (limit < 1 || limit > 100) {
      res.status(400).json({ error: "Limit must be between 1 and 100" });
      return;
    }

    if (offset < 0) {
      res.status(400).json({ error: "Offset must be non-negative" });
      return;
    }

    const [history, total] = await Promise.all([
      getUserHistory(userId, limit, offset),
      getUserHistoryCount(userId),
    ]);

    res.json({
      data: history,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Get history summary and analytics
router.get("/history/summary", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const summary = await getUserHistorySummary(userId);

    res.json(summary);
  } catch (error) {
    console.error("Error fetching history summary:", error);
    res.status(500).json({ error: "Failed to fetch history summary" });
  }
});

// Get skill gap trends
router.get(
  "/history/skill-trends",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const trends = await getSkillGapTrends(userId);

      res.json({ trends });
    } catch (error) {
      console.error("Error fetching skill trends:", error);
      res.status(500).json({ error: "Failed to fetch skill trends" });
    }
  },
);

// Get experience level progression
router.get(
  "/history/progression",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const progression = await getExperienceLevelProgression(userId);

      res.json({ progression });
    } catch (error) {
      console.error("Error fetching progression:", error);
      res.status(500).json({ error: "Failed to fetch progression data" });
    }
  },
);

// Get specific history entry by ID
router.get("/history/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const { id } = req.params;

    const entry = await getHistoryEntryById(id as string, userId);

    if (!entry) {
      res.status(404).json({ error: "History entry not found" });
      return;
    }

    res.json(entry);
  } catch (error) {
    console.error("Error fetching history entry:", error);
    res.status(500).json({ error: "Failed to fetch history entry" });
  }
});

// Create new history entry
router.post("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const { id, resumeText, analysis } = req.body;

    // Validate required fields
    if (!id || !resumeText || !analysis) {
      res.status(400).json({
        error:
          "Missing required fields: id, resumeText, and analysis are required",
      });
      return;
    }

    // Validate analysis object structure
    if (
      !analysis.overallScore ||
      !analysis.scores ||
      !analysis.experienceLevel
    ) {
      res.status(400).json({
        error: "Invalid analysis object structure",
      });
      return;
    }

    const entry = await createHistoryEntry({
      id,
      user_id: userId,
      resume_text: resumeText,
      education_score: analysis.scores.education,
      leadership_score: analysis.scores.leadership,
      overall_score: analysis.overallScore,
      experience_level: analysis.experienceLevel,
      years_of_experience: analysis.yearsOfExperience || 0,
      missing_skills: analysis.missingSkills || [],
      suggestions: [
        ...(analysis.recommendations?.immediate || []),
        ...(analysis.recommendations?.shortTerm || []),
      ],
      full_analysis: analysis,
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating history entry:", error);
    res.status(500).json({ error: "Failed to create history entry" });
  }
});

// Delete history entry by ID
router.delete("/history/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const { id } = req.params;
    const deleted = await deleteHistoryEntry(id as string, userId);

    if (deleted) {
      res.json({ success: true, message: "History entry deleted" });
    } else {
      res
        .status(404)
        .json({ error: "History entry not found or already deleted" });
    }
  } catch (error) {
    console.error("Error deleting history entry:", error);
    res.status(500).json({ error: "Failed to delete history entry" });
  }
});

// Delete all history for user
router.delete("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const deletedCount = await deleteAllUserHistory(userId);

    res.json({
      success: true,
      message: `Deleted ${deletedCount} history entries`,
      deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all history:", error);
    res.status(500).json({ error: "Failed to delete history" });
  }
});

export default router;
