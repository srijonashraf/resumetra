# Phase 2: Analysis + ATS Scoring — Implementation Plan

## Context

Phase 0 (shared types, schemas, KB, migrations) and Phase 1 (validation + extraction pipeline) are COMPLETE. Phase 1 produces structured `ResumeDocument` with sections, profession detection, career level, and section coverage — but NO scores, metrics, feedback, or ATS analysis.

Phase 2 builds the deterministic + AI analysis layer on top of extraction output. **Old `/analyze` route and its companions will be removed** — no legacy compatibility needed, we're in development.

**Integration point**: `ResumeHealthCheck.tsx:136` — disabled "Continue to Analysis" button becomes the trigger.

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Route | Replace `/analyze` in-place. Remove old `parseAndScore` + `generateFeedback` + old 4-table composite writes | Dev stage — no legacy needed. Clean slate |
| Persistence | New pipeline v2 tables (`resume_section_scores`, `resume_ats_keywords`) | Already exist from Phase 0 migration |
| Client flow | Unified: extraction → user reviews → "Continue to Analysis" triggers analysis SSE | Single coherent pipeline |
| SSE | Separate SSE connection for analysis | User reviews sections before proceeding |
| Scoring | All numbers from code, not AI | Deterministic = reproducible = trustworthy |
| Derived endpoints | `/job-match`, `/career-map`, `/tailor` temporarily non-functional until rebuilt against new data model in Phase 3 | Can't read from tables that no longer get written to |

---

## Cleanup Scope (old `/analyze` pipeline removal)

**Files to remove or gut**:
- `server/src/services/aiService.ts` — remove `parseAndScore()`, `generateFeedback()`, old `CoreAnalysisData`, `FeedbackData` types, old schemas. Keep `generateJson`, `callTool`, `generateCareerMap`, `compareWithJobDescription`, `tailorResume` (they get rebuilt later or kept temporarily)
- `server/src/schemas.ts` — remove `coreAnalysisDataSchema`, `feedbackDataSchema`, `notAResumeSchema`, `compositeRowSchema`. Keep `jobComparisonResultSchema`, `careerMapResultSchema`, `tailorResultSchema` temporarily
- `server/src/services/historyService.ts` — remove `createAnalysis()` (4-table composite write), `COMPOSITE_SELECT`/`COMPOSITE_JOINS`, `getAnalysisContext()`, `getUserHistory()`/`getUserHistoryCount()` (old composite reads), `getAnalysisById()` (old composite read). Rebuild against new tables in this phase or later
- `server/src/routes/api.ts` — remove old `POST /analyze` handler. Remove `/history` endpoints temporarily (will rebuild against new schema). Keep `/job-match`, `/career-map`, `/tailor` routes but they'll 503 until Phase 3
- `client/src/services/api.ts` — remove `analyzeResumeStream()` (old SSE). Replace with new analysis function
- `client/src/store/useStore.ts` — remove old `analysisResults`, `analysisPhase` ("scoring"/"feedback"/"complete"). Replace with new v2 state
- `client/src/types/api-responses.ts` — remove `SSEScoringPayload`, `SSEFeedbackPayload`, `SSECompletePayload`, old `AnalysisCompositeResponse`
- `client/src/components/analytics/AnalysisResults.tsx` — rebuild against new `AnalysisResultV2` shape
- `client/src/components/analytics/AnalysisHistory.tsx` — temporarily disabled
- `client/src/components/analytics/AnalyticsDashboard.tsx` — temporarily disabled
- `client/src/components/analytics/AnalysisRadarChart.tsx` — adapt to new score shape

**Old DB tables kept but no longer written to**: `resume_metrics`, `resume_parsed_data`, `resume_feedback`. New migration can drop them later.

---

## Dependency Graph

```
T0 (Cleanup old pipeline)
  │
  v
T7 (Shared Types)
  │
  ├─→ T1 (Stage 2 Metrics) ──┐
  ├─→ T2 (ATS Scoring)  ─────┤
  └─→ T3 (Analysis Tools) ───┤
                              │
         T4 (Persistence) ←───┤ (needs T1 output types)
                              │
         T5 (Stage 3 Agent) ←─┘ (needs T1, T3)
                │
                v
         T6 (Pipeline Orchestrator + Route) (needs T1-T5)
                │
                v
         T8 (Client API + Store) (needs T6 SSE contract)
                │
                v
         T9 (Analysis Results UI) (needs T8)
                │
                v
         T10 (Integration Verification)
```

**Critical path**: T0 → T7 → T1 → T5 → T6 → T8 → T9 → T10

