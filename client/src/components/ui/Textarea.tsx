import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-stone-900 placeholder-stone-400",
        "focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all duration-200",
        error &&
          "border-red-300 focus:ring-red-500/20 focus:border-red-500",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
export default Textarea;
