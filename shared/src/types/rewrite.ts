export type GapClassification = "REWRITTEN" | "REFRAMED" | "MISSING";

export interface Rewrite {
  id: string;
  sectionId: string;
  itemId: string;
  field: string;
  before: string;
  after: string;
  rationale: string;
  keywordsAdded: string[];
  gapClassification: GapClassification;
  accepted: boolean | null;
}
