import OpenAI from "openai";
import { z } from "zod";
import { ExternalServiceError } from "../errors";
import type { AnalysisContext } from "../services/historyService";
import {
  careerMapResultSchema,
  jobComparisonResultSchema,
  tailorResultSchema,
} from "../schemas";

// ==================== CLIENT SETUP ====================

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
const model = process.env.OPENAI_MODEL || "openrouter/free";

if (!apiKey) {
  throw new ExternalServiceError(
    "OPENAI_API_KEY environment variable is required",
  );
}

const client = new OpenAI({
  apiKey,
  baseURL,
});

export const MODEL: string = model;

// ==================== TYPE DEFINITIONS ====================

export interface CareerPathStep {
  role: string;
  status: "current" | "future" | "goal";
  skills_needed?: string[];
  timeframe?: string;
  salary_range?: string;
}

export interface CareerPath {
  name: string;
  description: string;
  difficulty: "Low" | "Medium" | "High";
  timeToGoal: string;
  steps: CareerPathStep[];
}

export interface CareerMapResult {
  paths: CareerPath[];
  currentRole: string;
  currentSkills: string[];
  recommendations: string[];
}

export interface JobComparisonResult {
  matchPercentage: number;
  matchLevel: "Poor" | "Fair" | "Good" | "Excellent";
  missingSkills: {
    critical: string[];
    important: string[];
    nice_to_have: string[];
  };
  presentSkills: {
    exact_matches: string[];
    partial_matches: string[];
    transferable_skills: string[];
  };
  suggestions: {
    priority: "High" | "Medium" | "Low";
    category: string;
    action: string;
  }[];
  keyword_analysis: {
    total_keywords: number;
    matched_keywords: number;
    missing_keywords: string[];
  };
  experience_gap: {
    required_years: number;
    candidate_years: number;
    gap: number;
    assessment: string;
  };
  recommendation: string;
}

export interface TailorSection {
  name: string;
  priority: "High" | "Medium" | "Low";
  before: string;
  after: string;
  changes: string[];
  keywords_added: string[];
}

export interface TailorResult {
  sections: TailorSection[];
  overall_strategy: string;
  keywords_to_add: string[];
  keywords_already_present: string[];
  ats_improvement: {
    before_score: number;
    after_score: number;
  };
}

// ==================== UTILITY FUNCTIONS ====================

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AiResult<T> {
  data: T;
  usage: TokenUsage;
  metadata?: {
    [key: string]: unknown;
  };
}

const cleanJSON = (text: string): string => {
  let cleaned = text.trim();

  // Strip <thought>...</thought> blocks (thinking model output)
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, "");

  // Strip markdown code blocks
  cleaned = cleaned.replace(/```(?:json)?\n?/g, "").replace(/\n?```/g, "");

  // Extract outermost JSON object if surrounded by extra text
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // Remove JS-style comments (not inside strings)
  cleaned = cleaned.replace(/\/\/.*$/gm, "");
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  return cleaned.trim();
};

const generateJson = async <T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  maxTokens = 17000,
  retryCount = 0,
): Promise<AiResult<T>> => {
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
  });

  const finishReason = completion.choices[0]?.finish_reason;
  const text = completion.choices[0]?.message?.content;

  const usage: TokenUsage = {
    inputTokens: completion.usage?.prompt_tokens ?? 0,
    outputTokens: completion.usage?.completion_tokens ?? 0,
    totalTokens: completion.usage?.total_tokens ?? 0,
  };

  if (!text) {
    throw new ExternalServiceError("AI returned empty response", {
      details: { model: MODEL, finishReason },
    });
  }

  if (finishReason === "length") {
    throw new ExternalServiceError(
      "AI response truncated (max_tokens reached)",
      { details: { model: MODEL } },
    );
  }

  const cleaned = cleanJSON(text);

  const parseAndValidate = (): T => {
    const parsed = JSON.parse(cleaned);
    return schema.parse(parsed);
  };

  try {
    const data = parseAndValidate();
    return { data, usage };
  } catch (parseError) {
    if (retryCount < 1) {
      console.warn(
        `JSON parse/validation failed for model ${MODEL}. Retrying (attempt ${retryCount + 1})...`,
      );
      return generateJson(prompt, schema, maxTokens, retryCount + 1);
    }

    console.error(
      `JSON parse/validation failed after retry for model ${MODEL}. Raw response (first 500 chars):`,
      text.slice(0, 500),
    );
    throw new ExternalServiceError(
      "AI response validation failed after retry",
      { details: { model: MODEL, cause: parseError } },
    );
  }
};

