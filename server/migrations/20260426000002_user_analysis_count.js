/**
 * Add analysis_count column to users table.
 * Tracks total analysis attempts — every /analyze call costs 1 quota,
 * regardless of file redundancy. History still deduplicates via upsert.
 */

export async function up(pgm) {
  pgm.addColumn("users", {
    analysis_count: {
      type: "integer",
      notNull: true,
      default: 0,
    },
  });

  // Backfill existing users with their current analysis count
  pgm.sql(`
    UPDATE users u
    SET analysis_count = COALESCE(sub.cnt, 0)
    FROM (
      SELECT user_id, COUNT(*) AS cnt
      FROM resume_analyses
      GROUP BY user_id
    ) sub
    WHERE u.id = sub.user_id
  `);
}

export async function down(pgm) {
  pgm.dropColumn("users", "analysis_count");
}
