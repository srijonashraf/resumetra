import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore, AnalysisResult, AnalysisHistoryEntry } from "../store/useStore";
import { analyzeResumeStream } from "../services/api";
import { ApiError } from "../services/errors";
import PdfUploader from "../components/upload/PdfUploader";
import DashboardTabs from "../components/dashboard/DashboardTabs";
import GuestBanner from "../components/dashboard/GuestBanner";
import AppShell from "../components/app/AppShell";
import { fetchUserHistory, fetchUsage } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/ui/Card";
import { Button, Spinner } from "../components/ui";
import type { SSEScoringPayload, SSEFeedbackPayload, SSECompletePayload } from "../types";

const DEFAULT_FEEDBACK: AnalysisResult["feedback"] = {
  summary: "",
  hiringRecommendation: "Needs More Info",
  strengths: [],
  weaknesses: [],
  improvementAreas: [],
  missingSkills: [],
  redFlags: [],
  suggestions: { immediate: [], shortTerm: [], longTerm: [] },
};

const Dashboard = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestLimitReached, setGuestLimitReached] = useState(false);

  const { user } = useAuth();

  const resumeData = useStore((state) => state.resumeData);
  const analysisResults = useStore((state) => state.analysisResults);
  const analysisPhase = useStore((state) => state.analysisPhase);
  const isGuest = useStore((state) => state.isGuest);
  const guestMessage = useStore((state) => state.guestMessage);
  const setAnalysisResults = useStore((state) => state.setAnalysisResults);
  const setAnalysisPhase = useStore((state) => state.setAnalysisPhase);
  const addAnalysisHistory = useStore((state) => state.addAnalysisHistory);
  const setAnalysisHistory = useStore((state) => state.setAnalysisHistory);
  const clearCurrentAnalysis = useStore(
    (state) => state.clearCurrentAnalysis
  );
  const setGuestMode = useStore((state) => state.setGuestMode);
  const setUsage = useStore((state) => state.setUsage);
  const usage = useStore((state) => state.usage);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const [historyResult, usageData] = await Promise.all([
          fetchUserHistory(),
          fetchUsage(),
        ]);
        setAnalysisHistory(historyResult.data);
        setUsage(usageData);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    if (user) {
      setGuestMode(false);
      loadHistory();
    } else {
      setAnalysisHistory([]);
      setUsage(null);
    }
  }, [user, setAnalysisHistory, setGuestMode, setUsage]);


  useEffect(() => {
    const analyzeUploadedResume = async () => {
      if (resumeData && !analysisResults && analysisPhase === "idle") {
        setIsAnalyzing(true);
        setError(null);

        try {
          const completeResults: SSECompletePayload = await analyzeResumeStream(
            resumeData.rawText,
            // Phase 1: Scoring data received
            (scoringData: SSEScoringPayload) => {
              setAnalysisResults({
                ...scoringData,
                feedback: DEFAULT_FEEDBACK,
              });
              setAnalysisPhase("scoring");
            },
            // Phase 2: Feedback data received
            (feedbackData: SSEFeedbackPayload) => {
              const current = useStore.getState().analysisResults;
              if (current) {
                setAnalysisResults({
                  ...current,
                  feedback: feedbackData.feedback,
                });
              }
              setAnalysisPhase("feedback");
            },
            {
              sourceType: resumeData.file ? "pdf" : "text",
              ...(resumeData.file?.name ? { originalFileName: resumeData.file.name } : {}),
            },
          );

          // Full result
          setAnalysisResults(completeResults as unknown as AnalysisResult);
          setAnalysisPhase("complete");

          if (completeResults.isGuest) {
            setGuestMode(true, completeResults.message ?? undefined);
          }

          if (!completeResults.isGuest || (completeResults.remainingAnalyses ?? 0) > 0) {
            const historyEntry: AnalysisHistoryEntry = {
              id: completeResults.analysisId || crypto.randomUUID(),
              date: new Date(),
              resumeData,
              analysisResults: completeResults as unknown as AnalysisResult,
            };

            addAnalysisHistory(historyEntry);
          }
        } catch (err: unknown) {
          console.error("Error analyzing resume:", err);

          if (err instanceof ApiError) {
            if (err.status === 429 && (err.data as { requiresLogin?: boolean })?.requiresLogin) {
              setError(err.message);
              setGuestMode(true, err.message);
              setGuestLimitReached(true);
            } else {
              const data = err.data as Record<string, unknown> | undefined;
              const detectedType = data?.detectedType as string | undefined;
              setError(
                detectedType
                  ? `${err.message} (Detected: ${detectedType})`
                  : err.message,
              );
            }
          } else {
            setError("Failed to analyze resume. Please try again.");
          }
          setAnalysisPhase("idle");
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    analyzeUploadedResume();
  }, [
    resumeData,
    analysisResults,
    analysisPhase,
    setAnalysisResults,
    setAnalysisPhase,
    addAnalysisHistory,
    user,
    setGuestMode,
  ]);

  const handleNewAnalysis = () => {
    clearCurrentAnalysis();
    setError(null);
    setGuestLimitReached(false);
  };

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-0">
        {!resumeData ? (
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card padding="lg">
                <h2 className="text-3xl font-bold text-stone-900 mb-4 text-center">
                  Upload Your Resume
                </h2>
                <p className="text-stone-500 mb-8 text-center max-w-2xl mx-auto text-lg">
                  Our AI will analyze your resume and provide personalized
                  feedback to help you improve it.
                </p>

                {usage && usage.remaining === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-red-600 font-medium mb-2">
                      Analysis limit reached ({usage.used}/{usage.limit})
                    </p>
                    <p className="text-stone-500 text-sm">
                      You have used all your analyses. Delete previous analyses to free up slots.
                    </p>
                  </div>
                ) : (
                  <PdfUploader />
                )}
              </Card>
            </motion.div>

            {user && (
              <div className="mt-8">
                <DashboardTabs />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {isAnalyzing && analysisPhase === "idle" ? (
              <Card padding="xl" className="text-center">
                <Spinner size="lg" className="mb-6" />
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  Parsing your resume...
                </h2>
                <p className="text-stone-500 text-lg">
                  Extracting structure and computing scores.
                </p>
              </Card>
            ) : isAnalyzing && analysisPhase === "scoring" ? (
              <div className="space-y-8">
                <DashboardTabs />
                <Card padding="md" className="text-center border-amber-200 bg-amber-50">
                  <Spinner size="md" className="mb-3" />
                  <h3 className="text-lg font-semibold text-amber-800">
                    Generating detailed feedback...
                  </h3>
                  <p className="text-amber-600 text-sm">
                    Scores are ready. Feedback is loading.
                  </p>
                </Card>
              </div>
            ) : error ? (
              <Card padding="lg" className="text-center border-red-200 bg-red-50">
                <div className="text-4xl mb-4">!</div>
                <h2 className="text-xl font-bold text-red-600">
                  Analysis Error
                </h2>
                <p className="text-red-500 mt-2 mb-6">{error}</p>
                {guestLimitReached ? (
                  <Link
                    to="/login"
                    onClick={handleNewAnalysis}
                    className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Sign In to Continue
                  </Link>
                ) : (
                  <Button
                    variant="danger"
                    onClick={handleNewAnalysis}
                  >
                    Try Again
                  </Button>
                )}
              </Card>
            ) : (
              <>
                {isGuest && !user && guestMessage && (
                  <GuestBanner
                    message={guestMessage}
                    onClose={() => setGuestMode(false)}
                  />
                )}

                {usage && !isGuest && (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                    <span className="text-sm text-stone-600">
                      Analyses used: <span className="font-semibold text-stone-900">{usage.used}</span> / {usage.limit}
                    </span>
                    {usage.remaining === 0 && (
                      <span className="text-xs font-medium text-red-600">
                        Limit reached
                      </span>
                    )}
                  </div>
                )}

                <DashboardTabs />
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Dashboard;
