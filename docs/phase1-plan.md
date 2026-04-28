# Phase 1 Execution Plan: Validation + Extraction

## Context

Phase 0 built the foundation: shared types, Zod schemas, knowledge bases, DB tables, `callTool<T>()`. Phase 1 implements the first two stages of the 5-stage pipeline: **document validation** (code-only) and **intelligent extraction** (AI agent with tool calling).

**Current flow**: Client extracts PDF text → sends raw text → single AI call scores everything
**New flow**: Client uploads PDF → server extracts text → validates → AI agent extracts sections → detects profession/level → SSE streams progress

**Key constraint**: Existing `/analyze` route stays working. New `/extract` route added alongside it. Migration of `/analyze` happens after all 5 stages (Phase 1-3) are validated.

---

## Dependency Graph

```
Group A (parallel):
  T1: Shared validation types ──┐
  T2: Server PDF extraction     │
                                │
Group B (after T1, parallel):   │
  T3: Stage 0 validator ────────┤
  T4: Extraction agent tools ───┤
  T5: Profession detection ─────┤
  T6: Career level detection ───┤
                                │
Group C (sequential):           │
  T7: Extraction orchestrator ←─┤ (needs T4)
  T8: SSE route + wiring ←──────┘ (needs T2,T3,T5,T6,T7)
  T9: resume_sections persistence (needs T8)

Group D (client, after T8):
  T10: Client upload + SSE
  T11: Section confirmation UI (needs T10)
  T12: Health check UI (needs T10)
```

---

## Execution Order

| # | Task | Parallel with | Depends on |
|---|------|--------------|------------|
| 1 | T1: Shared validation types | T2 | — |
| 2 | T2: Server PDF extraction | T1 | — |
| 3 | T3: Stage 0 validator | T4,T5,T6 | T1 |
| 4 | T4: Extraction agent tools | T3,T5,T6 | T1 |
| 5 | T5: Profession detection | T3,T4,T6 | T1 |
| 6 | T6: Career level detection | T3,T4,T5 | T1 |
| 7 | T7: Extraction orchestrator | — | T4 |
| 8 | T8: SSE route + wiring | T9 | T2,T3,T5,T6,T7 |
| 9 | T9: Persistence | — | T8 |
| 10 | T10: Client upload + SSE | T11,T12 | T8 |
| 11 | T11: Section confirmation UI | T12 | T10 |
| 12 | T12: Health check UI | — | T10 |

**Critical path**: T1 → T4 → T7 → T8 → T10

---

## Verification Gate

End-to-end test after T12:
1. Upload a PDF with 10 sections (including volunteer, languages, awards) → all 10 extracted
2. Upload a scanned PDF → helpful error message, no crash
3. Upload a 2-column resume → sections correctly grouped
4. Section confirmation UI works
5. Health check shows correct coverage for detected profession/level
6. Existing `/analyze` route still works unchanged