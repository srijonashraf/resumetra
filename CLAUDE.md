# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Resumetra — AI-powered resume analysis tool. Upload a resume (PDF or text), get scored on ATS compatibility, content quality, impact, and readability. Compare against job descriptions, generate career maps, and tailor resumes. Google OAuth auth with guest free-tier.

Two-package monorepo: `client/` (React SPA) and `server/` (Express API). No monorepo tooling — each has its own package.json and runs independently.

## Commands

### Server (`server/`)
- `npm run dev` — dev server with hot reload (tsx watch + .env)
- `npm run build` — production build via tsup
- `npm run start` — run compiled build
- `npx tsc --noEmit` — type check only

### Client (`client/`)
- `npm run dev` — Vite dev server (localhost:5173)
- `npm run build` — tsc type-check + Vite production build
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type check only

No tests exist yet. No Docker/CI config.

## Architecture

### Data Flow — Resume Analysis (SSE Streaming)

```
Client uploads PDF → pdfjs-dist extracts text client-side
  → POST /api/v1/analyze (native fetch, not axios — SSE needs ReadableStream)
  → Server Phase 1: parseAndScore() → SSE "scoring" event
  → Server Phase 2: generateFeedback(coreData) → SSE "feedback" event
  → Server merges both → SSE "complete" event
  → Client updates Zustand store incrementally as events arrive
  → If authenticated, server persists to 4 normalized DB tables (transaction)
```

The SSE client uses `fetch()` + `ReadableStream` reader because `EventSource` doesn't support POST.

### Two-Phase AI Pipeline

`aiService.ts` has a generic `generateJson<T>(prompt, zodSchema, maxTokens?)` that calls an OpenAI-compatible API, cleans the response, validates against a Zod schema, and retries once on parse failure. All AI functions return `AiResult<T>` with `data` and `usage` fields.

`parseAndScore` and `generateFeedback` are the two phases. Phase 1 validates the document is a resume (returns `ResumeAnalysisError` or `CoreAnalysisData`). Phase 2 takes only the structured data from Phase 1 (no raw resume re-sent). A type guard `isResumeAnalysisError()` narrows the union.

### Client Type Boundaries

- `client/src/types/api-responses.ts` — Backend response DTOs (SSE payloads in camelCase, history/analytics in snake_case)
- `client/src/store/useStore.ts` — Frontend store types (`AnalysisResult`, `JobMatchResult`, etc.)
- `client/src/services/api.ts` — `transformCompositeToEntry()` converts snake_case DB composites to camelCase store types. SSE callbacks are typed at the JSON parse boundary.
- `client/src/services/errors.ts` — `ApiError` class for typed error handling

### Server Error Hierarchy

`errors.ts` defines `AppError` base class with 6 subclasses: `ValidationError` (400), `AuthenticationError` (401), `NotFoundError` (404), `RateLimitError` (429), `DatabaseError` (500), `ExternalServiceError` (502). All route handlers use `asyncHandler()` wrapper. `errorHandler` middleware catches `AppError` subclasses and returns structured JSON.

### API Response Envelope

All responses: `{ data: T }` or `{ data: T, metadata: { pagination: {...} } }`. Errors: `{ error: string, details?: ... }`.

### Database

PostgreSQL via raw `pg` with parameterized queries. No ORM. 7 tables defined in `server/src/db/*.sql`. Analysis data is normalized across `resume_analyses`, `resume_metrics`, `resume_parsed_data`, `resume_feedback` (1:1 relationships, cascading deletes). Upsert-on-conflict pattern: same user + input hash updates in place.

`historyService.ts` uses `COMPOSITE_SELECT`/`COMPOSITE_JOINS` template for the 4-table join. `compositeRowSchema` in `schemas.ts` validates the flat joined row at runtime via Zod.

### Zustand Store

Single store in `client/src/store/useStore.ts`. Analysis flow state: `analysisPhase` transitions through "idle" → "scoring" → "feedback" → "complete". Guest mode tracked with `isGuest`/`guestMessage`.

### ATS Dual Score Scale

- `scores.atsCompatibility` — 0-10 scale, used by radar chart
- `atsCompatibility.score` — 0-100 scale, used by progress bar
- History transform: `(ats_compatibility_score / 100) * 10` to convert DB value to radar scale

## Key Conventions

- **Server/DB**: snake_case columns, camelCase TypeScript. **Client**: camelCase throughout. Transform at the API boundary in `api.ts`.
- **File naming**: camelCase `.ts`, PascalCase `.tsx`.
- **Auth**: Google OAuth → JWT stored in `localStorage` (`resumetra_token`). Axios interceptor attaches Bearer token. `requireAuth`/`optionalAuth` middleware on server.
- **Middleware order**: CORS → rate limit → body parse → request ID → route-specific auth/validation → asyncHandler → errorHandler.
- **`pg` driver returns NUMERIC as strings** — Zod schemas use `z.coerce.number()` for DB row validation.

## Environment Variables

Server requires (fail-fast via `requireEnv()`): `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GOOGLE_CLIENT_ID`, `OPENAI_API_KEY`.

Client requires: `VITE_API_URL` (API base URL), `VITE_GOOGLE_CLIENT_ID`.

AI model config: `OPENAI_BASE_URL` (custom endpoint), `OPENAI_MODEL` (defaults to `openrouter/free`).