// ==================== TOOL CALLING ====================

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export async function callTool<T>(
  messages: OpenAI.ChatCompletionMessageParam[],
  tools: ToolDefinition[],
  targetTool: string,
  schema: z.ZodSchema<T>,
  maxRetries: number = 1,
): Promise<AiResult<T>> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages,
        tools,
        tool_choice: { type: "function", function: { name: targetTool } },
      });

      const message = response.choices[0]?.message;
      if (!message) {
        throw new ExternalServiceError("No response from AI model");
      }

      const toolCalls = message.tool_calls;
      if (!toolCalls || toolCalls.length === 0) {
        throw new ExternalServiceError("No tool calls in AI response");
      }

      const targetCall = toolCalls.find(
        (tc): tc is OpenAI.ChatCompletionMessageFunctionToolCall =>
          tc.type === "function" && tc.function.name === targetTool,
      );
      if (!targetCall) {
        const names = toolCalls
          .filter(
            (tc): tc is OpenAI.ChatCompletionMessageFunctionToolCall =>
              tc.type === "function",
          )
          .map((tc) => tc.function.name)
          .join(", ");
        throw new ExternalServiceError(
          `Expected tool call '${targetTool}' but got: ${names || "none"}`,
        );
      }

      const rawArgs = targetCall.function.arguments;
      const parsed = JSON.parse(rawArgs);
      const validated = schema.parse(parsed);

      return {
        data: validated,
        usage: {
          inputTokens: response.usage?.prompt_tokens ?? 0,
          outputTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (error instanceof z.ZodError) {
        throw new ExternalServiceError(
          `AI tool call '${targetTool}' returned invalid data: ${error.message}`,
        );
      }

      if (error instanceof ExternalServiceError) {
        if (attempt === maxRetries) throw error;
      }

      if (attempt === maxRetries) {
        throw new ExternalServiceError(
          `AI tool call '${targetTool}' failed after ${attempt + 1} attempts: ${lastError.message}`,
        );
      }
    }
  }

  throw new ExternalServiceError(
    `AI tool call '${targetTool}' failed: ${lastError?.message}`,
  );
}

// ==================== DERIVED AI FUNCTIONS ====================

