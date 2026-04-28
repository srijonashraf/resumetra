# Phase 0: Pre-Build — Implementation Plan

## Overview

Lay the foundation for the new pipeline. No user-facing changes. All types, schemas, migrations, and configurations built so Phases 1-6 can execute without foundational rework.

## Execution Order

Tasks grouped by dependency. Groups can run in parallel within a group. Groups run sequentially.

```
Group 1 (Foundation):
  T1: npm workspaces + shared package scaffold
  T2: Vitest setup (server + client)

Group 2 (depends on T1):
  T3: Core types + Zod schemas in shared/
  T4: TemplateConfig type + schema

Group 3 (depends on T3):
  T5: ProfessionKnowledgeBase interface
  T6: SWE knowledge base config
  T7: Generic knowledge base config
  T8: Knowledge base registry

Group 4 (depends on T3):
  T9: New DB migration (4 new tables)

Group 5 (depends on T4):
  T10: AI service GPT-4o + tool calling setup

Group 6 (depends on all):
  T11: Final verification — tsc --noEmit across all packages
```

## Verification Gate

Phase 0 is complete when:
- `tsc --noEmit` passes on shared/, server/, client/
- `npm run test` passes on server/ and client/ (even if empty test suites)
- `npm run migrate:up` runs without error against a real DB
- All new types are importable from `@resumetra/shared` in both server and client
- SWE and generic knowledge bases load and validate against their interface
