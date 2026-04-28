import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useStore, TailorSection, JobMatchResult } from "../../store/useStore";
import { ApiError } from "../../services/errors";
import { toast } from "sonner";
import {
  BriefcaseIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  LockClosedIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { compareWithJobDescription, tailorResume } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Badge from "../ui/Badge";
import ScoreCard from "../ui/ScoreCard";
import Card from "../ui/Card";
import { Button, Tabs, Textarea, Spinner } from "../ui";

const JobAnalysisPanel = () => {
  const { isLoggedIn } = useAuth();
  const jobDescription = useStore((state) => state.jobDescription);
  const [jobInput, setJobInput] = useState(jobDescription || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [jobMatchResults, setJobMatchResults] = useState<JobMatchResult | null>(null);
  const tailorResults = useStore((state) => state.tailorResult);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(),
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<"input" | "tailor">(
    "input",
  );

  if (isLoggedIn === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card padding="xl" className="text-center">
          <LockClosedIcon className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h3 className="text-xl font-semibold font-heading text-stone-900 mb-2">
            Sign in to use Job Analysis &amp; Resume Tailoring
          </h3>
          <p className="text-stone-500 mb-6 max-w-md mx-auto">
            Sign in to compare your resume against job descriptions and get
            AI-powered tailored rewrites for each section.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            Sign In to Continue
          </Link>
        </Card>
      </motion.div>
    );
  }

  const getMatchBadgeVariant = (score: number): "success" | "info" | "warning" | "danger" => {
    if (score >= 86) return "success";
    if (score >= 66) return "info";
    if (score >= 41) return "warning";
    return "danger";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Low":
        return "bg-stone-100 text-stone-600 border-stone-200";
      default:
        return "bg-stone-100 text-stone-600 border-stone-200";
    }
  };

  const handleJobAnalysis = async () => {
    if (!jobInput.trim()) {
      toast.error("Please enter a job description", {
        description: "Job description is required for analysis",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      useStore.getState().setTailorResult(null);

      const analysisResults = useStore.getState().analysisResults;
      if (!analysisResults) {
        toast.error("No analysis found", {
          description: "Please analyze a resume first",
        });
        return;
      }

      if (!analysisResults.analysisId) {
        toast.error("Analysis not saved", {
          description: "Please re-analyze your resume while logged in",
        });
        return;
      }

      const results = await compareWithJobDescription(
        analysisResults.analysisId,
        jobInput,
      );

      setJobMatchResults(results);
      useStore.getState().setJobDescription(jobInput);

      toast.success("Job analysis completed!", {
        description: "Your resume has been compared with the job description",
      });
    } catch (error: unknown) {
      console.error("Job match analysis error:", error);
      toast.error("Failed to analyze job description", {
        description: error instanceof ApiError ? error.message : "Please try again",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTailorResume = async () => {
    try {
      setIsTailoring(true);

      const { analysisResults, resumeData } = useStore.getState();
      if (!analysisResults) {
        toast.error("No analysis found", {
          description: "Please analyze a resume first",
        });
        return;
      }

      if (!analysisResults.analysisId) {
        toast.error("Analysis not saved", {
          description: "Please re-analyze your resume while logged in",
        });
        return;
      }

      if (!resumeData?.rawText) {
        toast.error("No resume data found", {
          description: "Please upload a resume first",
        });
        return;
      }

      const results = await tailorResume(
        analysisResults.analysisId,
        resumeData.rawText,
        jobInput,
      );
      useStore.getState().setTailorResult(results);
      setActiveSection("tailor");
      setExpandedSections(new Set([0]));

      toast.success("Resume tailoring completed!", {
        description: "Section-by-section suggestions are ready",
      });
    } catch (error: unknown) {
      console.error("Tailor resume error:", error);
      toast.error("Failed to tailor resume", {
        description: error instanceof ApiError ? error.message : "Please try again",
      });
    } finally {
      setIsTailoring(false);
    }
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Card shadow className="mt-6">
      {/* Header — matches CareerMap pattern */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-heading">
          Job Analysis & Resume Tailoring
        </h2>
      </div>

      {/* Toggle Tabs */}
      <Tabs
        variant="segmented"
        className="mb-6"
        tabs={[
          {
            id: "input",
            label: (
              <>
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                Job Analysis
              </>
            ),
          },
          {
            id: "tailor",
            label: (
              <>
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Tailor Results
                {!tailorResults && (
                  <span className="text-xs text-stone-400 ml-1">
                    (
                    {!jobMatchResults
                      ? "Analyze Job Match first"
                      : "Click Tailor Resume first"}
                    )
                  </span>
                )}
              </>
            ),
            disabled: !tailorResults,
          },
        ]}
        activeTab={activeSection}
        onTabChange={(id) => setActiveSection(id as "input" | "tailor")}
      />

      {/* Section Content */}
      <AnimatePresence mode="wait">
        {activeSection === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Job Description
              </label>
              <Textarea
                value={jobInput}
                onChange={(e) => setJobInput(e.target.value)}
                className="min-h-[120px] resize-none"
                placeholder="Paste the job description here to compare with your resume..."
                disabled={isAnalyzing || isTailoring}
              />
            </div>

            <Button
              onClick={handleJobAnalysis}
              disabled={isAnalyzing || !jobInput.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center">
                  <Spinner className="text-white" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Analyze Job Match
                </span>
              )}
            </Button>

            {/* Job Match Results */}
            {jobMatchResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 mt-6"
              >
                {/* Score Overview */}
                <div className="bg-stone-50 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <ScoreCard
                      title="Match Score"
                      score={jobMatchResults.matchPercentage}
                      maxScore={100}
                      size="lg"
                    />

                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex items-center gap-3 mb-3 justify-center sm:justify-start">
                        <h4 className="text-lg font-semibold text-stone-900">
                          Keyword Match
                        </h4>
                        <Badge variant={getMatchBadgeVariant(jobMatchResults.matchPercentage)}>
                          {jobMatchResults.matchLevel}
                        </Badge>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-stone-500 mb-1">
                          <span>Keywords matched</span>
                          <span>
                            {jobMatchResults.keyword_analysis?.matched_keywords || 0} of{" "}
                            {jobMatchResults.keyword_analysis?.total_keywords || 0}
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-amber-600 transition-all duration-500"
                            style={{
                              width: `${
                                jobMatchResults.keyword_analysis?.total_keywords
                                  ? (jobMatchResults.keyword_analysis.matched_keywords /
                                      jobMatchResults.keyword_analysis.total_keywords) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-stone-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-stone-900">
                        {jobMatchResults.keyword_analysis?.total_keywords || 0}
                      </div>
                      <div className="text-xs text-stone-500">Total Keywords</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">
                        {jobMatchResults.keyword_analysis?.matched_keywords || 0}
                      </div>
                      <div className="text-xs text-stone-500">Matched</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {(jobMatchResults.keyword_analysis?.total_keywords || 0) -
                          (jobMatchResults.keyword_analysis?.matched_keywords || 0)}
                      </div>
                      <div className="text-xs text-stone-500">Missing</div>
                    </div>
                  </div>
                </div>

                {/* Present Skills */}
                {jobMatchResults.presentSkills && (
                  <div className="bg-stone-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-stone-900 mb-4 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-2" />
                      Skills Found in Your Resume
                    </h4>
                    <div className="space-y-3">
                      {jobMatchResults.presentSkills.exact_matches?.length > 0 && (
                        <div>
                          <span className="text-xs text-emerald-600 font-medium">
                            Exact Matches
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {jobMatchResults.presentSkills.exact_matches.map(
                              (skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-1 text-xs"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                      {jobMatchResults.presentSkills.partial_matches?.length > 0 && (
                        <div>
                          <span className="text-xs text-amber-600 font-medium">
                            Partial Matches
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {jobMatchResults.presentSkills.partial_matches.map(
                              (skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="bg-amber-50 text-amber-700 rounded-full px-2 py-1 text-xs"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                      {jobMatchResults.presentSkills.transferable_skills?.length > 0 && (
                        <div>
                          <span className="text-xs text-blue-600 font-medium">
                            Transferable Skills
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {jobMatchResults.presentSkills.transferable_skills.map(
                              (skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-xs"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {jobMatchResults.missingSkills && (
                  <div className="bg-stone-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-stone-900 mb-4">
                      Skills to Add
                    </h4>
                    <div className="space-y-3">
                      {jobMatchResults.missingSkills.critical?.length > 0 && (
                        <div>
                          <span className="text-xs text-red-600 font-medium">
                            Critical
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {jobMatchResults.missingSkills.critical.map(
                              (skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="bg-red-50 text-red-700 rounded-full px-2 py-1 text-xs"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                      {jobMatchResults.missingSkills.important?.length > 0 && (
                        <div>
                          <span className="text-xs text-amber-600 font-medium">
                            Important
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {jobMatchResults.missingSkills.important.map(
                              (skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="bg-amber-50 text-amber-700 rounded-full px-2 py-1 text-xs"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                      {jobMatchResults.missingSkills.nice_to_have?.length > 0 && (
                        <div>
                          <span className="text-xs text-stone-500 font-medium">
                            Nice to Have
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {jobMatchResults.missingSkills.nice_to_have.map(
                              (skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="bg-stone-100 text-stone-600 rounded-full px-2 py-1 text-xs"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendation — left-border accent matching AnalysisResults pattern */}
                {jobMatchResults.recommendation && (
                  <div className="bg-stone-50 rounded-xl p-4 border-l-4 border-l-amber-500">
                    <h4 className="text-sm font-semibold text-stone-700 mb-2">
                      AI Recommendation
                    </h4>
                    <p className="text-stone-700 text-sm leading-relaxed italic">
                      {jobMatchResults.recommendation}
                    </p>
                  </div>
                )}

                {/* Tailor Resume Button */}
                <Button
                  onClick={handleTailorResume}
                  disabled={isTailoring}
                  className="w-full"
                >
                  {isTailoring ? (
                    <span className="flex items-center justify-center">
                      <Spinner className="text-white" />
                      Tailoring Your Resume...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Tailor My Resume for This Job
                    </span>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Tailor Results Section */}
        {activeSection === "tailor" && tailorResults && (
          <motion.div
            key="tailor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* ATS Score Improvement */}
            <div className="bg-stone-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-stone-900 mb-4">
                Estimated ATS Score Improvement
              </h4>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-stone-400">
                    {tailorResults.ats_improvement.before_score}%
                  </div>
                  <div className="text-xs text-stone-500 mt-1">Before</div>
                </div>
                <ArrowRightIcon className="h-6 w-6 text-amber-600" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {tailorResults.ats_improvement.after_score}%
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">After</div>
                </div>
                <div className="ml-4 px-3 py-1 bg-emerald-50 rounded-full">
                  <span className="text-sm font-medium text-emerald-700">
                    +
                    {tailorResults.ats_improvement.after_score -
                      tailorResults.ats_improvement.before_score}
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-stone-200">
              <Button
                variant="primary"
                onClick={() => {
                  useStore.getState().setActiveEditorTab("resume-editor");
                }}
                className="w-full"
              >
                <PencilSquareIcon className="h-5 w-5 mr-2" />
                Open in Resume Editor
              </Button>
              <p className="text-stone-400 text-sm mt-2 text-center">
                Edit your tailored resume and download as PDF
              </p>
            </div>

            {/* Overall Strategy */}
            <div className="bg-amber-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">
                Tailoring Strategy
              </h4>
              <p className="text-amber-800 text-sm leading-relaxed">
                {tailorResults.overall_strategy}
              </p>
            </div>

            {/* Keywords Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-emerald-600 mb-2">
                  Keywords Already Present
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {tailorResults.keywords_already_present.map(
                    (keyword, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 text-emerald-700 text-xs rounded-full px-2 py-0.5"
                      >
                        {keyword}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-amber-600 mb-2">
                  Keywords to Add
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {tailorResults.keywords_to_add.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="bg-amber-50 text-amber-700 text-xs rounded-full px-2 py-0.5"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section-by-Section Rewrites */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-stone-900">
                Section-by-Section Tailoring
              </h4>
              {tailorResults.sections.map(
                (section: TailorSection, index: number) => (
                  <Card
                    key={index}
                    shadow
                    overflow
                    padding="none"
                  >
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="h-5 w-5 text-amber-600" />
                        <span className="font-medium text-stone-900">
                          {section.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(
                            section.priority,
                          )}`}
                        >
                          {section.priority} Priority
                        </span>
                      </div>
                      {expandedSections.has(index) ? (
                        <ChevronUpIcon className="h-5 w-5 text-stone-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-stone-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedSections.has(index) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-stone-100"
                        >
                          <div className="p-4 space-y-4">
                            <div>
                              <span className="text-xs font-medium text-stone-500 uppercase">
                                Before
                              </span>
                              <div className="bg-stone-50 rounded-lg p-4 mt-2">
                                <p className="text-sm font-mono text-stone-600 whitespace-pre-wrap">
                                  {section.before}
                                </p>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-emerald-600 uppercase">
                                  After (Tailored)
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(section.after, index)
                                  }
                                  className="text-xs text-stone-400 hover:text-amber-600"
                                >
                                  {copiedIndex === index ? (
                                    <>
                                      <CheckCircleIcon className="h-4 w-4" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <ClipboardDocumentIcon className="h-4 w-4" />
                                      Copy
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="bg-emerald-50 rounded-lg p-4">
                                <p className="text-sm font-mono text-emerald-800 whitespace-pre-wrap">
                                  {section.after}
                                </p>
                              </div>
                            </div>

                            {section.changes.length > 0 && (
                              <div className="pt-3 border-t border-stone-100">
                                <span className="text-xs font-medium text-stone-500 mb-2 block">
                                  Changes Made:
                                </span>
                                <ul className="list-disc list-inside space-y-1">
                                  {section.changes.map((change, i) => (
                                    <li
                                      key={i}
                                      className="text-xs text-stone-700"
                                    >
                                      {change}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {section.keywords_added.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stone-100">
                                <span className="text-xs text-stone-500 mr-2">
                                  Keywords added:
                                </span>
                                {section.keywords_added.map((keyword, i) => (
                                  <span
                                    key={i}
                                    className="bg-amber-50 text-amber-700 text-xs rounded-full px-2 py-0.5"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default JobAnalysisPanel;
