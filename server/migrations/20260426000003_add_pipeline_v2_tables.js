/**
 * Pipeline v2 tables — resume sections, tailor rewrites, ATS keywords, section scores
 *
 * Dependency order (on existing tables):
 *   resume_sections (→ resume_analyses)
 *   → resume_tailor_rewrites (→ resume_sections)
 *   → resume_ats_keywords (→ resume_analyses)
 *   → resume_section_scores (→ resume_sections)
 *
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // ─── resume_sections ───
  pgm.createTable("resume_sections", {
    id: { type: "uuid", notNull: true, default: pgm.func("gen_random_uuid()"), primaryKey: true },
    analysis_id: {
      type: "uuid",
      notNull: true,
      references: "resume_analyses(id)",
      onDelete: "CASCADE",
    },
    section_type: { type: "text", notNull: true },
    section_title: { type: "text", notNull: true },
    display_order: { type: "integer", notNull: true },
    section_data: { type: "jsonb", notNull: true },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc'::text, now())"),
    },
  });

  pgm.createIndex("resume_sections", "analysis_id");

  // ─── resume_tailor_rewrites ───
  pgm.createTable("resume_tailor_rewrites", {
    id: { type: "uuid", notNull: true, default: pgm.func("gen_random_uuid()"), primaryKey: true },
    analysis_id: {
      type: "uuid",
      notNull: true,
      references: "resume_analyses(id)",
      onDelete: "CASCADE",
    },
    section_id: {
      type: "uuid",
      notNull: true,
      references: "resume_sections(id)",
      onDelete: "CASCADE",
    },
    item_id: { type: "text", notNull: true },
    field: { type: "text", notNull: true },
    before_text: { type: "text" },
    after_text: { type: "text" },
    rationale: { type: "text" },
    keywords_added: { type: "text[]" },
    gap_classification: { type: "text" },
    accepted: { type: "boolean" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc'::text, now())"),
    },
  });

  pgm.createIndex("resume_tailor_rewrites", "analysis_id");
  pgm.createIndex("resume_tailor_rewrites", "section_id");

  // ─── resume_ats_keywords ───
  pgm.createTable("resume_ats_keywords", {
    id: { type: "uuid", notNull: true, default: pgm.func("gen_random_uuid()"), primaryKey: true },
    analysis_id: {
      type: "uuid",
      notNull: true,
      references: "resume_analyses(id)",
      onDelete: "CASCADE",
      unique: true,
    },
    resume_keywords: { type: "text[]" },
    jd_keywords: { type: "text[]" },
    matched_keywords: { type: "text[]" },
    missing_keywords: { type: "text[]" },
    match_score: { type: "numeric" },
    keyword_report: { type: "jsonb" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc'::text, now())"),
    },
  });

  // ─── resume_section_scores ───
  pgm.createTable("resume_section_scores", {
    id: { type: "uuid", notNull: true, default: pgm.func("gen_random_uuid()"), primaryKey: true },
    section_id: {
      type: "uuid",
      notNull: true,
      references: "resume_sections(id)",
      onDelete: "CASCADE",
    },
    content_score: { type: "numeric" },
    impact_score: { type: "numeric" },
    issues: { type: "jsonb" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc'::text, now())"),
    },
  });

  pgm.createIndex("resume_section_scores", "section_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("resume_section_scores");
  pgm.dropTable("resume_tailor_rewrites");
  pgm.dropTable("resume_ats_keywords");
  pgm.dropTable("resume_sections");
};
