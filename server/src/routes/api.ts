import express from "express";
import rateLimit from "express-rate-limit";
import {
  requireAuth,
  optionalAuth,
  type AuthRequest,
} from "../middleware/auth";
import { validateResume } from "../middleware/validation";
import { upload } from "../middleware/upload";
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
  type ResumeAnalysisError,
  type TokenUsage,
} from "../services/aiService";
import {
  createAnalysis,
  getCachedCareerMap,
  saveCareerMap,
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
import { runExtractionPipeline } from "../services/pipelineService";
import { upsertUserFromGoogleProfile, incrementAnalysisCount } from "../services/userService";
import { NotFoundError, ValidationError } from "../errors";
import pool from "../config/database";

const router = express.Router();

const USER_ANALYSIS_LIMIT = parseInt(process.env.USER_ANALYSIS_LIMIT || "10", 10);

/**
 * AI-specific rate limiter: 100 requests per minute per IP.
 * On exceed, client must wait 5 minutes before retrying.
 */
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please wait 5 minutes before trying again." },
  handler: (_req, res) => {
    res.setHeader("Retry-After", "300");
    res.status(429).json({ error: "Too many AI requests. Please wait 5 minutes before trying again." });
  },
});

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
  aiRateLimiter,
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

    // Enforce per-user analysis limit for authenticated users
    if (userId) {
      const countResult = await pool.query(
        "SELECT analysis_count FROM users WHERE id = $1",
        [userId],
      );
      const count = Number(countResult.rows[0].analysis_count);
      if (count >= USER_ANALYSIS_LIMIT) {
        sendSSE("error", {
          error: `Analysis limit reached (${USER_ANALYSIS_LIMIT}). You have used all your analyses.`,
          limit: USER_ANALYSIS_LIMIT,
        });
        res.end();
        return;
      }
    }

    try {
      const { resumeText, sourceType, originalFileName } = req.body;
      const startTime = Date.now();

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
          await incrementAnalysisCount(userId);

          const entry = await createAnalysis({
            user_id: userId,
            resume_text: resumeText,
            source_type: sourceType || "text",
            original_file_name: originalFileName,
            ai_result: fullResult as ResumeAnalysisSuccess,
            ai_model_version: MODEL,
            processing_time_ms: Date.now() - startTime,
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

// ==================== EXTRACTION ROUTE ====================

const PDF_MAGIC = Buffer.from("%PDF-");

function sanitizeFileName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  const base = name.replace(/^.*[/\\]/, "");
  return base.length > 255 ? base.slice(0, 255) : base;
}

// Conditionally apply multer for multipart uploads
const conditionalUpload = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    upload.single("resume")(req, res, next);
  } else {
    next();
  }
};

router.post(
  "/extract",
  aiRateLimiter,
  optionalAuth,
  conditionalUpload,
  async (req: AuthRequest, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const sendSSE = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const userId = req.user?.id ?? null;

    try {
      let input: { pdfBuffer?: Buffer; text?: string; userId?: string | null; originalFileName?: string; aiModelVersion?: string };

      if (req.file) {
        // Multipart upload — validate PDF magic bytes
        const buffer = req.file.buffer;
        if (buffer.length < 5 || !buffer.slice(0, 5).equals(PDF_MAGIC)) {
          sendSSE("error", { error: "File is not a valid PDF." });
          res.end();
          return;
        }

        input = {
          pdfBuffer: buffer,
          userId,
          originalFileName: sanitizeFileName(req.file.originalname),
          aiModelVersion: MODEL,
        };
      } else {
        // JSON body with text
        const { resumeText } = req.body;
        if (!resumeText || typeof resumeText !== "string") {
          sendSSE("error", { error: "resumeText is required" });
          res.end();
          return;
        }
        if (resumeText.length > 50000) {
          sendSSE("error", { error: "Resume text exceeds maximum length (50,000 characters)." });
          res.end();
          return;
        }
        input = { text: resumeText, userId, aiModelVersion: MODEL };
      }

      const result = await runExtractionPipeline(input, sendSSE);

      // Increment analysis count for authenticated users
      if (userId) {
        try {
          await incrementAnalysisCount(userId);
        } catch (dbError) {
          console.error("Failed to increment analysis count:", dbError);
        }
      }

      sendSSE("complete", result);
      res.end();
    } catch (error) {
      if (error instanceof Error && "outcome" in error) {
        // Validation error — already sent via SSE in pipeline
        res.end();
        return;
      }
      console.error("Extraction error:", error);
      sendSSE("error", { error: "Extraction failed. Please try again." });
      res.end();
    }
  },
);

// ==================== USAGE ROUTES ====================

router.get(
  "/usage",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const countResult = await pool.query(
      "SELECT analysis_count FROM users WHERE id = $1",
      [userId],
    );
    const used = Number(countResult.rows[0].analysis_count);
    res.json({
      data: {
        used,
        limit: USER_ANALYSIS_LIMIT,
        remaining: Math.max(USER_ANALYSIS_LIMIT - used, 0),
      },
    });
  }),
);

// ==================== AUTHENTICATED ANALYSIS ROUTES ====================

router.post(
  "/job-match",
  aiRateLimiter,
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

    if (jobDescription.trim().length < 50) {
      throw new ValidationError(
        "Job description is too short. Please provide a complete job posting with requirements and responsibilities.",
      );
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
  aiRateLimiter,
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

    if (jobDescription.trim().length < 50) {
      throw new ValidationError(
        "Job description is too short. Please provide a complete job posting with requirements and responsibilities.",
      );
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
  aiRateLimiter,
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { analysisId } = req.body;
    const userId = req.user!.id;

    if (!analysisId || typeof analysisId !== "string") {
      throw new ValidationError("analysisId is required");
    }

    // Return cached result if already generated
    const cached = await getCachedCareerMap(analysisId, userId);
    if (cached) {
      res.json({
        data: cached,
        metadata: { cached: true },
      });
      return;
    }

    const context = await getAnalysisContext(analysisId, userId);
    if (!context) {
      throw new NotFoundError("Analysis");
    }

    const { data: result, usage } = await generateCareerMap(context);

    // Persist the generated career map
    await saveCareerMap(analysisId, userId, result);

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
