import pool from "../config/database.js";
import { createHash } from "crypto";
import type { DynamicSection } from "@resumetra/shared";

interface SaveSectionsInput {
  userId: string | null;
  sourceType: "pdf" | "text";
  originalFileName?: string;
  inputText: string;
  sections: DynamicSection[];
  aiModelVersion: string;
}

export async function saveSections(
  input: SaveSectionsInput,
): Promise<string> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const inputTextHash = createHash("sha256")
      .update(input.inputText)
      .digest("hex");

    // Create or update resume_analyses record
    const analysisResult = await client.query(
      `INSERT INTO public.resume_analyses (user_id, input_text_hash, original_file_name, source_type, ai_model_version, analysis_version, processing_time_ms)
       VALUES ($1, $2, $3, $4, $5, 1, 0)
       ON CONFLICT (user_id, input_text_hash) DO UPDATE SET
         ai_model_version = EXCLUDED.ai_model_version,
         updated_at = now()
       RETURNING id`,
      [
        input.userId,
        inputTextHash,
        input.originalFileName ?? null,
        input.sourceType,
        input.aiModelVersion,
      ],
    );

    const analysisId = analysisResult.rows[0].id;

    // Delete existing sections for this analysis (upsert pattern)
    await client.query(
      "DELETE FROM public.resume_sections WHERE analysis_id = $1",
      [analysisId],
    );

    // Insert sections
    for (const section of input.sections) {
      const { id: _id, displayOrder, title, type, items } = section;
      await client.query(
        `INSERT INTO public.resume_sections (analysis_id, section_type, section_title, display_order, section_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [analysisId, type, title, displayOrder, JSON.stringify(items)],
      );
    }

    await client.query("COMMIT");
    return analysisId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
