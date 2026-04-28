import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";
import type { ExtractionResult } from "../../store/useStore";

type SectionItem = ExtractionResult["document"]["sections"][number];
type SectionType = SectionItem["type"];

interface SectionConfirmationProps {
  sections: SectionItem[];
  onConfirm: () => void;
}

const TYPE_BADGE_VARIANT: Record<SectionType, "info" | "neutral" | "warning"> = {
  experience: "info",
  text: "neutral",
  list: "neutral",
  table: "neutral",
  raw: "warning",
};

export default function SectionConfirmation({
  sections,
  onConfirm,
}: SectionConfirmationProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.displayOrder - b.displayOrder),
    [sections],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card padding="lg">
        <h2 className="text-2xl font-bold text-stone-900 mb-6 text-center">
          We found {sortedSections.length} section
          {sortedSections.length !== 1 ? "s" : ""} in your resume
        </h2>

        <div className="space-y-3">
          {sortedSections.map((section) => (
            <div
              key={section.id}
              className="flex items-center justify-between px-4 py-3 bg-stone-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-stone-800">
                  {section.title}
                </span>
                <Badge variant={TYPE_BADGE_VARIANT[section.type]}>
                  {section.type}
                </Badge>
              </div>
              <span className="text-sm text-stone-500">
                {section.items.length}{" "}
                {section.items.length === 1 ? "item" : "items"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <Button onClick={onConfirm} className="w-full">
            Looks good, continue
          </Button>

          {!showFeedback ? (
            <button
              onClick={() => setShowFeedback(true)}
              className="w-full text-sm text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
            >
              Something&apos;s missing?
            </button>
          ) : (
            <div className="space-y-3 pt-2">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what's missing or incorrect..."
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={1000}
              />
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedback("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  className="flex-1 opacity-60"
                >
                  Submit Feedback (coming soon)
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
