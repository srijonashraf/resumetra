import { cn } from "../../utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "gap-1", dot: "w-1.5 h-1.5" },
  md: { container: "gap-1.5", dot: "w-2.5 h-2.5" },
  lg: { container: "gap-2", dot: "w-3.5 h-3.5" },
} as const;

const Spinner = ({ size = "md", className }: SpinnerProps) => {
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center justify-center", s.container, className)}>
      <span
        className={cn(
          s.dot,
          "rounded-full bg-amber-500 animate-[aiPulse_1.4s_ease-in-out_infinite]",
        )}
      />
      <span
        className={cn(
          s.dot,
          "rounded-full bg-amber-500 animate-[aiPulse_1.4s_ease-in-out_0.2s_infinite]",
        )}
      />
      <span
        className={cn(
          s.dot,
          "rounded-full bg-amber-500 animate-[aiPulse_1.4s_ease-in-out_0.4s_infinite]",
        )}
      />
    </div>
  );
};

export default Spinner;
