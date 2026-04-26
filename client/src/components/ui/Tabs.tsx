import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type TabsVariant = "pill" | "segmented";

interface TabItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
}

interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  variant?: TabsVariant;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    { variant = "pill", tabs, activeTab, onTabChange, className, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        variant === "segmented" && "flex gap-2 bg-stone-100 p-1 rounded-xl",
        variant === "pill" && "flex flex-wrap gap-2",
        className,
      )}
      {...props}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        if (variant === "segmented") {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={cn(
                "flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-amber-600 text-white shadow-sm"
                  : isDisabled
                    ? "text-stone-400 cursor-not-allowed"
                    : "text-stone-600 hover:bg-stone-200",
              )}
            >
              {tab.label}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
              isActive
                ? "bg-amber-600 text-white shadow-sm"
                : isDisabled
                  ? "text-stone-300 cursor-not-allowed bg-stone-50"
                  : "text-stone-600 hover:text-amber-700 hover:bg-amber-50 bg-white border border-stone-200",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  ),
);

Tabs.displayName = "Tabs";
export default Tabs;