**Parallelizable**: T1, T2, T3 can run in parallel after T7. T4 can start after T1.

---

## Task Breakdown

### T0: Cleanup Old Pipeline

**Acceptance**: Old `/analyze` route removed. `parseAndScore`, `generateFeedback` removed from aiService. Old composite schemas/history removed. `tsc --noEmit` passes on server. Old client analysis flow removed.

**Files**:
- `server/src/services/aiService.ts` (edit) — remove `parseAndScore`, `generateFeedback`, `CoreAnalysisData`, `FeedbackData`, related helper types
- `server/src/schemas.ts` (edit) — remove `coreAnalysisDataSchema`, `feedbackDataSchema`, `notAResumeSchema`, `compositeRowSchema`
- `server/src/services/historyService.ts` (edit) — remove `createAnalysis`, `COMPOSITE_SELECT`/`COMPOSITE_JOINS`, old composite reads. Keep `saveTokenUsage`, `getCachedCareerMap`, `saveCareerMap`. Stub or remove history endpoints that rely on old composite
- `server/src/routes/api.ts` (edit) — remove `POST /analyze` handler. Comment out or stub `/history*` endpoints that break. Mark `/job-match`, `/career-map`, `/tailor` as temporarily returning 503
- `client/src/services/api.ts` (edit) — remove `analyzeResumeStream`
- `client/src/store/useStore.ts` (edit) — remove `analysisResults`, old `analysisPhase`, related actions. Keep extraction state
- `client/src/types/api-responses.ts` (edit) — remove `SSEScoringPayload`, `SSEFeedbackPayload`, `SSECompletePayload`, `AnalysisCompositeResponse`

**Verify**: `cd server && npx tsc --noEmit` && `cd client && npx tsc --noEmit`

---

### T7: Shared Analysis v2 Types

**Acceptance**: New types importable from `@resumetra/shared`. `tsc --noEmit` passes all 3 packages.

**Files**:
- `shared/src/types/metrics.ts` (new) — `SectionMetric`, `SectionScore`, `SectionIssue`, `ReadabilityAssessment`, `AnalysisResultV2`
- `shared/src/schemas/metrics.ts` (new) — matching Zod schemas
- `shared/src/types/index.ts` (edit) — add exports
- `shared/src/schemas/index.ts` (edit) — add exports

**New types**:
```typescript
interface SectionMetric {
  sectionId: string;
  title: string;
  wordCount: number;
  bulletCount: number;
  avgBulletWordCount: number;
  bulletsWithActionVerb: number;
  bulletsWithMetric: number;
}

interface SectionIssue {
  itemId: string | null;
  type: string;
  severity: "high" | "medium" | "low";
  description: string;
  suggestion: string;
}

interface SectionScore {
  sectionId: string;
  contentScore: number;    // 0-10
  impactScore: number;     // 0-10
  issues: SectionIssue[];
}

interface ReadabilityAssessment {
  score: number;           // 0-10
  issues: SectionIssue[];
}

interface AnalysisResultV2 {
  deterministicMetrics: DeterministicMetrics;
  sectionMetrics: SectionMetric[];
  sectionScores: SectionScore[];
  readability: ReadabilityAssessment;
  atsReport: AtsReport | null;
  keywordFrequency: Record<string, number>;
}
```

**Verify**: `cd shared && npx tsc --noEmit`

---

### T1: Deterministic Metrics Engine

**Acceptance**: Pure function. Same input = identical output. Zero AI. Tests pass.

**Files**:
- `server/src/stages/stage2_metrics.ts` (new)
- `server/src/stages/__tests__/stage2_metrics.test.ts` (new)

**Function**:
```typescript
interface MetricsOutput extends DeterministicMetrics {
  perSection: SectionMetric[];
  keywordFrequency: Record<string, number>;
}

function computeDeterministicMetrics(
  document: ResumeDocument,
  kb: ProfessionKnowledgeBase,
  sectionCoverage: ExtractionResult["sectionCoverage"]
): MetricsOutput
```

**Computes**:
1. Word count per section + total — iterate all text fields, split whitespace, count
2. Bullet count — count `item.bullets?.length ?? 0` for experience-type sections
3. Avg bullet word count — total bullet words / bullet count
4. Action verb presence — first word of each bullet → lookup in `kb.actionVerbs.strong[]` / `weak[]`
5. Metric presence — regex patterns from `kb.metricPatterns[]` against each bullet
6. Section coverage — pass through from extraction result
7. ATS formatting checks — detect table sections, non-standard bullet chars, produce `FormattingIssue[]`
8. Keyword frequency — tokenize all text, normalize, count, exclude stop words

