import Card from "./Card";
import { formatScore } from "../../utils/formatScore";

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { ring: 48, strokeWidth: 4, fontSize: "text-sm", titleSize: "text-xs" },
  md: { ring: 64, strokeWidth: 5, fontSize: "text-lg", titleSize: "text-sm" },
  lg: { ring: 80, strokeWidth: 6, fontSize: "text-xl", titleSize: "text-base" },
} as const;

function getScoreColor(score: number, maxScore: number): string {
  const ratio = score / maxScore;
  if (ratio >= 0.7) return "stroke-emerald-500";
  if (ratio >= 0.4) return "stroke-amber-500";
  return "stroke-red-500";
}

function getScoreTextColor(score: number, maxScore: number): string {
  const ratio = score / maxScore;
  if (ratio >= 0.7) return "text-emerald-600";
  if (ratio >= 0.4) return "text-amber-600";
  return "text-red-600";
}

export default function ScoreCard({
  title,
  score,
  maxScore = 10,
  size = "md",
}: ScoreCardProps) {
  const config = sizeConfig[size];
  const radius = (config.ring - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / maxScore, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Card padding="sm" className="text-center">
      <svg
        width={config.ring}
        height={config.ring}
        className="mx-auto"
        role="img"
        aria-label={`${title}: ${score} out of ${maxScore}`}
      >
        <circle
          cx={config.ring / 2}
          cy={config.ring / 2}
          r={radius}
          fill="none"
          stroke="#E7E5E4"
          strokeWidth={config.strokeWidth}
        />
        <circle
          cx={config.ring / 2}
          cy={config.ring / 2}
          r={radius}
          fill="none"
          className={getScoreColor(score, maxScore)}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${config.ring / 2} ${config.ring / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x={config.ring / 2}
          y={config.ring / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className={`${config.fontSize} font-semibold ${getScoreTextColor(score, maxScore)}`}
        >
          {formatScore(score)}
        </text>
      </svg>
      <p className={`mt-2 font-medium text-stone-700 ${config.titleSize}`}>
        {title}
      </p>
    </Card>
  );
}
