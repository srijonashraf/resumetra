import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  shadow?: boolean;
  hover?: "none" | "shadow" | "lift";
  accent?: string;
  overflow?: boolean;
}

const paddingMap: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-12",
};

const hoverMap: Record<NonNullable<CardProps["hover"]>, string> = {
  none: "",
  shadow: "hover:shadow-md transition-shadow duration-200",
  lift: "hover:-translate-y-1 hover:shadow-lg transition-all duration-300",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      padding = "md",
      shadow = false,
      hover = "none",
      accent,
      overflow = false,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "bg-white border border-stone-200 rounded-2xl",
        paddingMap[padding],
        shadow && "shadow-sm",
        hoverMap[hover],
        accent,
        overflow && "overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = "Card";
export default Card;
