import express from "express";
import {
  requireAuth,
  optionalAuth,
  type AuthRequest,
} from "../middleware/auth";
import { validateResume } from "../middleware/validation";
import { asyncHandler } from "../middleware/asyncHandler";
import { verifyGoogleIdToken, signAppToken } from "../services/authService";
import { checkGuestUsage } from "../services/guestService";
import {
  parseAndScore,
  generateFeedback,
  compareWithJobDescription,
  generateCareerMap,
  tailorResume,
  MODEL,
  type CoreAnalysisData,
  type ResumeAnalysisError,
  type TokenUsage,
} from "../services/aiService";
import {
  createAnalysis,
  deleteAnalysis,
  getAnalysisContext,
  getExperienceLevelProgression,
  getAnalysisById,
  getHiringRecommendationTrends,
  getSkillGapTrends,
  getUserHistory,
  getUserHistoryCount,
  getUserHistorySummary,
  saveTokenUsage,
} from "../services/historyService";
import type { ResumeAnalysisSuccess } from "../services/aiService";
import { upsertUserFromGoogleProfile } from "../services/userService";
import { NotFoundError, ValidationError } from "../errors";
import pool from "../config/database";

const router = express.Router();

// ==================== TYPE GUARDS ====================

function isResumeAnalysisError(data: unknown): data is ResumeAnalysisError {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    (data as { error: unknown }).error === "NOT_A_RESUME"
  );
}

// ==================== AUTH ====================

router.post(
  "/auth/google",
  asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== "string") {
      throw new ValidationError("idToken is required");
    }

    const profile = await verifyGoogleIdToken(idToken);
    const user = await upsertUserFromGoogleProfile(profile);
    const token = signAppToken(user.id);

    res.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
      },
    });
  }),
);

// ==================== HEALTH & STATUS ====================

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    await pool.query("SELECT 1");
    res.json({
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
        uptime: process.uptime(),
      },
    });
  }),
);

router.get(
  "/guest-status",
  asyncHandler(async (req, res) => {
    const guestUsage = await checkGuestUsage(req);

    res.json({
      data: {
        allowed: guestUsage.allowed,
        message: guestUsage.message,
        requiresLogin: !guestUsage.allowed,
      },
    });
  }),
);

// ==================== ANALYSIS ROUTES ====================

router.post(
  "/analyze",
  optionalAuth,
  validateResume,
  async (req: AuthRequest, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const sendSSE = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const userId = req.user?.id ?? null;
    const tokenRecords: { phase: string; usage: TokenUsage }[] = [];

    try {
      const { resumeText, sourceType, originalFileName } = req.body;

      const scoringCall = await parseAndScore(resumeText);
      tokenRecords.push({ phase: "scoring", usage: scoringCall.usage });

      const scoringData = scoringCall.data;
      if (isResumeAnalysisError(scoringData)) {
        sendSSE("error", {
          error: scoringData.message,
          detectedType: scoringData.detectedType,
        });
        res.end();
        return;
      }

      sendSSE("scoring", scoringData);

      const feedbackCall = await generateFeedback(scoringData);
      tokenRecords.push({ phase: "feedback", usage: feedbackCall.usage });

      sendSSE("feedback", feedbackCall.data);

      const fullResult = {
        ...scoringData,
        ...feedbackCall.data,
      };

      const response: Record<string, unknown> = {
        ...fullResult,
        metadata: {
          analyzedAt: new Date().toISOString(),
          analysisVersion: "2.0",
        },
      };

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

      // Persist structured analysis for authenticated users
      if (userId) {
        try {
          const entry = await createAnalysis({
            user_id: userId,
            resume_text: resumeText,
            source_type: sourceType || "text",
            original_file_name: originalFileName,
            ai_result: fullResult as ResumeAnalysisSuccess,
            ai_model_version: MODEL,
          });
          response.analysisId = entry.analysis.id;
        } catch (dbError) {
          console.error("Failed to persist analysis:", dbError);
        }
      }

      await saveTokenUsage(
        tokenRecords.map((r) => ({
          userId,
          endpoint: "/analyze",
          phase: r.phase,
          model: MODEL,
          usage: r.usage,
        })),
      );

      sendSSE("complete", response);
      res.end();
    } catch (error) {
      console.error("Error analyzing resume:", error);

      if (tokenRecords.length > 0) {
        await saveTokenUsage(
          tokenRecords.map((r) => ({
            userId,
            endpoint: "/analyze",
            phase: r.phase,
            model: MODEL,
            usage: r.usage,
          })),
        );
      }

      sendSSE("error", {
        error: "Failed to analyze resume. Please try again later.",
      });
      res.end();
    }
  },
);

// ==================== AUTHENTICATED ANALYSIS ROUTES ====================