export const generateCareerMap = async (
  context: AnalysisContext,
): Promise<AiResult<CareerMapResult>> => {
  const prompt = `
You are a Senior Career Development Advisor with expertise in technology career progression, industry trends, and talent development across diverse tech roles.

OBJECTIVE:
Generate 3 strategic career paths tailored to the candidate's analyzed profile below.

CANDIDATE PROFILE:
- Current Role: ${context.parsedData.jobTitles.length > 0 ? context.parsedData.jobTitles[0] : "Unknown"}
- Experience Level: ${context.experienceLevel}, ${context.yearsOfExperience} years
- Overall Score: ${context.overallScore}/10
- Technical Skills: ${context.parsedData.technicalSkills.join(", ")}
- Soft Skills: ${context.parsedData.softSkills.join(", ")}

WORK EXPERIENCE:
${JSON.stringify(context.parsedData.workExperiences, null, 2)}

EDUCATION:
${JSON.stringify(context.parsedData.education, null, 2)}

CERTIFICATIONS:
${JSON.stringify(context.parsedData.certifications, null, 2)}

FEEDBACK SUMMARY:
${context.feedback.summary}

STRENGTHS:
${context.feedback.strengths.map((s) => `- ${s}`).join("\n")}

IMPROVEMENT AREAS:
${context.feedback.improvementAreas.map((a) => `- ${a}`).join("\n")}

MISSING SKILLS:
${context.feedback.missingSkills.join(", ")}

ANALYSIS REQUIREMENTS:

1. Career Path Generation:
   Create 3 DISTINCT paths with different trajectories:
   - Path 1: SPECIALIST TRACK (Deep technical expertise)
   - Path 2: LEADERSHIP TRACK (Management and strategy)
   - Path 3: HYBRID/LATERAL TRACK (Emerging tech or cross-functional)

2. For Each Path Include:
   - Realistic progression timeline (2-7 years to goal)
   - 3-5 milestone roles from current to goal position
   - Specific skills/certifications needed at each step
   - Difficulty assessment (Low/Medium/High)
   - Market demand and salary trajectory insights

Return ONLY valid JSON with this EXACT structure:
{
  "paths": [
    {
      "name": "Path Title (e.g., 'Principal Engineer Track')",
      "description": "2-3 sentence overview of this career trajectory",
      "difficulty": "Low" | "Medium" | "High",
      "timeToGoal": "e.g., '4-6 years'",
      "steps": [
        {
          "role": "Current Role Title",
          "status": "current",
          "timeframe": "Present"
        },
        {
          "role": "Next Step Role Title",
          "status": "future",
          "skills_needed": ["Skill 1", "Skill 2", "Skill 3"],
          "timeframe": "1-2 years",
          "salary_range": "e.g., '$120K-$160K'"
        },
        {
          "role": "Goal Role Title",
          "status": "goal",
          "skills_needed": ["Advanced Skill 1", "Advanced Skill 2"],
          "timeframe": "4-6 years",
          "salary_range": "e.g., '$180K-$250K'"
        }
      ]
    }
  ],
  "currentRole": "Identified current role",
  "currentSkills": ["Key Skill 1", "Key Skill 2", "Key Skill 3"],
  "recommendations": [
    "Strategic recommendation 1",
    "Strategic recommendation 2",
    "Strategic recommendation 3"
  ]
}

GUIDELINES:
- Base paths on realistic market opportunities and current trends
- Consider the candidate's existing strengths and natural progressions
- Ensure skills_needed are specific and actionable (certifications, technologies, competencies)
- Provide diverse options (technical depth vs. management vs. emerging fields)
- Include salary ranges based on current market data (US averages)
- Make timeframes realistic based on typical career progression

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO additional text.
  `;

  return generateJson(prompt, careerMapResultSchema);
};

