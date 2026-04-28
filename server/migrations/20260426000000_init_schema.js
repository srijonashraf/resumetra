/**
 * Initial schema migration — all tables from server/src/db/*.sql
 *
 * Dependency order:
 *   functions → users → guest_usage → resume_analyses →
 *   resume_metrics → resume_parsed_data → resume_feedback → token_usage
 *
 * Fully idempotent: safe to run on fresh DB or existing schema.
 */

function dropAndCreateTrigger(pgm, table, triggerName, body) {
  pgm.sql(`DROP TRIGGER IF EXISTS ${triggerName} ON ${table}`);
  pgm.sql(`CREATE TRIGGER ${triggerName} ${body}`);
}

function addConstraintIfNotExists(pgm, table, constraintName, definition) {
  pgm.sql(`
    DO $$ BEGIN
      ALTER TABLE ${table} ADD CONSTRAINT ${constraintName} ${definition};
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$;
  `);
}

export async function up(pgm) {
  // ─── Helper function ───
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // ─── users ───
  pgm.createTable(
    "users",
    {
      id: { type: "uuid", notNull: true, default: pgm.func("gen_random_uuid()"), primaryKey: true },
      google_sub: { type: "text", notNull: true, unique: true },
      email: { type: "text" },
      name: { type: "text" },
      picture: { type: "text" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("timezone('utc'::text, now())") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("timezone('utc'::text, now())") },
    },
    { ifNotExists: true }
  );
  pgm.createIndex("users", "email", { ifNotExists: true });
  dropAndCreateTrigger(pgm, "users", "update_users_updated_at",
    "BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"
  );

  // ─── guest_usage ───
  pgm.createTable(
    "guest_usage",
    {
      id: { type: "varchar(255)", notNull: true, primaryKey: true },
      ip_address: { type: "varchar(45)", notNull: true },
      user_agent: { type: "text" },
      analysis_count: { type: "integer", notNull: true, default: "1" },
      last_analysis_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    },
    { ifNotExists: true }
  );
  addConstraintIfNotExists(pgm, "guest_usage", "check_analysis_count_positive",
    "CHECK (analysis_count >= 0)"
  );
  pgm.createIndex("guest_usage", "ip_address", { ifNotExists: true });
  pgm.createIndex("guest_usage", "last_analysis_at", { ifNotExists: true });
  dropAndCreateTrigger(pgm, "guest_usage", "update_guest_usage_updated_at",
    "BEFORE UPDATE ON guest_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"
  );

  // ─── resume_analyses ───
  pgm.createTable(
    "resume_analyses",
    {
      id: { type: "uuid", notNull: true, default: pgm.func("gen_random_uuid()"), primaryKey: true },
      user_id: { type: "uuid", notNull: true, references: "users(id)", onDelete: "CASCADE" },
      input_text_hash: { type: "varchar(64)", notNull: true },
      original_file_name: { type: "text" },
      source_type: { type: "text", notNull: true },
      ai_model_version: { type: "text" },
      analysis_version: { type: "integer", notNull: true, default: "1" },
      processing_time_ms: { type: "integer" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("timezone('utc'::text, now())") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("timezone('utc'::text, now())") },
    },
    { ifNotExists: true }
  );
  addConstraintIfNotExists(pgm, "resume_analyses", "resume_analyses_user_hash_unique",
    "UNIQUE (user_id, input_text_hash)"
  );
  addConstraintIfNotExists(pgm, "resume_analyses", "resume_analyses_source_type_check",
    "CHECK (source_type = ANY (ARRAY['pdf', 'docx', 'text', 'linkedin']))"
  );
  pgm.createIndex("resume_analyses", "user_id", { ifNotExists: true });
  pgm.createIndex("resume_analyses", "input_text_hash", { ifNotExists: true });
  dropAndCreateTrigger(pgm, "resume_analyses", "update_resume_analyses_updated_at",
    "BEFORE UPDATE ON resume_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"
  );

  // ─── resume_metrics ───
  pgm.createTable(
    "resume_metrics",
    {
      id: { type: "uuid", notNull: true, default: pgm.func("gen_random_uuid()"), primaryKey: true },
      analysis_id: { type: "uuid", notNull: true, unique: true, references: "resume_analyses(id)", onDelete: "CASCADE" },
      overall_score: { type: "numeric", notNull: true },
      ats_compatibility_score: { type: "numeric", notNull: true },
      content_quality_score: { type: "numeric", notNull: true },
      impact_score: { type: "numeric", notNull: true },
      readability_score: { type: "numeric", notNull: true },
      section_completeness_score: { type: "numeric", notNull: true },
      word_count: { type: "integer", notNull: true },
      page_count: { type: "integer", notNull: true },
      bullet_point_count: { type: "integer", notNull: true },
      skills_count: { type: "integer", notNull: true },
      unique_skills_count: { type: "integer", notNull: true },
      experience_entries_count: { type: "integer", notNull: true },
      education_entries_count: { type: "integer", notNull: true },
      has_email: { type: "boolean", notNull: true },
      has_phone: { type: "boolean", notNull: true },
      has_linkedin: { type: "boolean", notNull: true },
      has_portfolio: { type: "boolean", notNull: true },
      grammar_issues_count: { type: "integer", notNull: true },
      spelling_issues_count: { type: "integer", notNull: true },
      passive_voice_count: { type: "integer", notNull: true },
      measurable_achievements_count: { type: "integer" },
      action_verb_count: { type: "integer" },
      buzzword_count: { type: "integer" },
      ats_issues: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("timezone('utc'::text, now())") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("timezone('utc'::text, now())") },
    },
    { ifNotExists: true }
  );
  addConstraintIfNotExists(pgm, "resume_metrics", "check_overall_score",
    "CHECK (overall_score >= 1 AND overall_score <= 10)"
  );
  addConstraintIfNotExists(pgm, "resume_metrics", "check_ats_score",
    "CHECK (ats_compatibility_score >= 1 AND ats_compatibility_score <= 10)"
  );
  addConstraintIfNotExists(pgm, "resume_metrics", "check_content_quality_score",
    "CHECK (content_quality_score >= 1 AND content_quality_score <= 10)"
  );
  addConstraintIfNotExists(pgm, "resume_metrics", "check_impact_score",
    "CHECK (impact_score >= 1 AND impact_score <= 10)"
  );
  addConstraintIfNotExists(pgm, "resume_metrics", "check_readability_score",
    "CHECK (readability_score >= 1 AND readability_score <= 10)"
  );
  addConstraintIfNotExists(pgm, "resume_metrics", "check_section_completeness",
    "CHECK (section_completeness_score >= 0 AND section_completeness_score <= 100)"
  );
  pgm.createIndex("resume_metrics", "analysis_id", { ifNotExists: true });
  pgm.createIndex("resume_metrics", "overall_score", { ifNotExists: true, sortDirection: "DESC" });
  dropAndCreateTrigger(pgm, "resume_metrics", "update_resume_metrics_updated_at",
    "BEFORE UPDATE ON resume_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"
  );

  // ─── resume_parsed_data ───
  pgm.createTable(
    "resume_parsed_data",
    {
      id: { type: "uuid", notNull: true, default: pgm.func("gen_random_uuid()"), primaryKey: true },
      analysis_id: { type: "uuid", notNull: true, unique: true, references: "resume_analyses(id)", onDelete: "CASCADE" },
      full_name: { type: "text" },
      email: { type: "text" },
      phone: { type: "text" },
      location: { type: "text" },
      experience_level: { type: "text" },
      total_experience_years: { type: "numeric" },
      technical_skills: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      soft_skills: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      job_titles: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      education: { type: "jsonb", notNull: true, default: pgm.func("'[]'::jsonb") },
      work_experiences: { type: "jsonb", notNull: true, default: pgm.func("'[]'::jsonb") },
      projects: { type: "jsonb", notNull: true, default: pgm.func("'[]'::jsonb") },
      certifications: { type: "jsonb", notNull: true, default: pgm.func("'[]'::jsonb") },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("timezone('utc'::text, now())") },
      updated_at: { type: "timestamptz", notNull: true, default: pgm.func("timezone('utc'::text, now())") },
    },
    { ifNotExists: true }
  );
  addConstraintIfNotExists(pgm, "resume_parsed_data", "check_experience_level",
    "CHECK (experience_level IS NULL OR experience_level = ANY (ARRAY['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead/Principal', 'Executive']))"
  );
  addConstraintIfNotExists(pgm, "resume_parsed_data", "check_experience_years",
    "CHECK (total_experience_years IS NULL OR total_experience_years >= 0)"
  );
  pgm.createIndex("resume_parsed_data", "analysis_id", { ifNotExists: true });
  pgm.createIndex("resume_parsed_data", "technical_skills", { ifNotExists: true, method: "gin" });
  pgm.createIndex("resume_parsed_data", "experience_level", { ifNotExists: true });
  dropAndCreateTrigger(pgm, "resume_parsed_data", "update_resume_parsed_data_updated_at",
    "BEFORE UPDATE ON resume_parsed_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"
  );

  // ─── resume_feedback ───
  pgm.createTable(
    "resume_feedback",
    {
      id: { type: "uuid", notNull: true, default: pgm.func("gen_random_uuid()"), primaryKey: true },
      analysis_id: { type: "uuid", notNull: true, unique: true, references: "resume_analyses(id)", onDelete: "CASCADE" },
      summary: { type: "text", notNull: true },
      hiring_recommendation: { type: "text", notNull: true },
      strengths: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      weaknesses: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      improvement_areas: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      missing_skills: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      red_flags: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      suggestions_immediate: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      suggestions_short_term: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      suggestions_long_term: { type: "text[]", notNull: true, default: pgm.func("'{}'") },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("timezone('utc'::text, now())") },
    },
    { ifNotExists: true }
  );
  addConstraintIfNotExists(pgm, "resume_feedback", "check_hiring_recommendation",
    "CHECK (hiring_recommendation = ANY (ARRAY['Strong Hire', 'Hire', 'Maybe', 'No Hire', 'Needs More Info']))"
  );
  pgm.createIndex("resume_feedback", "analysis_id", { ifNotExists: true });
  pgm.createIndex("resume_feedback", "missing_skills", { ifNotExists: true, method: "gin" });
  pgm.createIndex("resume_feedback", "hiring_recommendation", { ifNotExists: true });

  // ─── token_usage ───
  pgm.createTable(
    "token_usage",
    {
      id: { type: "uuid", notNull: true, default: pgm.func("gen_random_uuid()"), primaryKey: true },
      analysis_id: { type: "uuid", references: "resume_analyses(id)", onDelete: "CASCADE" },
      user_id: { type: "uuid", references: "users(id)", onDelete: "CASCADE" },
      endpoint: { type: "text", notNull: true },
      phase: { type: "text", notNull: true },
      model: { type: "text", notNull: true },
      input_tokens: { type: "integer", notNull: true, default: "0" },
      output_tokens: { type: "integer", notNull: true, default: "0" },
      total_tokens: { type: "integer", notNull: true, default: "0" },
      created_at: { type: "timestamptz", notNull: true, default: pgm.func("timezone('utc'::text, now())") },
    },
    { ifNotExists: true }
  );
  pgm.createIndex("token_usage", "analysis_id", { ifNotExists: true });
  pgm.createIndex("token_usage", "user_id", { ifNotExists: true });
  pgm.createIndex("token_usage", "created_at", { ifNotExists: true, sortDirection: "DESC" });
}

export async function down(pgm) {
  pgm.dropTable("token_usage", { ifExists: true });
  pgm.dropTable("resume_feedback", { ifExists: true });
  pgm.dropTable("resume_parsed_data", { ifExists: true });
  pgm.dropTable("resume_metrics", { ifExists: true });
  pgm.dropTable("resume_analyses", { ifExists: true });
  pgm.dropTable("guest_usage", { ifExists: true });
  pgm.dropTable("users", { ifExists: true });
  pgm.sql("DROP FUNCTION IF EXISTS update_updated_at_column()");
}
