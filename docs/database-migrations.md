# Database Migrations

## Overview

Resumetra uses [node-pg-migrate](https://github.com/salsita/node-pg-migrate) for PostgreSQL schema migrations. All migrations live in `server/migrations/`.

## Setup

- **Config:** `server/.node-pg-migrate.json`
- **Tracking table:** `pgmigrations` in the `public` schema
- **Connection:** Reads `DATABASE_URL` from environment or `.env` file
- **Dependency:** `node-pg-migrate` (devDependency), `pg` (dependency)

## Commands

All commands run from `server/` directory:

```bash
# Run all pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Create a new migration file
npm run migrate:create <migration_name>

# Run with explicit DATABASE_URL (no .env file needed)
DATABASE_URL=postgres://... npm run migrate:up
```

## Current Schema

Single initial migration `20260426000000_init_schema.js` creates all 7 tables in dependency order:

```
update_updated_at_column() → users → guest_usage → resume_analyses
  → resume_metrics → resume_parsed_data → resume_feedback → token_usage
```

### Table Summary

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `users` | Google OAuth users | PK: `id` (uuid), Unique: `google_sub` |
| `guest_usage` | Guest free-tier tracking | PK: `id` (varchar), tracks analysis count |
| `resume_analyses` | Analysis metadata | FK → `users`, unique on `(user_id, input_text_hash)` |
| `resume_metrics` | Numeric scores | FK → `resume_analyses` (1:1) |
| `resume_parsed_data` | Extracted resume data | FK → `resume_analyses` (1:1) |
| `resume_feedback` | AI-generated feedback | FK → `resume_analyses` (1:1) |
| `token_usage` | AI token consumption | FK → `resume_analyses`, `users` |

### Helper Function

`update_updated_at_column()` — trigger function that sets `updated_at = NOW()` on any row update. Used by `users`, `guest_usage`, `resume_analyses`, `resume_metrics`, `resume_parsed_data`.

## Production Database

- **Host:** Railway (PostgreSQL)
- **Connection string:** Stored in Railway environment variable `DATABASE_URL`
- **Migration tracking:** `pgmigrations` table records applied migrations with timestamps

## Writing New Migrations

```bash
cd server
npm run migrate:create add_new_column
```

This generates `migrations/<timestamp>_add_new_column.js`:

```js
export async function up(pgm) {
  // Apply changes
}

export async function down(pgm) {
  // Reverse changes
}
```

### Idempotency Helpers

The initial migration defines two reusable patterns:

```js
// Triggers: drop then create
function dropAndCreateTrigger(pgm, table, triggerName, body) {
  pgm.sql(`DROP TRIGGER IF EXISTS ${triggerName} ON ${table}`);
  pgm.sql(`CREATE TRIGGER ${triggerName} ${body}`);
}

// Constraints: add with duplicate guard
function addConstraintIfNotExists(pgm, table, constraintName, definition) {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE ${table} ADD CONSTRAINT ${constraintName} ${definition};
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);
}
```

Copy these into future migrations as needed.

## Key Conventions

- **Snake_case** for all DB columns, **camelCase** in TypeScript. Transform at API boundary (`client/src/services/api.ts`).
- **`pg` driver returns NUMERIC as strings** — Zod schemas use `z.coerce.number()` for DB row validation.
- **Cascading deletes** — deleting a user cascades through all analysis tables.
- **Upsert-on-conflict** — same user + input hash updates in place (`resume_analyses_user_hash_unique`).
