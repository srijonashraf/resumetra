import { motion } from "framer-motion";
import { AnalysisResult } from "../../store/useStore";
import AnalysisRadarChart from "./AnalysisRadarChart";
import ScoreCard from "../ui/ScoreCard";
import Card from "../ui/Card";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface AnalysisResultsProps {
  analysisResults: AnalysisResult;
}

const AnalysisResults = ({ analysisResults }: AnalysisResultsProps) => {
  const hiringRec = analysisResults.feedback?.hiringRecommendation;

  const summary = analysisResults.feedback?.summary;

  const strengths = analysisResults.feedback?.strengths ?? [];

  const improvementAreas = analysisResults.feedback?.improvementAreas ?? [];

  const missingSkills = analysisResults.feedback?.missingSkills ?? [];

  const redFlags = analysisResults.feedback?.redFlags ?? [];

  const suggestions = analysisResults.feedback?.suggestions ?? {
    immediate: [],
    shortTerm: [],
    longTerm: [],
  };

  const technicalSkills = analysisResults.parsedData?.technicalSkills ?? [];

  const softSkills = analysisResults.parsedData?.softSkills ?? [];

  const metrics = analysisResults.metrics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-stone-900 mb-2">
          Resume Analysis Results
        </h2>
        <p className="text-stone-500 max-w-2xl mx-auto">
          Comprehensive analysis of your resume with actionable insights and
          recommendations
        </p>
      </div>

      {/* Overall Score & Hiring Recommendation */}
      <Card overflow padding="none">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Score */}
          <div className="flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-stone-200">
            <ScoreCard
              title="Overall Score"
              score={analysisResults.overallScore}
              maxScore={10}
              size="lg"
            />
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <span className="bg-stone-100 text-stone-700 rounded-full px-3 py-1 text-sm font-medium">
                {analysisResults.experienceLevel}
              </span>
              <span className="bg-stone-100 text-stone-700 rounded-full px-3 py-1 text-sm font-medium">
                {analysisResults.yearsOfExperience}+ years
              </span>
            </div>
          </div>

          {/* Right: Hiring Recommendation */}
          <div className="flex flex-col items-center justify-center p-8 bg-stone-50/50">
            <p className="text-sm text-stone-500 mb-3 font-medium uppercase tracking-wide">
              Hiring Recommendation
            </p>
            <div
              className={`text-3xl md:text-4xl font-bold font-heading mb-2 ${
                hiringRec === "Strong Hire" || hiringRec === "Hire"
                  ? "text-emerald-600"
                  : hiringRec === "Maybe"
                    ? "text-amber-600"
                    : hiringRec === "No Hire"
                      ? "text-red-600"
                      : "text-blue-600"
              }`}
            >
              {hiringRec}
            </div>
            {(() => {
              const verdict =
                hiringRec === "Strong Hire" || hiringRec === "Hire"
                  ? "Your resume makes a strong impression on recruiters."
                  : hiringRec === "Maybe"
                    ? "Your resume has potential but needs targeted improvements."
                    : hiringRec === "No Hire"
                      ? "Significant improvements needed before applying."
                      : "More information needed for a complete assessment.";
              return (
                <p className="text-sm text-stone-500 text-center max-w-xs">
                  {verdict}
                </p>
              );
            })()}
          </div>
        </div>
      </Card>

      {/* 4 Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreCard
          title="ATS Compatibility"
          score={analysisResults.scores.atsCompatibility}
          maxScore={10}
        />
        <ScoreCard
          title="Content Quality"
          score={analysisResults.scores.contentQuality}
          maxScore={10}
        />
        <ScoreCard
          title="Impact"
          score={analysisResults.scores.impact}
          maxScore={10}
        />
        <ScoreCard
          title="Readability"
          score={analysisResults.scores.readability}
          maxScore={10}
        />
      </div>

      {/* Radar Chart */}
      <AnalysisRadarChart analysisResults={analysisResults} />

      {/* Resume Metrics Section */}
      {metrics && (
        <Card>
          <h3 className="text-xl font-semibold text-stone-900 mb-4">
            Resume Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Words", value: metrics.wordCount },
              { label: "Pages (est.)", value: metrics.pageCount },
              { label: "Bullet Points", value: metrics.bulletPointCount },
              { label: "Skills Found", value: metrics.skillsCount },
              { label: "Grammar Issues", value: metrics.grammarIssuesCount },
              { label: "Passive Voice", value: metrics.passiveVoiceCount },
              {
                label: "Achievements w/ Metrics",
                value: metrics.measurableAchievementsCount,
              },
              {
                label: "Section Score",
                value: `${metrics.sectionCompletenessScore}%`,
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="bg-stone-50 rounded-xl p-3 text-center"
              >
                <p className="text-xs text-stone-500 uppercase tracking-wide">
                  {metric.label}
                </p>
                <p className="text-lg font-semibold text-stone-900">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Info Checklist */}
          <div className="mt-4 pt-4 border-t border-stone-200">
            <p className="text-sm font-medium text-stone-600 mb-2">
              Contact Info
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Email", found: metrics.hasEmail },
                { label: "Phone", found: metrics.hasPhone },
                { label: "LinkedIn", found: metrics.hasLinkedin },
                { label: "Portfolio", found: metrics.hasPortfolio },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 text-sm text-stone-600"
                >
                  {item.found ? (
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-stone-300" />
                  )}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ATS Compatibility */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-stone-900">
            ATS Compatibility
          </h3>
          <span className="text-2xl font-bold text-stone-900">
            {analysisResults.atsCompatibility.score}/100
          </span>
        </div>
        <div className="space-y-3">
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-amber-600 transition-all"
              style={{ width: `${analysisResults.atsCompatibility.score}%` }}
            ></div>
          </div>
          {(() => {
            const realIssues = analysisResults.atsCompatibility.issues.filter(
              (issue) =>
                !issue.toLowerCase().includes("none") && issue.trim() !== "",
            );
            if (realIssues.length > 0) {
              return (
                <div>
                  <h4 className="text-sm font-medium text-amber-700 mb-2">
                    Issues to Fix:
                  </h4>
                  <ul className="space-y-1">
                    {realIssues.map((issue, index) => (
                      <li
                        key={index}
                        className="flex items-start text-sm text-stone-700"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-amber-500" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return (
              <div className="flex items-center text-sm text-emerald-600">
                <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                No ATS issues detected — your resume is well-formatted!
              </div>
            );
          })()}
        </div>
      </Card>

      {/* Summary */}
      {summary && (
        <Card>
          <h3 className="text-xl font-semibold text-stone-900 mb-3">
            Analysis Summary
          </h3>
          <p className="text-stone-600 leading-relaxed">{summary}</p>
        </Card>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-stone-900 mb-4">
            Strength Areas
          </h3>
          <Card accent="border-l-4 border-l-emerald-500">
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-stone-700 text-sm leading-relaxed">
                    {strength}
                  </span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Weaknesses / Improvement Areas */}
      {improvementAreas.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-stone-900 mb-4">
            Improvement Areas
          </h3>
          <Card accent="border-l-4 border-l-amber-500">
            <ul className="space-y-3">
              {improvementAreas.map((area, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-stone-700 text-sm leading-relaxed">
                    {area}
                  </span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-red-700 mb-4">
            Red Flags ({redFlags.length})
          </h3>
          <Card accent="border-l-4 border-l-red-500">
            <ul className="space-y-3">
              {redFlags.map((flag, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-stone-700 text-sm leading-relaxed">
                    {flag}
                  </span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Detected Skills */}
      {(technicalSkills.length > 0 || softSkills.length > 0) && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-stone-900 mb-4">
            Detected Skills
          </h3>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technicalSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-stone-500 mb-2">
                    Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {technicalSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-stone-100 text-stone-700 rounded-full px-3 py-1 text-sm inline-flex items-center gap-1"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {softSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-stone-500 mb-2">
                    Soft Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {softSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-stone-100 text-stone-700 rounded-full px-3 py-1 text-sm inline-flex items-center gap-1"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-stone-900 mb-4">
            Missing Skills
          </h3>
          <Card accent="border-l-4 border-l-amber-500">
            <ul className="space-y-2">
              {missingSkills.map((skill, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="flex items-center"
                >
                  <XCircleIcon className="h-4 w-4 text-stone-400 mr-2 flex-shrink-0" />
                  <span className="text-stone-700 text-sm">{skill}</span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Suggestions / Recommendations */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-stone-900 mb-4">
          Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.immediate.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-red-700 mb-3">
                Immediate Actions
              </h4>
              <ul className="space-y-2">
                {suggestions.immediate.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-stone-700"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-red-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {suggestions.shortTerm.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-amber-700 mb-3">
                Short-term Goals
              </h4>
              <ul className="space-y-2">
                {suggestions.shortTerm.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-stone-700"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-amber-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {suggestions.longTerm.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-blue-700 mb-3">
                Long-term Goals
              </h4>
              <ul className="space-y-2">
                {suggestions.longTerm.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-stone-700"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisResults;
