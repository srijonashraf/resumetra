# Phase 1: Validation + Extraction — Task Breakdown

## T1: Shared Validation + Pipeline Types ✅

**Acceptance**: Types importable from `@resumetra/shared`. `tsc --noEmit` passes all 3 packages. Tests pass.

**Files**:

- `shared/src/types/validation.ts` (new) — `ValidationOutcome`, `ValidationResult`
- `shared/src/schemas/validation.ts` (new) — Zod schemas
- `shared/src/types/index.ts` (edit) — add exports
- `shared/src/schemas/index.ts` (edit) — add exports
- `shared/src/__tests__/validation.test.ts` (new) — schema tests

**Types to define**:

```typescript
type ValidationOutcome =
  | "VALID"
  | "NOT_A_RESUME"
  | "SCANNED_IMAGE"
  | "TOO_LONG"
  | "INSUFFICIENT_CONTENT"
  | "CORRUPT"
  | "NOT_ENGLISH";

interface ValidationResult {
  outcome: ValidationOutcome;
  message: string;
}
```

**Steps**:

1. Create `shared/src/types/validation.ts` with the types above
2. Create `shared/src/schemas/validation.ts` with matching Zod schemas
3. Update barrel exports in both index files
4. Write tests for valid/invalid outcomes, message validation
5. Verify `tsc --noEmit` passes on all 3 packages

---

## T2: Server-Side PDF Extraction ✅

**Acceptance**: Extracts text from valid PDF buffer. Throws on encrypted/corrupted. Flags scanned (<50 chars/page). Tests pass.

**Files**:

- `server/package.json` (edit) — add `pdfjs-dist`
- `server/src/services/pdfService.ts` (new)
- `server/src/__tests__/pdfService.test.ts` (new)

**Function signature**:

```typescript
interface PdfExtractionResult {
  text: string;
  pageCount: number;
  pageTexts: string[];
}

function extractPdf(buffer: Buffer): Promise<PdfExtractionResult>;
```

**Steps**:

1. `npm install pdfjs-dist` in server/
2. Create `pdfService.ts` with `extractPdf(buffer)`
3. pdfjs Node setup: set `GlobalWorkerOptions.workerSrc` to empty
4. Scanned detection: `pageText.trim().length < 50` per page
5. Handle pdfjs errors → map to `CORRUPT` or `SCANNED_IMAGE`
6. Create test PDF fixture for tests
7. Verify `tsc --noEmit` and `vitest run` pass

---

## T3: Stage 0 Validator ✅

**Acceptance**: Rejects blank, non-resume, >4 pages, non-English. Accepts valid resumes. Tests pass.

**Files**:

- `server/src/stages/stage0_validate.ts` (new)
- `server/src/stages/__tests__/stage0_validate.test.ts` (new)

**Function signature**:

```typescript
function validateResume(text: string, pageCount: number): ValidationResult;
```

**Checks** (all code-only, zero AI):

- Text extractable: `text.trim().length > 0`
- Sufficient content: `text.length >= 100`
- Is resume: has contact info (email OR phone regex) + at least one section keyword (experience, education, skills, summary, projects, work, objective, profile, certifications, awards, volunteer, publications, interests, languages)
- Length: `pageCount <= 4`
- English: stop-word heuristic (3+ of top-20 English words: the, and, with, experience, education, work, skills, university, email, phone, summary, professional, development, management, project, team, years, months, responsibilities, achieved)

**Steps**:

1. Create `server/src/stages/stage0_validate.ts`
2. Implement each check with clear error messages
3. Write tests: valid resume, blank, recipe/non-resume, >4 pages, non-English, insufficient content
4. Verify `tsc --noEmit` and `vitest run` pass

**Depends on**: T1 (uses `ValidationResult` type)

---

## T4: Extraction Agent Tools + Prompts ✅

**Acceptance**: Tool definitions valid OpenAI format. Schemas validate good responses, reject bad ones. Tests pass.

**Files**:

- `server/src/stages/extractTools.ts` (new) — tool defs + Zod schemas
- `server/src/stages/extractPrompts.ts` (new) — system prompt + instructions
- `server/src/stages/__tests__/extractTools.test.ts` (new)

**Tool definitions**:

```typescript
// Tool 1: detect_sections
// Returns: { sections: Array<{ title: string; startIndex: number; endIndex: number; estimatedType: string }> }

// Tool 2: extract_contact
// Returns: ContactInfo (from @resumetra/shared)

// Tool 3: extract_section
// Returns: { sectionId: string; type: SectionType; title: string; displayOrder: number; items: SectionItem[] }
```

**System prompt** must include:

- 5 section shapes with examples (experience, text, list, table, raw)
- Rule: preserve ALL content, never drop sections
- Rule: fallback to `raw` if uncertain
- Rule: generate UUIDs for IDs
- Rule: handle two-column resumes (group by semantic section, not physical proximity)

