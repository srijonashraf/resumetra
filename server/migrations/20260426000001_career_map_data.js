/**
 * Add career_map_data column to resume_analyses for caching generated career maps.
 * Once populated, the /career-map endpoint returns cached data instead of calling AI again.
 */

export async function up(pgm) {
  pgm.addColumn("resume_analyses", {
    career_map_data: { type: "jsonb", default: null },
  }, { ifNotExists: true });
}

export async function down(pgm) {
  pgm.dropColumn("resume_analyses", "career_map_data", { ifExists: true });
}