**Verify**: `npx vitest run server/src/stages/__tests__/stage2_metrics.test.ts`

---

### T2: ATS Scoring Engine

**Acceptance**: Pure functions. Trigram similarity correct. No AI. Tests pass.

**Files**:
- `server/src/stages/atsScoring.ts` (new)
- `server/src/stages/__tests__/atsScoring.test.ts` (new)

**Functions**:
```typescript
function computeAtsFormattingScore(
  metrics: DeterministicMetrics,
  kb: ProfessionKnowledgeBase
): { score: number; issues: FormattingIssue[] }

function computeKeywordMatchScore(
  resumeKeywords: string[],
  jdKeywords: string[],
  sectionCoverage: Record<string, boolean>
): {
  exactMatchScore: number;
  partialMatchScore: number;
  sectionCoverageScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  partialMatches: PartialMatch[];
  overallAtsScore: number;
}
```

**Formula**: `atsScore = (exact * 0.5) + (partial * 0.2) + (sectionCoverage * 0.2) + (formatting * 0.1)`

**Partial matching**: Character trigrams, Jaccard similarity >= 0.8

**Verify**: `npx vitest run server/src/stages/__tests__/atsScoring.test.ts`

---

### T3: Analysis Agent Tools + Prompts

**Acceptance**: Tool definitions valid OpenAI format. Zod schemas validate/reject. Tests pass.

**Files**:
- `server/src/stages/analysisTools.ts` (new) — tool defs + Zod schemas
- `server/src/stages/analysisPrompts.ts` (new) — system prompt
- `server/src/stages/__tests__/analysisTools.test.ts` (new)

**Tools**:
- `extract_jd_keywords` — extract skills/tools/requirements from JD text
- `score_section` — rate section content + impact (0-10 each)
- `flag_issue` — identify specific problem with severity + suggestion
- `assess_readability` — evaluate overall document language

**Pattern**: Same as `extractTools.ts` — `ToolDefinition` + Zod response schema pairs.

**Verify**: `npx vitest run server/src/stages/__tests__/analysisTools.test.ts`

---

### T4: Pipeline v2 Persistence

**Acceptance**: Transaction-wrapped writes to `resume_section_scores` + `resume_ats_keywords`. Existing `saveSections` untouched.

**Files**:
- `server/src/db/sections.ts` (edit) — add `saveAnalysisResults`, `loadAnalysisResults`

**Functions**:
```typescript
async function saveAnalysisResults(input: {
  analysisId: string;
  sectionMetrics: SectionMetric[];
  sectionScores: SectionScore[];
  atsReport: AtsReport | null;
  keywordFrequency: Record<string, number>;
}): Promise<void>

async function loadAnalysisResults(analysisId: string): Promise<AnalysisResultV2 | null>
```

**Tables**: `resume_section_scores` (per-section scores + issues), `resume_ats_keywords` (per-analysis keyword data)

**Verify**: Manual test with dev DB or mock pool test

---

### T5: Stage 3 Analysis Agent

**Acceptance**: Agent uses tool calls, receives metrics as ground truth, does NOT recompute. SSE per section. Tests pass (mocked AI).

**Files**:
- `server/src/stages/stage3_analysis.ts` (new)
- `server/src/stages/__tests__/stage3_analysis.test.ts` (new)

**Function**:
```typescript
async function runAnalysisAgent(
  document: ResumeDocument,
  metrics: MetricsOutput,
  kb: ProfessionKnowledgeBase,
  sendSSE: PipelineSSESender,
): Promise<{ sectionScores: SectionScore[]; readability: ReadabilityAssessment }>
```

**Flow**: For each section → SSE "analyzing" → `callTool(score_section)` → `callTool(flag_issue)` if problems → collect results. Final: `callTool(assess_readability)`.

**Pattern**: Same as `stage1_extract.ts` — uses `callTool` from `aiService.ts`.

**Verify**: `npx vitest run server/src/stages/__tests__/stage3_analysis.test.ts`

---

### T6: Pipeline Orchestrator + Route

**Acceptance**: `POST /analyze` replaced with new pipeline. SSE events stream. Results persist. Tests pass.

**Files**:
- `server/src/services/pipelineService.ts` (edit) — add `runAnalysisPipeline`
- `server/src/routes/api.ts` (edit) — add new `POST /analyze` route using new pipeline