**Steps**:

1. Create `extractTools.ts` with 3 tool definitions + Zod schemas
2. Create `extractPrompts.ts` with system prompt containing shape definitions and examples
3. Write tests for schema validation (valid/invalid tool responses)
4. Verify `tsc --noEmit` and `vitest run` pass

**Depends on**: T1 (uses shared types)

---

## T5: Profession Detection ✅

**Acceptance**: "Software Engineer" → `software_engineer` with confidence > 0.7. "Marketing Manager" → `generic`. Tests pass.

**Files**:

- `server/src/stages/detectProfession.ts` (new)
- `server/src/stages/__tests__/detectProfession.test.ts` (new)

**Function signature**:

```typescript
interface ProfessionDetectionResult {
  professionId: string;
  confidence: number;
}

function detectProfession(
  sections: DynamicSection[],
): ProfessionDetectionResult;
```

**Algorithm**:

1. Iterate over all registered KBs from `registry.ts`
2. Score job title match (50%): extract headings from experience items, compare against `commonJobTitles`
3. Score alias match (30%): tokenize text, count matches against `aliases`
4. Score section structure match (20%): compare section titles against `requiredSections + recommendedSections`
5. Combined = weighted sum
6. Highest >= 0.7 → use that, else "generic"

**Steps**:

1. Create `detectProfession.ts`
2. Implement scoring algorithm
3. Write tests: SWE resume, generic resume, empty sections, multiple KB competition
4. Verify `tsc --noEmit` and `vitest run` pass

**Depends on**: T1 (uses `DynamicSection` type), uses `getKnowledgeBase` from knowledge registry

---

## T6: Career Level Detection ✅

**Acceptance**: Date parsing works for common formats. Months map to correct career levels. Tests pass.

**Files**:

- `server/src/stages/detectCareerLevel.ts` (new)
- `server/src/stages/__tests__/detectCareerLevel.test.ts` (new)

**Function signature**:

```typescript
interface CareerLevelResult {
  levelId: string;
  label: string;
  totalMonths: number;
}

function detectCareerLevel(
  sections: DynamicSection[],
  professionId: string,
): CareerLevelResult;
```

**Algorithm**:

1. Find experience-type sections
2. For each item, parse `dateRange` field (formats: "Jan 2020 – Present", "2018 - 2021", "MM/YYYY – MM/YYYY", "YYYY – YYYY")
3. Sum months across all positions (treat "Present"/"Current" as now)
4. Look up KB via `getKnowledgeBase(professionId)`
5. Match against `careerLevels` thresholds (parse `experienceRange` strings)
6. Return matching level or closest

**Steps**:

1. Create `detectCareerLevel.ts`
2. Implement date parser handling 5-6 common formats
3. Implement month calculation and level mapping
4. Write tests: various date formats, multiple positions, missing dates, level thresholds
5. Verify `tsc --noEmit` and `vitest run` pass

**Depends on**: T1 (uses types), uses `getKnowledgeBase` from knowledge registry

---

## T7: Extraction Orchestrator ✅

**Acceptance**: Mocked test: 3 sections extracted, second fails → raw fallback, pipeline completes. Tests pass.

**Files**:

- `server/src/stages/stage1_extract.ts` (new)
- `server/src/stages/__tests__/stage1_extract.test.ts` (new, mocked AI)

**Function signature**:

```typescript
type SSESender = (event: string, data: unknown) => void;

function extractResume(
  rawText: string,
  sendSSE: SSESender,
): Promise<ResumeDocument>;
```

**Flow**:

1. Call `detect_sections` tool → section list with boundaries
2. SSE "extracting" for contact → call `extract_contact` tool → ContactInfo
3. For each detected section: SSE "extracting" → call `extract_section` → on failure: raw fallback, continue
4. Generate IDs (`section-0`, `item-0-1`)
5. Set `displayOrder` from detection order
6. Assemble `ResumeDocument` with placeholder profession/level

**Steps**:

1. Create `stage1_extract.ts`
2. Import tools from `extractTools.ts`
3. Implement orchestration with SSE callbacks
4. Mock `callTool` in tests
5. Test: happy path, partial failure, total failure
6. Verify `tsc --noEmit` and `vitest run` pass

**Depends on**: T4 (uses extraction tools)

---

## T8: SSE Route + Pipeline Wiring ✅

**Acceptance**: `POST /extract` returns SSE events in order. PDF upload works. `/analyze` still works. Tests pass.

**Files**:

- `server/src/routes/api.ts` (edit) — add `/extract` route
- `server/src/services/pipelineService.ts` (new) — orchestrator wrapper
- `server/src/middleware/upload.ts` (new) — multer config
- `server/package.json` (edit) — add `multer`

**Pipeline flow** (in `pipelineService.ts`):

