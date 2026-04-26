import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { AnalysisResult } from "../../store/useStore";
import Card from "../ui/Card";

interface AnalysisRadarChartProps {
  analysisResults: AnalysisResult;
}

const AnalysisRadarChart = ({ analysisResults }: AnalysisRadarChartProps) => {
  const chartData = [
    { subject: "ATS Compatibility", score: analysisResults.scores.atsCompatibility },
    { subject: "Content Quality", score: analysisResults.scores.contentQuality },
    { subject: "Impact", score: analysisResults.scores.impact },
    { subject: "Readability", score: analysisResults.scores.readability },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#d6d3d1" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#57534e", fontSize: 13 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={{ fill: "#a8a29e" }}
            />
            <Radar
              name="Resume Score"
              dataKey="score"
              stroke="#d97706"
              fill="#fde68a"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
};

export default AnalysisRadarChart;