**`runAnalysisPipeline` flow**:
1. Load `ResumeDocument` from `resume_sections` by `analysisId`
2. Load profession + KB
3. SSE `"computing_metrics"` → `computeDeterministicMetrics()`
4. SSE `"metrics_complete"` → send metrics
5. If JD provided: `extractJdKeywords` AI call → `computeKeywordMatchScore`
6. Per section: SSE `"analyzing"` → `runAnalysisAgent()`
7. Persist via `saveAnalysisResults()`
8. SSE `"complete"` → send full `AnalysisResultV2`

**Route**: `{ analysisId, jobDescription? }` → SSE stream. Require auth. Validate ownership.

**Verify**: Manual: extract resume → get analysisId → call `/analyze` → verify SSE events + DB records

---

### T8: Client API + Store

**Acceptance**: SSE streaming works for new `/analyze`. Store phases update correctly. `tsc --noEmit` passes.

**Files**:
- `client/src/services/api.ts` (edit) — add `analyzeResumeStream` (new version)
- `client/src/types/api-responses.ts` (edit) — add SSE event types for new analysis
- `client/src/store/useStore.ts` (edit) — add new analysis state

**New SSE types**: `SSEMetricsCompletePayload`, `SSEAnalyzingProgress`, `SSEAnalysisCompletePayload`

**Store additions**: `analysisResult: AnalysisResultV2 | null`, `analysisPhase` ("idle" | "computing_metrics" | "analyzing" | "complete" | "error"), `setAnalysisResult`, `setAnalysisPhase`

**Pattern**: Same as `extractResumeStream()` in `api.ts`

**Verify**: `cd client && npx tsc --noEmit`

---

### T9: Analysis Results UI

**Acceptance**: "Continue to Analysis" button works. Results show metrics, scores, ATS report. Issues ordered by severity.

**Files**:
- `client/src/components/analytics/AnalysisResults.tsx` (edit — rebuild) — adapt to new `AnalysisResultV2` shape
- `client/src/components/analytics/AtsKeywordReport.tsx` (new) — keyword breakdown
- `client/src/components/analytics/SectionScoreCard.tsx` (new) — per-section scores
- `client/src/components/analytics/AnalysisRadarChart.tsx` (edit) — adapt to new metrics
- `client/src/components/upload/ResumeHealthCheck.tsx` (edit) — wire "Continue to Analysis" button
- `client/src/pages/Dashboard.tsx` (edit) — replace old analysis flow with new pipeline

**ResumeHealthCheck change**: Remove `disabled` from button. On click → call `analyzeResumeStream(analysisId)` → show progress → render `AnalysisResults`.

**Dashboard flow**: Extraction complete → HealthCheck → "Continue to Analysis" → SSE progress → Results display

**Verify**: Upload PDF → extract → click "Continue to Analysis" → verify results display

---

### T10: Integration Verification

**Verify**:
1. `cd shared && npx tsc --noEmit` — 0 errors
2. `cd server && npx tsc --noEmit` — 0 errors
3. `cd client && npx tsc --noEmit` — 0 errors
4. `cd server && npx vitest run` — all tests pass
5. `cd client && npx vitest run` — all tests pass
6. Manual: upload resume → extract → analyze → verify results
7. Manual: call `/analyze` twice with same analysisId → identical deterministic scores
8. Manual: no JD case shows metrics + section scores without ATS keyword report
9. Manual: verify `/extract` still works independently

---

## Checkpoint

After T10, verify spec Phase 2 success criteria:
- [ ] Deterministic word counts match manual count within ±2
- [ ] Bullet quality scoring: action verb + metric presence — all code
- [ ] Career level detection matches manual assessment
- [ ] ATS formatting checks detect tables, columns, decorative bullets
- [ ] With JD: keyword extraction (AI) + exact/partial matching (code)
- [ ] ATS score traces to specific keywords, sections, checks — explainable
- [ ] Same resume twice = identical scores
- [ ] Analysis Results UI shows issues by severity with fixes
- [ ] ATS Report UI shows matched/missing keywords with score breakdown

---

## Risk Areas

1. **Trigram similarity performance**: O(n*m) for large keyword sets. Mitigation: limit JD keywords to top 50, filter exact matches first.
2. **AI agent tool call failures**: `callTool` already has Zod validation + retry (proven in extraction pipeline).
3. **Derived endpoints temporarily down**: `/job-match`, `/career-map`, `/tailor` return 503 until rebuilt in Phase 3. Acceptable for dev stage.
4. **Type explosion**: Namespace v2 types clearly. Old types fully removed, not duplicated.
