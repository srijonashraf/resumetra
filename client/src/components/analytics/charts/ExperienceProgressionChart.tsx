import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";

interface ExperienceProgressionChartProps {
  data: Array<{
    date: Date;
    experience_level: string;
    score?: number;
  }>;
}

const EXPERIENCE_LEVEL_MAP: Record<string, number> = {
  "Entry-Level": 1,
  Junior: 2,
  "Mid-Level": 3,
  Senior: 4,
  "Lead/Principal": 5,
  Executive: 6,
};

const EXPERIENCE_LEVEL_LABELS: Record<number, string> = {
  1: "Entry",
  2: "Junior",
  3: "Mid",
  4: "Senior",
  5: "Lead",
  6: "Exec",
};

const ExperienceProgressionChart = ({
  data,
}: ExperienceProgressionChartProps) => {
  const chartData = data
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: item.date,
      experienceLevel: item.experience_level,
      levelValue: EXPERIENCE_LEVEL_MAP[item.experience_level] || 1,
    }))
    .sort(
      (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
    );

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-lg">
          <p className="text-stone-500 text-sm mb-1">
            {new Date(payload[0].payload?.fullDate as string).toLocaleDateString()}
          </p>
          <p className="text-amber-600 text-sm font-medium">
            {payload[0].payload?.experienceLevel as string}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value: number) => {
    return EXPERIENCE_LEVEL_LABELS[value] || "";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#78716C", fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: "#78716C", fontSize: 10 }}
            domain={[0, 7]}
            ticks={[1, 2, 3, 4, 5, 6]}
            tickFormatter={formatYAxisTick}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="levelValue"
            stroke="#D97706"
            strokeWidth={3}
            dot={{ fill: "#D97706", r: 6, stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 8, stroke: "#D97706", strokeWidth: 2, fill: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ExperienceProgressionChart;