router.post(
  "/job-match",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { analysisId, jobDescription } = req.body;
    const userId = req.user!.id;

    if (!analysisId || typeof analysisId !== "string") {
      throw new ValidationError("analysisId is required");
    }

    if (!jobDescription || typeof jobDescription !== "string") {
      throw new ValidationError("jobDescription is required");
    }

    if (jobDescription.length > 10000) {
      throw new ValidationError(
        "Job description is too long. Maximum 10,000 characters allowed.",
      );
    }

    const context = await getAnalysisContext(analysisId, userId);
    if (!context) {
      throw new NotFoundError("Analysis");
    }

    const { data: result, usage } = await compareWithJobDescription(
      context,
      jobDescription,
    );

    await saveTokenUsage([
      {
        userId,
        endpoint: "/job-match",
        phase: "job-comparison",
        model: MODEL,
        usage,
      },
    ]);

    res.json({
      data: result,
      metadata: { analyzedAt: new Date().toISOString() },
    });
  }),
);

router.post(
  "/tailor",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { analysisId, resumeText, jobDescription } = req.body;
    const userId = req.user!.id;

    if (!analysisId || typeof analysisId !== "string") {
      throw new ValidationError("analysisId is required");
    }

    if (!resumeText || typeof resumeText !== "string") {
      throw new ValidationError("resumeText is required");
    }

    if (resumeText.length > 50000) {
      throw new ValidationError(
        "Resume text is too long. Maximum 50,000 characters allowed.",
      );
    }

    if (!jobDescription || typeof jobDescription !== "string") {
      throw new ValidationError("jobDescription is required");
    }

    if (jobDescription.length > 10000) {
      throw new ValidationError(
        "Job description is too long. Maximum 10,000 characters allowed.",
      );
    }

    const context = await getAnalysisContext(analysisId, userId);
    if (!context) {
      throw new NotFoundError("Analysis");
    }

    const { data: result, usage } = await tailorResume(
      context,
      resumeText,
      jobDescription,
    );

    await saveTokenUsage([
      {
        userId,
        endpoint: "/tailor",
        phase: "tailor",
        model: MODEL,
        usage,
      },
    ]);

    res.json({
      data: result,
      metadata: { analyzedAt: new Date().toISOString() },
    });
  }),
);

router.post(
  "/career-map",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { analysisId } = req.body;
    const userId = req.user!.id;

    if (!analysisId || typeof analysisId !== "string") {
      throw new ValidationError("analysisId is required");
    }

    const context = await getAnalysisContext(analysisId, userId);
    if (!context) {
      throw new NotFoundError("Analysis");
    }

    const { data: result, usage } = await generateCareerMap(context);

    await saveTokenUsage([
      {
        userId,
        endpoint: "/career-map",
        phase: "career-map",
        model: MODEL,
        usage,
      },
    ]);

    res.json({
      data: result,
      metadata: { analyzedAt: new Date().toISOString() },
    });
  }),
);

// ==================== HISTORY ROUTES ====================

router.get(
  "/history",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const limit = parseInt(String(req.query.limit ?? "50"), 10);
    const offset = parseInt(String(req.query.offset ?? "0"), 10);

    if (limit < 1 || limit > 100) {
      throw new ValidationError("Limit must be between 1 and 100");
    }

    if (offset < 0) {
      throw new ValidationError("Offset must be non-negative");
    }

    const [history, total] = await Promise.all([
      getUserHistory(userId, limit, offset),
      getUserHistoryCount(userId),
    ]);

    res.json({
      data: history,
      metadata: {
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      },
    });
  }),
);

router.get(
  "/history/summary",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const summary = await getUserHistorySummary(req.user!.id);
    res.json({ data: summary });
  }),
);

router.get(
  "/history/skill-trends",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const trends = await getSkillGapTrends(req.user!.id);
    res.json({ data: trends });
  }),
);

router.get(
  "/history/progression",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const progression = await getExperienceLevelProgression(req.user!.id);
    res.json({ data: progression });
  }),
);

router.get(
  "/history/hiring-trends",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const trends = await getHiringRecommendationTrends(req.user!.id);
    res.json({ data: trends });
  }),
);

router.get(
  "/history/:id",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const entry = await getAnalysisById(String(req.params.id), req.user!.id);

    if (!entry) {
      throw new NotFoundError("History entry");
    }

    res.json({ data: entry });
  }),
);

router.post(
  "/history",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { resumeText, sourceType, originalFileName, analysis } = req.body;

    if (!resumeText || !analysis) {
      throw new ValidationError(
        "Missing required fields: resumeText and analysis",
      );
    }

    if (!analysis.overallScore || !analysis.scores) {
      throw new ValidationError("Invalid analysis object structure");
    }

    // user_id comes from the authenticated session, NOT from the request body
    const entry = await createAnalysis({
      user_id: req.user!.id,
      resume_text: resumeText,
      source_type: sourceType || "text",
      original_file_name: originalFileName,
      ai_result: analysis,
      ai_model_version: MODEL,
    });

    res.status(201).json({ data: entry });
  }),
);

router.delete(
  "/history/:id",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const deleted = await deleteAnalysis(String(req.params.id), req.user!.id);

    if (!deleted) {
      throw new NotFoundError("History entry");
    }

    res.json({ data: { deleted: true } });
  }),
);

export default router;
