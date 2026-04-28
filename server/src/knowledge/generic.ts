import { professionKnowledgeBaseSchema } from "./types.js";
import type { ProfessionKnowledgeBase } from "./types.js";

export const genericKB: ProfessionKnowledgeBase = {
  professionId: "generic",
  displayName: "General Professional",
  aliases: [],

  careerLevels: [
    {
      id: "all_levels",
      label: "All Career Levels",
      experienceRange: "Any experience",
      detectionHints: [],
      requiredSections: ["contact"],
      recommendedSections: ["experience", "skills", "education"],
      optionalSections: [
        "summary",
        "projects",
        "certifications",
        "linkedin",
      ],
      irrelevantSections: [],
      resumeLength: { target: 1, maximum: 2 },
      sectionWeights: {
        experience: 0.35,
        skills: 0.2,
        education: 0.2,
        summary: 0.15,
        projects: 0.1,
      },
    },
  ],

  sectionStandards: {
    experience: {
      bulletFormula: "Action Verb + What You Did + Result",
      bulletCountRange: [3, 5],
      requiredElements: ["company", "title", "dates"],
      forbiddenPatterns: ["responsible for", "worked on"],
      qualityIndicators: ["has_action_verb", "has_metric"],
    },
    summary: {
      bulletFormula: "Role + Key qualifications + Value proposition",
      bulletCountRange: [2, 4],
      requiredElements: ["role"],
      forbiddenPatterns: ["passionate about", "team player", "hardworking"],
      qualityIndicators: ["concise", "has_specifics"],
    },
    skills: {
      bulletFormula: "Category: Skill1, Skill2, Skill3",
      bulletCountRange: [3, 6],
      requiredElements: ["skills_list"],
      forbiddenPatterns: [],
      qualityIndicators: ["has_categories", "organized"],
    },
    education: {
      bulletFormula: "Degree + Institution + Year",
      bulletCountRange: [1, 3],
      requiredElements: ["degree", "institution"],
      forbiddenPatterns: [],
      qualityIndicators: ["complete_info"],
    },
  },

  atsRules: [
    {
      id: "ats001",
      description: "No tables for layout",
      severity: "high",
      check: "ATS cannot parse table layouts reliably.",
      userMessage: "ATS cannot parse table layouts reliably.",
    },
    {
      id: "ats002",
      description: "No multi-column layouts",
      severity: "high",
      check: "Multi-column layouts break ATS text extraction.",
      userMessage: "Multi-column layouts break ATS text extraction.",
    },
    {
      id: "ats003",
      description: "No important content in headers/footers",
      severity: "high",
      check: "ATS ignores headers and footers.",
      userMessage: "ATS ignores headers and footers.",
    },
    {
      id: "ats004",
      description: "Use standard section titles",
      severity: "medium",
      check: "ATS pattern-matches on standard section names.",
      userMessage: "ATS pattern-matches on standard section names.",
    },
    {
      id: "ats005",
      description: "Use standard fonts",
      severity: "low",
      check: "Standard system fonts are parsed reliably by ATS.",
      userMessage: "Standard system fonts are parsed reliably by ATS.",
    },
    {
      id: "ats006",
      description: "Use standard bullet characters",
      severity: "medium",
      check: "Decorative bullets may not parse correctly.",
      userMessage: "Decorative bullets may not parse correctly.",
    },
    {
      id: "ats007",
      description: "Dates must be parseable",
      severity: "medium",
      check: "Use 'Jan 2022 – Present' format.",
      userMessage: "Use 'Jan 2022 – Present' format.",
    },
  ],

  actionVerbs: {
    strong: [
      "Led",
      "Managed",
      "Developed",
      "Created",
      "Implemented",
      "Improved",
      "Achieved",
      "Delivered",
      "Built",
      "Launched",
      "Increased",
      "Reduced",
      "Streamlined",
      "Coordinated",
      "Established",
      "Designed",
      "Produced",
      "Organized",
      "Generated",
      "Resolved",
    ],
    weak: [
      "Worked on",
      "Helped",
      "Assisted with",
      "Was responsible for",
      "Contributed to",
      "Participated in",
      "Handled",
    ],
  },

  metricPatterns: [
    "\\d+%",
    "\\d+x",
    "(?:reduced|improved|increased|decreased).*\\d+",
    "\\$\\d+[KMB]?",
  ],

  redFlags: [
    {
      id: "rf001",
      pattern: "photo|headshot",
      severity: "high",
      userMessage:
        "Photos are not standard for professional resumes in many regions.",
      suggestion: "Consider removing the photo.",
    },
    {
      id: "rf002",
      pattern: "references available upon request",
      severity: "low",
      userMessage: "Outdated phrase that wastes space.",
      suggestion: "Remove this phrase.",
    },
    {
      id: "rf003",
      pattern: "objective:",
      severity: "medium",
      userMessage: "Objective statements are outdated.",
      suggestion: "Replace with a professional summary.",
    },
    {
      id: "rf004",
      pattern:
        "hardworking|team player|passionate|self-motivated|detail-oriented|go-getter",
      severity: "medium",
      userMessage: "Generic adjectives add no value.",
      suggestion:
        "Show these qualities through achievements instead.",
    },
  ],

  skillCategories: {},

  keyRecruiterSignals: [
    "clear role/title",
    "career progression",
    "quantified achievements",
    "clean formatting",
    "relevant skills",
  ],

  commonJobTitles: [],
  commonKeywords: [],
  learningResources: {},
};

const result = professionKnowledgeBaseSchema.safeParse(genericKB);
if (!result.success) {
  throw new Error(
    `Generic knowledge base validation failed: ${result.error.message}`
  );
}
