# Phase 0: Pre-Build — Task Breakdown

## T1: npm Workspaces + Shared Package Scaffold ✅

**Acceptance**: Root package.json with workspaces. `shared/` compiles. Both server and client can `import { ... } from "@resumetra/shared"`.

**Verify**: `tsc --noEmit` passes on all three packages.

**Files**:
- `package.json` (new — root)
- `shared/package.json` (new)
- `shared/tsconfig.json` (new)
- `shared/src/index.ts` (new — barrel export with placeholder)
- `server/package.json` (edit — add shared dependency)
- `client/package.json` (edit — add shared dependency)
- `server/tsconfig.json` (edit — add shared to paths if needed)
- `client/tsconfig.app.json` (edit — add shared to paths if needed)

**Steps**:
1. Create root `package.json` with `"workspaces": ["shared", "server", "client"]`
2. Create `shared/package.json` — name: `@resumetra/shared`, type: module, main/types/dist setup
3. Create `shared/tsconfig.json` — target ES2022, module ESNext, declaration: true, outDir: dist
4. Create `shared/src/types/index.ts` — barrel export
5. Create `shared/src/schemas/index.ts` — barrel export
6. Create `shared/src/index.ts` — re-exports types + schemas
7. Add `"@resumetra/shared": "*"` to server dependencies
8. Add `"@resumetra/shared": "*"` to client dependencies
9. Run `npm install` from root to link workspaces
10. Verify imports work with a placeholder type

---

## T2: Vitest Setup ✅

**Acceptance**: `npm run test` works in both server/ and client/. Empty test passes.

**Verify**: `npm run test` exits 0 in both packages.

**Files**:
- `server/vitest.config.ts` (new)
- `server/src/__tests__/setup.test.ts` (new — placeholder)
- `client/vitest.config.ts` (new)
- `client/src/__tests__/setup.test.ts` (new — placeholder)
- `server/package.json` (edit — add vitest devDep + test script)
- `client/package.json` (edit — add vitest devDep + test script)

**Steps**:
1. `npm install -D vitest` in server/ (via workspace or direct)
2. `npm install -D vitest` in client/
3. Create `server/vitest.config.ts` — basic config with TypeScript
4. Create `client/vitest.config.ts` — basic config with TypeScript + jsdom environment
5. Add `"test": "vitest run"` and `"test:watch": "vitest"` to both package.json scripts
6. Create placeholder test files that just assert `true`
7. Verify `npm run test` passes in both

---

## T3: Core Types + Zod Schemas in shared/ ✅

**Acceptance**: All core pipeline types defined with matching Zod schemas. Importable from `@resumetra/shared`.

**Verify**: `tsc --noEmit` passes. Zod schemas parse valid fixtures and reject invalid ones (manual check).

**Files**:
- `shared/src/types/contact.ts`
- `shared/src/types/resumeDocument.ts`
- `shared/src/types/rewrite.ts`
- `shared/src/types/metrics.ts`
- `shared/src/types/index.ts` (update barrel)
- `shared/src/schemas/contact.ts`
- `shared/src/schemas/resumeDocument.ts`
- `shared/src/schemas/rewrite.ts`
- `shared/src/schemas/metrics.ts`
- `shared/src/schemas/index.ts` (update barrel)

**Types to define**:

```typescript
// contact.ts
interface ContactInfo {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
}

// resumeDocument.ts
type SectionType = "experience" | "text" | "list" | "table" | "raw";

interface DynamicSection {
  id: string;                    // UUID
  type: SectionType;
  title: string;                 // original section title from resume
  displayOrder: number;
  items: SectionItem[];
}

interface SectionItem {
  id: string;                    // UUID
  heading?: string;              // company/project name
  subheading?: string;           // job title/role
  dateRange?: string;            // "Jan 2022 – Present"
  description?: string;          // for text-type sections
  bullets?: string[];            // for experience-type sections
  items?: string[];              // for list-type sections
  rows?: Record<string, string>[]; // for table-type sections
  rawText?: string;              // for raw-type fallback
  metadata?: Record<string, string>;
}

interface ResumeDocument {
  contact: ContactInfo;
  sections: DynamicSection[];
  detectedProfession: string;    // profession ID or "generic"
  detectedCareerLevel: string;   // career level ID
}

// rewrite.ts
type GapClassification = "REWRITTEN" | "REFRAMED" | "MISSING";

interface Rewrite {
  id: string;
  sectionId: string;
  itemId: string;
  field: string;                 // "heading" | "subheading" | "bullets[0]" | "content" | "items[0]"
  before: string;
  after: string;
  rationale: string;
  keywordsAdded: string[];
  gapClassification: GapClassification;
  accepted: boolean | null;      // null = pending
}

// metrics.ts
interface FormattingIssue {
  type: string;                  // "table_layout" | "two_column" | "header_content" | "footer_content" | "decorative_bullets"
  severity: "high" | "medium" | "low";
  description: string;
  location?: string;
}

interface DeterministicMetrics {
  wordCount: number;
  bulletCount: number;
  avgBulletWordCount: number;
  sectionsPresent: string[];
  sectionsMissing: string[];
  bulletsWithActionVerb: number;
  bulletsWithMetric: number;
  formattingIssues: FormattingIssue[];
  careerLevelDetected: string;
  totalExperienceMonths: number;
}

interface PartialMatch {
  jdKeyword: string;
  resumeKeyword: string;
  similarity: number;
}

interface AtsReport {
  matchScore: number;            // 0-100
  resumeKeywords: string[];
  jdKeywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  partialMatches: PartialMatch[];
  sectionCoverage: Record<string, boolean>;
}
```

