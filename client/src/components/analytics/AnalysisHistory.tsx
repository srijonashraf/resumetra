import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, AnalysisHistoryEntry } from "../../store/useStore";
import {
  CalendarIcon,
  ClockIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

import Badge from "../ui/Badge";
import Card from "../ui/Card";
import { Button } from "../ui";
import { cn } from "../../utils/cn";
import { deleteHistoryEntry } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const getRecommendationVariant = (
  rec: string,
): "success" | "warning" | "danger" | "info" | "neutral" => {
  switch (rec) {
    case "Strong Hire":
    case "Hire":
      return "success";
    case "Maybe":
      return "warning";
    case "No Hire":
      return "danger";
    case "Needs More Info":
      return "info";
    default:
      return "neutral";
  }
};

const AnalysisHistory = () => {
  const analysisHistory = useStore((state) => state.analysisHistory);
  const removeFromHistory = useStore((state) => state.removeFromHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  // Show login prompt for non-authenticated users
  if (isLoggedIn === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card padding="xl" className="text-center">
          <LockClosedIcon className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h3 className="text-xl font-semibold font-heading text-stone-900 mb-2">
            Sign in to view your history
          </h3>
          <p className="text-stone-500 mb-6 max-w-md mx-auto">
            Sign in to access your analysis history and track your resume
            improvements over time.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            Login to View History
          </Link>
        </Card>
      </motion.div>
    );
  }

  // Show empty state for authenticated users with no history
  if (analysisHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card padding="xl" className="text-center">
          <ClockIcon className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h3 className="text-xl font-semibold font-heading text-stone-900 mb-2">
            No analysis history
          </h3>
          <p className="text-stone-400 text-sm">
            Your analyzed resumes will appear here
          </p>
        </Card>
      </motion.div>
    );
  }

  const handleDelete = async (id: string) => {
    toast("Remove this analysis from history?", {
      action: {
        label: "Remove",
        onClick: async () => {
          try {
            await deleteHistoryEntry(id);
            removeFromHistory(id);
            toast.success("Analysis removed from history");
          } catch (error) {
            console.error("Failed to delete history:", error);
            toast.error("Failed to delete history entry.");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <h2 className="text-xl font-semibold font-heading text-stone-900">
        Analysis History
      </h2>

      <div className="space-y-4">
        {analysisHistory.map((entry: AnalysisHistoryEntry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Card
              hover="shadow"
              className={cn(
                expandedId === entry.id && "ring-2 ring-amber-500/20",
              )}
            >
              {/* Entry Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Date */}
                  <div className="flex items-center text-sm text-stone-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(entry.date).toLocaleDateString()} at{" "}
                      {new Date(entry.date).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Score badges */}
                  <div className="flex gap-2 mt-2">
                    <span className="bg-stone-100 rounded-lg px-2 py-1 text-xs font-medium text-stone-700">
                      ATS: {entry.analysisResults.scores.atsCompatibility}
                    </span>
                    <span className="bg-stone-100 rounded-lg px-2 py-1 text-xs font-medium text-stone-700">
                      Content: {entry.analysisResults.scores.contentQuality}
                    </span>
                    <span className="bg-stone-100 rounded-lg px-2 py-1 text-xs font-medium text-stone-700">
                      Impact: {entry.analysisResults.scores.impact}
                    </span>
                    <span className="bg-stone-100 rounded-lg px-2 py-1 text-xs font-medium text-stone-700">
                      Readability: {entry.analysisResults.scores.readability}
                    </span>
                  </div>
                </div>

                {/* Right side: hiring recommendation + actions */}
                <div className="flex items-center gap-2">
                  {entry.analysisResults.feedback?.hiringRecommendation && (
                    <Badge
                      variant={getRecommendationVariant(
                        entry.analysisResults.feedback.hiringRecommendation,
                      )}
                    >
                      {entry.analysisResults.feedback.hiringRecommendation}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpand(entry.id)}
                    className="text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                    title="View details"
                  >
                    {expandedId === entry.id ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    className="text-stone-400 hover:text-red-600 hover:bg-red-50"
                    title="Remove from history"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {expandedId === entry.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-stone-100 mt-4 pt-4 space-y-4">
                      {/* Missing Skills */}
                      {entry.analysisResults.feedback?.missingSkills &&
                        entry.analysisResults.feedback.missingSkills.length >
                          0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-stone-900 mb-2 flex items-center">
                              <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                              Missing Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {entry.analysisResults.feedback.missingSkills.map(
                                (skill, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-red-50 text-red-700 rounded-full px-2 py-0.5 text-xs"
                                  >
                                    {skill}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Suggestions */}
                      {entry.analysisResults.feedback?.suggestions && (
                        <div>
                          <h4 className="text-sm font-semibold text-stone-900 mb-2 flex items-center">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                            Improvement Suggestions
                          </h4>

                          {/* Immediate suggestions */}
                          {entry.analysisResults.feedback.suggestions
                            .immediate &&
                            entry.analysisResults.feedback.suggestions.immediate
                              .length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-xs font-semibold text-amber-600 mb-1">
                                  Immediate Actions
                                </h5>
                                <ul className="space-y-1">
                                  {entry.analysisResults.feedback.suggestions.immediate.map(
                                    (suggestion, idx) => (
                                      <li
                                        key={idx}
                                        className="text-sm text-stone-600 pl-4 border-l-2 border-green-200"
                                      >
                                        {suggestion}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}

                          {/* Short-term suggestions */}
                          {entry.analysisResults.feedback.suggestions
                            .shortTerm &&
                            entry.analysisResults.feedback.suggestions.shortTerm
                              .length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-xs font-semibold text-blue-600 mb-1">
                                  Short-term Goals
                                </h5>
                                <ul className="space-y-1">
                                  {entry.analysisResults.feedback.suggestions.shortTerm.map(
                                    (suggestion, idx) => (
                                      <li
                                        key={idx}
                                        className="text-sm text-stone-600 pl-4 border-l-2 border-blue-200"
                                      >
                                        {suggestion}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AnalysisHistory;