1. If PDF → `pdfService.extractPdf(buffer)` → text + pageCount
2. If text → use provided text, estimate pageCount
3. SSE "validating" → `validateResume(text, pageCount)` → if not VALID, SSE "error" + stop
4. SSE "extracting:N" → `extractResume(text, sendSSE)` → ResumeDocument
5. `detectProfession(sections)` → professionId
6. `detectCareerLevel(sections, professionId)` → careerLevel
7. Assemble section coverage data from KB careerLevel
8. SSE "complete" with full result

**multer config**: `memoryStorage()`, 5MB limit, PDF filter, field name "resume"

**Steps**:

1. `npm install multer` + `@types/multer` in server/
2. Create `upload.ts` middleware with multer config
3. Create `pipelineService.ts` orchestrator function
4. Add `/extract` route to `api.ts` (same SSE header pattern as `/analyze`)
5. Wire auth/guest middleware (reuse existing)
6. Manual test with curl or Postman
7. Verify `tsc --noEmit` passes

**Depends on**: T2 (pdfService), T3 (stage0), T5 (profession), T6 (career level), T7 (extraction)

---

## T9: resume_sections Persistence ✅

**Acceptance**: After extraction, DB has matching rows in `resume_sections`. Transaction-wrapped. Tests pass.

**Files**:

- `server/src/db/sections.ts` (new) — `saveSections(analysisId, sections)`
- `server/src/services/pipelineService.ts` (edit) — add persistence

**Steps**:

1. Create `sections.ts` with `saveSections()` — inserts one row per section into `resume_sections`
2. Create minimal `resume_analyses` record first (user_id, source_type, input_text_hash)
3. Transaction: all-or-nothing
4. Add call to `pipelineService.ts` after successful extraction
5. Manual test: upload → check DB
6. Verify `tsc --noEmit` passes

**Depends on**: T8 (needs route + orchestrator)

---

## T10: Client Upload + SSE Consumption ✅

**Acceptance**: Upload PDF → extraction progress shown → complete event with sections. Old flow still accessible. Tests pass.

**Files**:

- `client/src/services/api.ts` (edit) — add `extractResumeStream()`
- `client/src/types/api-responses.ts` (edit) — new SSE payload types
- `client/src/store/useStore.ts` (edit) — extraction state
- `client/src/components/upload/PdfUploader.tsx` (edit) — server upload
- `client/src/pages/Dashboard.tsx` (edit) — wire new flow

**New types in api-responses.ts**:

```typescript
interface SSEExtractionPayload {
  sectionName: string;
  index: number;
  total: number;
}

interface SSEExtractCompletePayload {
  document: ResumeDocument;
  profession: { id: string; confidence: number };
  careerLevel: { levelId: string; label: string };
  sectionCoverage: {
    required: { name: string; present: boolean }[];
    recommended: { name: string; present: boolean }[];
    optional: { name: string; present: boolean }[];
  };
}
```

**Store additions**: `extractionResult`, `extractionPhase`, `detectedProfession`, `detectedCareerLevel`

**Steps**:

1. Add SSE payload types to api-responses.ts
2. Add `extractResumeStream()` to api.ts (same fetch+ReadableStream pattern as analyzeResumeStream)
3. Extend Zustand store with extraction state
4. Update PdfUploader to send raw PDF via FormData
5. Wire Dashboard to new flow
6. Manual test: upload PDF → see events
7. Verify `tsc --noEmit` passes

**Depends on**: T8 (server endpoint)

---

## T11: Section Confirmation UI ✅

**Acceptance**: Shows all detected sections with title, type badge, item count. Confirm/feedback buttons work.

**Files**:

- `client/src/components/upload/SectionConfirmation.tsx` (new)
- `client/src/pages/Dashboard.tsx` (edit) — add confirmation step

**Component spec**:

- Header: "We found N sections in your resume"
- List: section title, type badge (experience/text/list/table/raw), item count
- Actions: "Looks good, continue" button, "Something's missing?" feedback input
- Uses `ResumeDocument` from `@resumetra/shared` for type-safe rendering

**Steps**:

1. Create SectionConfirmation component
2. Add to Dashboard flow after extraction completes
3. Style with existing UI components
4. Manual test with extracted data

**Depends on**: T10

---

## T12: Resume Health Check UI ✅

**Acceptance**: Shows correct section coverage for detected profession/level. Missing required = red, present = green.

**Files**:

- `client/src/components/upload/ResumeHealthCheck.tsx` (new)
- `client/src/pages/Dashboard.tsx` (edit) — add health check after confirmation

**Component spec**:

- Display detected profession name + career level
- Section coverage grid: required (green check / red X), recommended (yellow), optional (gray)
- Data comes from `sectionCoverage` in the SSE "complete" payload (computed server-side from KB)
- "Continue to Analysis" button (placeholder for Phase 2)

**Steps**:

1. Create ResumeHealthCheck component
2. Add to Dashboard flow after confirmation
3. Render coverage data from store
4. Manual test with SWE resume data

**Depends on**: T10