Each type gets a matching Zod schema with strict validation.

---

## T4: TemplateConfig Type + Schema ✅

**Acceptance**: `TemplateConfig` and `TemplateStyle` types defined with Zod schema. Importable from shared.

**Verify**: `tsc --noEmit` passes.

**Files**:
- `shared/src/types/templateConfig.ts`
- `shared/src/schemas/templateConfig.ts`
- `shared/src/types/index.ts` (update)
- `shared/src/schemas/index.ts` (update)

**Types to define**:

```typescript
interface TemplateStyle {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textMuted: string;
    background: string;
    surface: string;
  };
  fonts: {
    heading: { family: string; weights: number[] };
    body: { family: string; weights: number[] };
  };
  spacing: {
    sectionGap: number;
    itemGap: number;
    bulletGap: number;
    pageMargin: number;
  };
  layout: {
    columns: 1 | 2;
    sidebarWidth?: number;       // for 2-column layouts
    sidebarPosition?: "left" | "right";
  };
}

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  style: TemplateStyle;
  sectionRenderers: Record<SectionType, string>; // maps section type to renderer component key
  sectionOrder: string[];        // default section rendering order
}
```

---

## T5: ProfessionKnowledgeBase Interface ✅

**Acceptance**: `ProfessionKnowledgeBase` interface and all sub-types defined. Zod schema validates the structure.

**Verify**: `tsc --noEmit` passes.

**Files**:
- `server/src/knowledge/types.ts` (new)
- `server/src/knowledge/index.ts` (new — barrel)

**Types to define** (from master plan Section 6.2):

```typescript
interface CareerLevel {
  id: string;
  label: string;
  experienceRange: string;
  detectionHints: string[];
  requiredSections: string[];
  recommendedSections: string[];
  optionalSections: string[];
  irrelevantSections: string[];
  resumeLength: { target: number; maximum: number };
  sectionWeights: Record<string, number>;
}

interface SectionStandard {
  bulletFormula: string;
  bulletCountRange: [number, number];
  requiredElements: string[];
  forbiddenPatterns: string[];
  qualityIndicators: string[];
}

interface AtsRule {
  id: string;
  description: string;
  severity: "high" | "medium" | "low";
  check: string;
  userMessage: string;
}

interface RedFlag {
  id: string;
  pattern: string;
  severity: "high" | "medium" | "low";
  userMessage: string;
  suggestion: string;
}

interface LearningPath {
  courses: string[];
  projects: string[];
  timeline: string;
  resumeBulletExample: string;
}

interface ProfessionKnowledgeBase {
  professionId: string;
  displayName: string;
  aliases: string[];
  careerLevels: CareerLevel[];
  sectionStandards: Record<string, SectionStandard>;
  atsRules: AtsRule[];
  actionVerbs: { strong: string[]; weak: string[] };
  metricPatterns: string[];
  redFlags: RedFlag[];
  skillCategories: Record<string, { examples: string[]; atsWeight: number }>;
  keyRecruiterSignals: string[];
  commonJobTitles: string[];
  commonKeywords: string[];
  learningResources: Record<string, LearningPath>;
}
```

---

## T6: SWE Knowledge Base Config ✅

**Acceptance**: Complete `software_engineer.ts` knowledge base file that validates against `ProfessionKnowledgeBase` interface. Contains all career levels, section standards, action verbs, red flags, skill categories, and learning resources from master plan Section 5.

**Verify**: File compiles. Schema validation passes. All career levels present (new_grad through staff). Action verbs and red flags populated.

**Files**:
- `server/src/knowledge/software_engineer.ts` (new)

**Content source**: Master plan Sections 5.1–5.5 and Appendix B–D. All data from those sections encoded into the `ProfessionKnowledgeBase` structure.

---

## T7: Generic Knowledge Base Config ✅