export const compareWithJobDescription = async (
  context: AnalysisContext,
  jobDescription: string,
): Promise<AiResult<JobComparisonResult>> => {
  const currentDate = new Date().toISOString().split("T")[0];

  const prompt = `
IMPORTANT CONTEXT: Today's date is ${currentDate}. Use this date when calculating candidate's experience duration for positions marked as "Present", "Current", or "Ongoing".

You are a Senior Technical Recruiter and ATS Specialist with expertise in candidate-job matching, skill gap analysis, and resume optimization for technical roles.

OBJECTIVE:
Conduct a comprehensive comparison between the candidate's analyzed profile and the target job description to determine fit, identify gaps, and provide strategic optimization recommendations.

CANDIDATE PROFILE:
- Experience Level: ${context.experienceLevel}, ${context.yearsOfExperience} years
- Overall Score: ${context.overallScore}/10
- Scores: ATS ${context.scores.atsCompatibility}/10, Content ${context.scores.contentQuality}/10, Impact ${context.scores.impact}/10, Readability ${context.scores.readability}/10
- Technical Skills: ${context.parsedData.technicalSkills.join(", ")}
- Soft Skills: ${context.parsedData.softSkills.join(", ")}
- Job Titles: ${context.parsedData.jobTitles.join(", ")}

WORK EXPERIENCE:
${JSON.stringify(context.parsedData.workExperiences, null, 2)}

EDUCATION:
${JSON.stringify(context.parsedData.education, null, 2)}

PROJECTS:
${JSON.stringify(context.parsedData.projects, null, 2)}

CERTIFICATIONS:
${JSON.stringify(context.parsedData.certifications, null, 2)}

KNOWN MISSING SKILLS (from resume analysis):
${context.feedback.missingSkills.join(", ")}

ANALYSIS FRAMEWORK:

1. MATCH PERCENTAGE CALCULATION (0-100):
   Based on weighted factors:
   - Technical Skills Match (35%): Required vs. present technologies, tools, frameworks
   - Experience Level Match (25%): Years and seniority alignment
   - Domain/Industry Match (15%): Relevant sector experience
   - Education/Certifications (10%): Degree and credentials alignment
   - Soft Skills/Culture Fit (10%): Leadership, communication, collaboration evidence
   - Keywords Density (5%): Job description terminology coverage

2. SKILLS CATEGORIZATION:
   Identify and classify missing skills by priority:
   - CRITICAL: Must-have requirements explicitly stated (dealbreakers)
   - IMPORTANT: Strongly preferred qualifications that boost candidacy
   - NICE-TO-HAVE: Additional skills that provide competitive edge

3. PRESENT SKILLS ANALYSIS:
   Categorize candidate's existing relevant skills:
   - EXACT MATCHES: Skills directly matching job requirements
   - PARTIAL MATCHES: Related/adjacent skills that partially satisfy requirements
   - TRANSFERABLE SKILLS: Experience applicable to job needs in different context

4. KEYWORD ANALYSIS:
   - Extract key technical and domain-specific terms from job description
   - Calculate keyword coverage percentage
   - Identify high-value missing keywords for ATS optimization

5. EXPERIENCE GAP ASSESSMENT:
   - Compare required years vs. candidate's experience
   - Assess if gap is bridgeable through skills/achievements
   - Provide contextual evaluation

6. STRATEGIC RECOMMENDATIONS:
   Generate prioritized, actionable suggestions:
   - HIGH PRIORITY: Critical changes that significantly improve match
   - MEDIUM PRIORITY: Important optimizations for competitive edge
   - LOW PRIORITY: Nice-to-have improvements

Return ONLY valid JSON with this EXACT structure:
{
  "matchPercentage": number (0-100),
  "matchLevel": "Poor" | "Fair" | "Good" | "Excellent",
  "missingSkills": {
    "critical": ["Critical Missing Skill 1", "Critical Missing Skill 2"],
    "important": ["Important Missing Skill 1", "Important Missing Skill 2"],
    "nice_to_have": ["Nice-to-have Skill 1", "Nice-to-have Skill 2"]
  },
  "presentSkills": {
    "exact_matches": ["Exact Skill 1", "Exact Skill 2"],
    "partial_matches": ["Partial Skill 1 (description of relevance)", "Partial Skill 2"],
    "transferable_skills": ["Transferable Skill 1", "Transferable Skill 2"]
  },
  "suggestions": [
    {
      "priority": "High",
      "category": "Technical Skills",
      "action": "Specific actionable recommendation"
    },
    {
      "priority": "Medium",
      "category": "Experience Framing",
      "action": "Specific actionable recommendation"
    }
  ],
  "keyword_analysis": {
    "total_keywords": number,
    "matched_keywords": number,
    "missing_keywords": ["keyword1", "keyword2", "keyword3"]
  },
  "experience_gap": {
    "required_years": number,
    "candidate_years": number,
    "gap": number (positive if candidate has more, negative if less),
    "assessment": "Brief assessment of whether gap is concerning or acceptable"
  },
  "recommendation": "Overall strategic recommendation: Should candidate apply? What's the likelihood of success? What should they prioritize? (3-4 sentences)"
}

EVALUATION GUIDELINES:
- Match percentage ranges: 0-40% (Poor), 41-65% (Fair), 66-85% (Good), 86-100% (Excellent)
- Be realistic but encouraging - identify paths to improve fit
- Prioritize suggestions by impact on application success
- Consider both ATS optimization and human reviewer appeal
- Recognize transferable skills and non-traditional backgrounds
- Provide specific, actionable recommendations with clear implementation steps

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO additional text.

<user_input type="job_description">
${jobDescription}
</user_input>
  `;

  return generateJson(prompt, jobComparisonResultSchema);
};

