import { professionKnowledgeBaseSchema } from "./types.js";
import type { ProfessionKnowledgeBase } from "./types.js";

export const softwareEngineerKB: ProfessionKnowledgeBase = {
  professionId: "software_engineer",
  displayName: "Software Engineer",
  aliases: ["swe", "software developer", "software engineer", "developer"],

  careerLevels: [
    {
      id: "new_grad",
      label: "New Graduate / No Experience",
      experienceRange: "0-1 years",
      detectionHints: [
        "student",
        "bootcamp",
        "intern",
        "no experience",
        "entry level",
        "recent graduate",
        "new grad",
      ],
      requiredSections: ["contact", "education", "skills"],
      recommendedSections: ["projects", "experience"],
      optionalSections: [
        "summary",
        "certifications",
        "github",
        "linkedin",
        "open_source",
      ],
      irrelevantSections: ["publications"],
      resumeLength: { target: 1, maximum: 1 },
      sectionWeights: {
        education: 0.25,
        experience: 0.2,
        projects: 0.25,
        skills: 0.2,
        summary: 0.1,
      },
    },
    {
      id: "junior",
      label: "Junior Engineer",
      experienceRange: "0-2 years",
      detectionHints: [
        "junior",
        "entry-level",
        "associate",
        "0-2 years",
        "1 year experience",
        "first job",
      ],
      requiredSections: ["contact", "experience", "education", "skills"],
      recommendedSections: ["projects", "summary"],
      optionalSections: ["certifications", "github", "linkedin"],
      irrelevantSections: ["publications"],
      resumeLength: { target: 1, maximum: 1 },
      sectionWeights: {
        experience: 0.35,
        skills: 0.2,
        education: 0.15,
        projects: 0.2,
        summary: 0.1,
      },
    },
    {
      id: "mid",
      label: "Mid-Level Engineer",
      experienceRange: "2-5 years",
      detectionHints: [
        "mid-level",
        "software engineer",
        "developer",
        "2 years",
        "3 years",
        "4 years",
        "5 years",
      ],
      requiredSections: ["contact", "experience", "skills"],
      recommendedSections: ["summary", "education"],
      optionalSections: [
        "projects",
        "certifications",
        "github",
        "linkedin",
        "open_source",
      ],
      irrelevantSections: [],
      resumeLength: { target: 1, maximum: 2 },
      sectionWeights: {
        experience: 0.45,
        skills: 0.2,
        summary: 0.15,
        education: 0.1,
        projects: 0.1,
      },
    },
    {
      id: "senior",
      label: "Senior Engineer",
      experienceRange: "5-10 years",
      detectionHints: [
        "senior",
        "lead",
        "staff",
        "principal",
        "5 years",
        "7 years",
        "10 years",
      ],
      requiredSections: ["contact", "experience", "skills", "summary"],
      recommendedSections: ["education", "linkedin"],
      optionalSections: ["projects", "certifications", "github", "open_source"],
      irrelevantSections: [],
      resumeLength: { target: 2, maximum: 2 },
      sectionWeights: {
        experience: 0.5,
        skills: 0.15,
        summary: 0.2,
        education: 0.05,
        projects: 0.1,
      },
    },
    {
      id: "staff",
      label: "Staff / Principal Engineer",
      experienceRange: "10+ years",
      detectionHints: [
        "staff",
        "principal",
        "director",
        "vp",
        "architect",
        "10 years",
        "15 years",
        "20 years",
      ],
      requiredSections: ["contact", "experience", "skills", "summary"],
      recommendedSections: ["education", "linkedin", "open_source"],
      optionalSections: ["projects", "certifications", "github"],
      irrelevantSections: [],
      resumeLength: { target: 2, maximum: 2 },
      sectionWeights: {
        experience: 0.5,
        skills: 0.1,
        summary: 0.25,
        education: 0.05,
        projects: 0.1,
      },
    },
  ],

  sectionStandards: {
    experience: {
      bulletFormula: "Action Verb + What You Did + Measurable Outcome",
      bulletCountRange: [3, 6],
      requiredElements: ["company", "title", "dates", "bullets"],
      forbiddenPatterns: [
        "responsible for",
        "worked on",
        "helped with",
        "assisted with",
      ],
      qualityIndicators: [
        "has_metric",
        "has_action_verb",
        "has_quantifiable_result",
      ],
    },
    summary: {
      bulletFormula: "Role/level + Tech stack + Concrete differentiator",
      bulletCountRange: [2, 4],
      requiredElements: ["role_level", "tech_stack"],
      forbiddenPatterns: [
        "passionate about",
        "team player",
        "eager to learn",
        "hardworking",
        "self-motivated",
      ],
      qualityIndicators: ["has_specific_tech", "has_differentiator", "concise"],
    },
    skills: {
      bulletFormula: "Category: Skill1, Skill2, Skill3",
      bulletCountRange: [4, 8],
      requiredElements: ["categorized_groups"],
      forbiddenPatterns: ["microsoft office"],
      qualityIndicators: [
        "has_categories",
        "has_modern_tech",
        "ats_readable_format",
      ],
    },
    projects: {
      bulletFormula:
        "Project name + What it does + Tech stack + Metric or scale",
      bulletCountRange: [2, 4],
      requiredElements: ["project_name", "description", "tech_stack"],
      forbiddenPatterns: ["built a to-do app"],
      qualityIndicators: ["has_link", "has_metric", "has_tech_stack"],
    },
    education: {
      bulletFormula: "Degree + Institution + Year + Relevant details",
      bulletCountRange: [1, 3],
      requiredElements: ["degree", "institution"],
      forbiddenPatterns: [],
      qualityIndicators: ["has_gpa_if_strong", "has_relevant_coursework"],
    },
  },

  atsRules: [
    {
      id: "ats001",
      description: "No tables for layout",
      severity: "high",
      check: "Workday and other ATS cannot parse table layouts. Use plain text sections.",
      userMessage:
        "Workday and other ATS cannot parse table layouts. Use plain text sections.",
    },
    {
      id: "ats002",
      description: "No text boxes",
      severity: "high",
      check: "Text boxes are not parseable by most ATS systems.",
      userMessage:
        "Text boxes are not parseable by most ATS systems.",
    },
    {
      id: "ats003",
      description: "No multi-column layouts",
      severity: "high",
      check: "Two-column layouts break ATS text extraction order.",
      userMessage:
        "Two-column layouts break ATS text extraction order.",
    },
    {
      id: "ats004",
      description: "No important content in headers/footers",
      severity: "high",
      check: "ATS ignores headers and footers. Move critical content to the body.",
      userMessage:
        "ATS ignores headers and footers. Move critical content to the body.",
    },
    {
      id: "ats005",
      description: "Use standard section titles",
      severity: "medium",
      check: "Use 'Work Experience' not 'Where I've Been'. ATS pattern-matches on standard section names.",
      userMessage:
        "Use 'Work Experience' not 'Where I've Been'. ATS pattern-matches on standard section names.",
    },
    {
      id: "ats006",
      description: "Use standard fonts",
      severity: "low",
      check: "ATS parses standard system fonts reliably. Avoid decorative or unusual fonts.",
      userMessage:
        "ATS parses standard system fonts reliably. Avoid decorative or unusual fonts.",
    },
    {
      id: "ats007",
      description: "Use standard bullet characters",
      severity: "medium",
      check: "Some ATS cannot handle decorative bullet characters. Use standard round bullets.",
      userMessage:
        "Some ATS cannot handle decorative bullet characters. Use standard round bullets.",
    },
    {
      id: "ats008",
      description: "Dates must be parseable",
      severity: "medium",
      check: "Use 'Jan 2022 – Present' format. Avoid 'January of 2022 to now'.",
      userMessage:
        "Use 'Jan 2022 – Present' format. Avoid 'January of 2022 to now'.",
    },
  ],

  actionVerbs: {
    strong: [
      "Architected",
      "Designed",
      "Engineered",
      "Spearheaded",
      "Established",
      "Pioneered",
      "Built",
      "Developed",
      "Implemented",
      "Launched",
      "Shipped",
      "Deployed",
      "Released",
      "Optimized",
      "Improved",
      "Reduced",
      "Eliminated",
      "Accelerated",
      "Enhanced",
      "Streamlined",
      "Scaled",
      "Expanded",
      "Extended",
      "Grew",
      "Increased",
      "Led",
      "Mentored",
      "Collaborated",
      "Coordinated",
      "Partnered",
      "Resolved",
      "Debugged",
      "Diagnosed",
      "Refactored",
      "Migrated",
      "Modernized",
      "Automated",
      "Delivered",
    ],
    weak: [
      "Worked on",
      "Assisted with",
      "Helped",
      "Was responsible for",
      "Contributed to",
      "Participated in",
    ],
  },

  metricPatterns: [
    "\\d+%",
    "\\d+x",
    "\\d+[KMG]?(?:\\s+users|\\s+customers|\\s+requests)",
    "(?:reduced|improved|increased|decreased).*\\d+",
    "\\$\\d+[KMB]?",
    "(?:led|managed|mentored)\\s+(?:team\\s+of\\s+)?\\d+",
    "\\d+%\\s+test\\s+coverage",
    "\\d+[KMG]?\\s+(?:transactions|requests|queries)\\s+per\\s+(?:day|second|minute)",
  ],

  redFlags: [
    {
      id: "rf001",
      pattern: "photo|headshot",
      severity: "high",
      userMessage:
        "Photos are not standard for US/UK tech resumes. Consider removing.",
      suggestion: "Remove the photo from your resume.",
    },
    {
      id: "rf002",
      pattern: "references available upon request",
      severity: "low",
      userMessage:
        "This phrase is outdated and wastes space.",
      suggestion:
        "Remove this phrase — references are assumed.",
    },
    {
      id: "rf003",
      pattern: "objective:",
      severity: "medium",
      userMessage:
        "Objective statements focus on what you want, not what you offer.",
      suggestion: "Replace objective with a professional summary.",
    },
    {
      id: "rf004",
      pattern: "hotmail|yahoo",
      severity: "low",
      userMessage:
        "Consider using a more professional email provider.",
      suggestion:
        "Use a Gmail or professional domain email.",
    },
    {
      id: "rf005",
      pattern: "microsoft office",
      severity: "low",
      userMessage:
        "Microsoft Office is not relevant for SWE roles.",
      suggestion: "Remove Microsoft Office from your skills.",
    },
    {
      id: "rf006",
      pattern:
        "hardworking|team player|passionate|self-motivated|detail-oriented",
      severity: "medium",
      userMessage: "Generic adjectives add no value.",
      suggestion:
        "Remove generic adjectives — show these through achievements.",
    },
    {
      id: "rf007",
      pattern: "responsible for",
      severity: "high",
      userMessage: "Describes duties, not achievements.",
      suggestion:
        "Start with an action verb: 'Led', 'Managed', 'Delivered'.",
    },
    {
      id: "rf008",
      pattern: "gpa",
      severity: "low",
      userMessage:
        "GPA is irrelevant for experienced engineers.",
      suggestion:
        "Consider removing GPA — your experience speaks louder.",
    },
  ],

  skillCategories: {
    languages: {
      examples: [
        "Python",
        "TypeScript",
        "JavaScript",
        "Go",
        "Java",
        "Rust",
        "C++",
        "C#",
        "Ruby",
        "PHP",
        "Swift",
        "Kotlin",
      ],
      atsWeight: 0.3,
    },
    frameworks: {
      examples: [
        "React",
        "Node.js",
        "Next.js",
        "Express",
        "FastAPI",
        "Django",
        "Spring Boot",
        "Vue.js",
        "Angular",
        "Svelte",
        "Rails",
        "Flask",
      ],
      atsWeight: 0.25,
    },
    databases: {
      examples: [
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Redis",
        "DynamoDB",
        "Elasticsearch",
        "SQLite",
        "Cassandra",
      ],
      atsWeight: 0.15,
    },
    cloud_devops: {
      examples: [
        "AWS",
        "GCP",
        "Azure",
        "Docker",
        "Kubernetes",
        "Terraform",
        "CI/CD",
        "GitHub Actions",
        "Jenkins",
        "GitLab CI",
      ],
      atsWeight: 0.15,
    },
    tools: {
      examples: [
        "Git",
        "Linux",
        "Vim",
        "VS Code",
        "Postman",
        "Jira",
        "Figma",
        "Datadog",
        "Grafana",
      ],
      atsWeight: 0.05,
    },
  },

  keyRecruiterSignals: [
    "system design",
    "scalability",
    "leadership",
    "impact metrics",
    "career progression",
    "tech stack relevance",
    "action verbs in bullets",
    "clean formatting",
  ],

  commonJobTitles: [
    "Software Engineer",
    "Senior Software Engineer",
    "Staff Software Engineer",
    "Principal Engineer",
    "Frontend Engineer",
    "Backend Engineer",
    "Full Stack Engineer",
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Platform Engineer",
    "Data Engineer",
    "ML Engineer",
    "Engineering Manager",
    "Technical Lead",
  ],

  commonKeywords: [
    "algorithms",
    "data structures",
    "system design",
    "distributed systems",
    "microservices",
    "REST",
    "API",
    "CI/CD",
    "agile",
    "scalability",
    "performance",
    "testing",
    "code review",
    "architecture",
    "cloud",
    "containers",
    "automation",
  ],

  learningResources: {
    system_design: {
      courses: [
        "Designing Data-Intensive Applications (book)",
        "ByteByteGo (Alex Xu)",
      ],
      projects: [
        "Build a URL shortener with caching",
        "Design a chat system",
      ],
      timeline: "2-3 months",
      resumeBulletExample:
        "Designed and implemented a distributed caching layer that reduced database load by 60%",
    },
    cloud: {
      courses: [
        "AWS Solutions Architect Associate",
        "GCP Professional Cloud Architect",
      ],
      projects: [
        "Deploy a multi-tier app with Terraform",
        "Set up CI/CD pipeline with GitHub Actions",
      ],
      timeline: "1-2 months",
      resumeBulletExample:
        "Migrated monolithic application to AWS Lambda, reducing infrastructure costs by 40%",
    },
  },
};

const result = professionKnowledgeBaseSchema.safeParse(softwareEngineerKB);
if (!result.success) {
  throw new Error(
    `SWE knowledge base validation failed: ${result.error.message}`,
  );
}