**Acceptance**: `generic.ts` knowledge base that validates against `ProfessionKnowledgeBase` interface. Contains universal resume rules only — no profession-specific content.

**Verify**: File compiles. Schema validation passes. Single career level ("all_levels"). Universal rules only.

**Files**:
- `server/src/knowledge/generic.ts` (new)

**Content**: Universal resume rules — basic action verbs, generic ATS formatting rules, basic metric patterns. No profession-specific sections, skills, or red flags.

---

## T8: Knowledge Base Registry ✅

**Acceptance**: `registry.ts` exports `getKnowledgeBase(professionId)` that returns the correct knowledge base. Unknown IDs return generic.

**Verify**: Unit test: `getKnowledgeBase("software_engineer")` returns SWE config. `getKnowledgeBase("unknown")` returns generic config.

**Files**:
- `server/src/knowledge/registry.ts` (new)

---

## T9: New DB Migration (4 Tables) ✅

**Acceptance**: Migration creates `resume_sections`, `resume_tailor_rewrites`, `resume_ats_keywords`, `resume_section_scores`. References existing `resume_analyses` table. `npm run migrate:up` succeeds.

**Verify**: Run migration against dev DB. Check all 4 tables exist with correct columns and constraints.

**Files**:
- `server/migrations/YYYYMMDDHHMMSS_add_pipeline_v2_tables.js` (new)

**Schema** (from master plan Section 15.5):

```sql
resume_sections:
  id UUID PK
  analysis_id UUID FK → resume_analyses
  section_type TEXT
  section_title TEXT
  display_order INTEGER
  section_data JSONB (SectionItem[])
  created_at TIMESTAMPTZ

resume_tailor_rewrites:
  id UUID PK
  analysis_id UUID FK → resume_analyses
  section_id UUID FK → resume_sections
  item_id TEXT
  field TEXT
  before_text TEXT
  after_text TEXT
  rationale TEXT
  keywords_added TEXT[]
  gap_classification TEXT
  accepted BOOLEAN DEFAULT NULL
  created_at TIMESTAMPTZ

resume_ats_keywords:
  id UUID PK
  analysis_id UUID FK → resume_analyses UNIQUE
  resume_keywords TEXT[]
  jd_keywords TEXT[]
  matched_keywords TEXT[]
  missing_keywords TEXT[]
  match_score NUMERIC
  keyword_report JSONB
  created_at TIMESTAMPTZ

resume_section_scores:
  id UUID PK
  section_id UUID FK → resume_sections
  content_score NUMERIC
  impact_score NUMERIC
  issues JSONB
  created_at TIMESTAMPTZ
```

**Steps**:
1. Run `npm run migrate:create add_pipeline_v2_tables` in server/
2. Write up() with CREATE TABLE for all 4 tables
3. Write down() with DROP TABLE in reverse order
4. Test: `npm run migrate:up` then verify tables exist

---

## T10: AI Service GPT-4o + Tool Calling Setup ✅

**Acceptance**: `aiService.ts` updated to use GPT-4o via OpenAI API with tool calling support. Existing `generateJson<T>` still works. New `callTool<T>` helper added for agent tool calls.

**Verify**: `tsc --noEmit` passes. Existing pipeline still works with new model config (manual test).

**Files**:
- `server/src/services/aiService.ts` (edit)
- `server/.env` (edit — update model config, NOT committed)

**Steps**:
1. Add `callTool<T>(messages, tools, toolName, schema)` helper function
   - Sends messages with tool definitions
   - Parses tool call response
   - Validates against Zod schema
   - Returns typed result
2. Keep existing `generateJson<T>` working for backward compatibility
3. Export new helper for use by agents in later phases
4. Update `.env` to use OpenAI API directly (remove OpenRouter base URL)

**callTool interface**:
```typescript
interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>; // JSON Schema
  };
}

async function callTool<T>(
  messages: OpenAI.ChatCompletionMessageParam[],
  tools: ToolDefinition[],
  targetTool: string,
  schema: z.ZodSchema<T>,
  maxRetries?: number,
): Promise<AiResult<T>>;
```

---

## T11: Final Verification ✅

**Acceptance**: All three packages compile. Tests pass. Migration runs. Knowledge bases load.

**Verify**:
1. `cd shared && tsc --noEmit` → 0 errors
2. `cd server && tsc --noEmit` → 0 errors
3. `cd client && tsc --noEmit` → 0 errors
4. `cd server && npm run test` → passes
5. `cd client && npm run test` → passes
6. `cd server && npm run migrate:up` → succeeds (or already up)
7. Manual: import `@resumetra/shared` in a server file and client file → resolves correctly

**Files**: No new files. Verification only. Fix any issues found.
