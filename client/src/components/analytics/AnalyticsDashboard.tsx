import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  fetchSkillTrends,
  fetchExperienceProgression,
  fetchHistorySummary,
} from "../../services/api";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import SkillTrendsChart from "./charts/SkillTrendsChart";
import ExperienceProgressionChart from "./charts/ExperienceProgressionChart";
import ScoreCard from "../ui/ScoreCard";
import Card from "../ui/Card";
import { Button } from "../ui";
import { useAuth } from "../../hooks/useAuth";
import { HistorySummary, SkillGapTrend } from "../../store/useStore";

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillTrends, setSkillTrends] = useState<SkillGapTrend[]>([]);
  const [experienceProgression, setExperienceProgression] = useState<{ date: Date; experience_level: string }[]>([]);
  const [historySummary, setHistorySummary] = useState<HistorySummary | null>(
    null
  );
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [skillData, experienceData, summaryData] = await Promise.all([
          fetchSkillTrends(),
          fetchExperienceProgression(),
          fetchHistorySummary(),
        ]);

        setSkillTrends(skillData);
        setExperienceProgression(experienceData);
        setHistorySummary(summaryData);
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchAnalyticsData();
    } else if (isLoggedIn === false) {
      setLoading(false);
    }
  }, [isLoggedIn]);

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
            Sign in to view your analytics
          </h3>
          <p className="text-stone-500 mb-6 max-w-md mx-auto">
            Sign in to access your analytics dashboard with skill trends and
            experience progression insights.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            Login to View Analytics
          </Link>
        </Card>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <div className="flex items-center justify-center py-12">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-3 text-stone-500">Loading analytics...</span>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <p>{error}</p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Check if there's no data at all
  const hasNoData =
    skillTrends.length === 0 &&
    experienceProgression.length === 0 &&
    (!historySummary || historySummary.total_analyses === 0);

  if (hasNoData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card padding="xl" className="text-center">
          <ChartBarIcon className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h3 className="text-xl font-semibold font-heading text-stone-900 mb-2">
            No analysis history yet
          </h3>
          <p className="text-stone-400 text-sm max-w-md mx-auto">
            Upload and analyze your first resume to see insights
          </p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Page Heading */}
      <h2 className="text-xl font-semibold font-heading text-stone-900">
        Analytics Dashboard
      </h2>

      {/* Summary Score Cards */}
      {historySummary && (
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ScoreCard
              title="Overall Score"
              score={historySummary.average_overall_score}
            />
            <ScoreCard
              title="ATS Score"
              score={historySummary.average_ats_score}
            />
            <ScoreCard
              title="Content Quality"
              score={historySummary.average_content_quality_score}
            />
            <ScoreCard
              title="Impact"
              score={historySummary.average_impact_score}
            />
            <ScoreCard
              title="Readability"
              score={historySummary.average_readability_score}
            />
          </div>
        </div>
      )}

      {/* Stats Row */}
      {historySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-xs text-stone-500 uppercase tracking-wide">
              Total Analyses
            </p>
            <p className="text-lg font-semibold text-stone-900">
              {historySummary.total_analyses}
            </p>
          </div>
          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-xs text-stone-500 uppercase tracking-wide">
              Latest Analysis
            </p>
            <p className="text-lg font-semibold text-stone-900">
              {historySummary.latest_analysis
                ? new Date(historySummary.latest_analysis).toLocaleDateString()
                : "No analyses yet"}
            </p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Trends */}
        <Card>
          <h3 className="text-lg font-semibold font-heading text-stone-900 mb-4">
            Skill Trends
          </h3>
          {skillTrends.length > 0 ? (
            <SkillTrendsChart data={skillTrends} />
          ) : (
            <div className="h-64 flex items-center justify-center text-stone-400">
              <div className="text-center">
                <AcademicCapIcon className="h-12 w-12 mx-auto mb-2 text-stone-300" />
                <p className="text-sm">No skill trends data available</p>
              </div>
            </div>
          )}
        </Card>

        {/* Experience Progression */}
        <Card>
          <h3 className="text-lg font-semibold font-heading text-stone-900 mb-4">
            Experience Progression
          </h3>
          {experienceProgression.length > 0 ? (
            <ExperienceProgressionChart data={experienceProgression} />
          ) : (
            <div className="h-64 flex items-center justify-center text-stone-400">
              <div className="text-center">
                <ArrowTrendingUpIcon className="h-12 w-12 mx-auto mb-2 text-stone-300" />
                <p className="text-sm">
                  No experience progression data available
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
