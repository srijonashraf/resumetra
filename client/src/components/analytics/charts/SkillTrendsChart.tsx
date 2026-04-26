import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from "recharts";

interface SkillTrendsChartProps {
  data: Array<{
    skill?: string;
    skill_name?: string;
    frequency: number;
    trend?: number;
  }>;
}

const SkillTrendsChart = ({ data }: SkillTrendsChartProps) => {
  const chartData = (data || [])
    .filter((item) => item && (item.skill || item.skill_name))
    .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
    .slice(0, 10)
    .map((item) => {
      const skillName = item.skill || item.skill_name || "";
      return {
        skill:
          skillName.length > 12 ? skillName.slice(0, 10) + "..." : skillName,
        fullSkill: skillName,
        frequency: item.frequency || 0,
      };
    });

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-lg">
          <p className="text-stone-900 text-sm font-medium mb-1">
            {payload[0].payload?.fullSkill as string}
          </p>
          <p className="text-amber-600 text-sm">Frequency: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const colors = [
    "#D97706",
    "#F59E0B",
    "#FBBF24",
    "#FCD34D",
    "#FDE68A",
    "#F59E0B",
    "#D97706",
    "#B45309",
    "#92400E",
    "#78350F",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E7E5E4"
            vertical={false}
          />
          <XAxis
            dataKey="skill"
            tick={{ fill: "#78716C", fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis
            tick={{ fill: "#78716C" }}
            label={{
              value: "Frequency",
              angle: -90,
              position: "insideLeft",
              fill: "#78716C",
              fontSize: 12,
            }}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(217, 119, 6, 0.08)" }}
          />
          <Bar dataKey="frequency" radius={[4, 4, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SkillTrendsChart;