export const tailorResume = async (
  context: AnalysisContext,
  resumeText: string,
  jobDescription: string,
): Promise<AiResult<TailorResult>> => {
  const currentDate = new Date().toISOString().split("T")[0];

  const prompt = `
You are an expert Resume Tailoring Specialist with deep knowledge of ATS systems, hiring practices, and career coaching. Your task is to analyze a resume and provide specific, section-by-section rewrites to optimize it for a target job description.

OBJECTIVE:
Analyze the resume and job description, then provide SPECIFIC tailored rewrites for each major resume section. Show exactly what to change, with before and after comparisons.

CANDIDATE CONTEXT (from prior analysis):
- Experience Level: ${context.experienceLevel}, ${context.yearsOfExperience} years
- Overall Score: ${context.overallScore}/10
- ATS Score: ${context.atsCompatibility.score}/100
- Technical Skills: ${context.parsedData.technicalSkills.join(", ")}
- Soft Skills: ${context.parsedData.softSkills.join(", ")}
- Known Missing Skills: ${context.feedback.missingSkills.join(", ")}
- Improvement Areas: ${context.feedback.improvementAreas.join(", ")}

ANALYSIS REQUIREMENTS:

1. IDENTIFY KEY SECTIONS TO TAILOR:
   - Summary/Objective (if present)
   - Work Experience (each relevant position)
   - Skills Section
   - Projects (if relevant to the job)
   - Any other sections that could be optimized

2. FOR EACH SECTION, PROVIDE:
   - The original text (before)
   - The tailored version (after)
   - Specific changes made
   - Keywords from JD that were incorporated

3. TAILORING STRATEGIES:
   - Incorporate exact keywords from the job description
   - Use action verbs that match the job requirements
   - Quantify achievements where possible
   - Align terminology with the target company/role
   - Remove or de-emphasize irrelevant experience
   - Highlight transferable skills

4. PRIORITIZE SECTIONS:
   - High: Direct impact on ATS matching and hiring decision
   - Medium: Supports candidacy but not critical
   - Low: Minor improvements for polish

Return a JSON object with this EXACT structure:
{
  "sections": [
    {
      "name": "Section name (e.g., 'Professional Summary', 'Software Engineer at Company X', 'Technical Skills')",
      "priority": "High" | "Medium" | "Low",
      "before": "The original text from the resume (copy exactly)",
      "after": "The tailored version with improvements",
      "changes": ["List of specific changes made", "Each change as a separate item"],
      "keywords_added": ["keyword1", "keyword2"]
    }
  ],
  "overall_strategy": "2-3 sentence summary of the tailoring approach and key focus areas",
  "keywords_to_add": ["Important keywords from JD not yet in resume"],
  "keywords_already_present": ["Keywords from JD already in resume"],
  "ats_improvement": {
    "before_score": number (estimated ATS match score before tailoring, 0-100),
    "after_score": number (estimated ATS match score after tailoring, 0-100)
  }
}

IMPORTANT GUIDELINES:
- Keep the tailored text authentic - don't add fabricated experience
- Maintain the candidate's voice while improving impact
- Focus on the most impactful changes first
- Ensure tailored versions are concise and ATS-friendly
- Use the job description's exact terminology where appropriate
- Today's date is ${currentDate} for any date-related calculations

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO additional text.

<user_input type="resume">
${resumeText}
</user_input>

<user_input type="job_description">
${jobDescription}
</user_input>
  `;

  return generateJson(prompt, tailorResultSchema);
};
