import type { PdfResumeData } from "../components/pdf/templates/templateTypes";

/**
 * Converts plain text from AI tailor output to TipTap-compatible HTML.
 */
export function tailorToEditorContent(text: string): string {
  const blocks = text.split(/\n\n+/);
  const htmlParts: string[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trimEnd());

    if (lines.length === 0) continue;

    const isBulletBlock = lines.every(
      (line) => line.startsWith("- ") || line.startsWith("* "),
    );

    if (isBulletBlock) {
      const items = lines
        .map((line) => line.slice(2).trim())
        .filter((item) => item.length > 0)
        .map((item) => `<li>${item}</li>`)
        .join("");
      htmlParts.push(`<ul>${items}</ul>`);
      continue;
    }

    const htmlLines: string[] = [];
    let inBulletGroup = false;
    let bulletItems: string[] = [];

    const flushBullets = () => {
      if (bulletItems.length > 0) {
        htmlLines.push(
          `<ul>${bulletItems.map((item) => `<li>${item}</li>`).join("")}</ul>`,
        );
        bulletItems = [];
      }
      inBulletGroup = false;
    };

    for (const line of lines) {
      if (line.length === 0) continue;

      if (line.startsWith("- ") || line.startsWith("* ")) {
        inBulletGroup = true;
        bulletItems.push(line.slice(2).trim());
        continue;
      }

      if (inBulletGroup) {
        flushBullets();
      }

      if (line === line.toUpperCase() && line !== line.toLowerCase()) {
        htmlLines.push(`<h3>${line}</h3>`);
      } else if (line.endsWith(":")) {
        htmlLines.push(`<h3>${line}</h3>`);
      } else {
        htmlLines.push(`<p>${line}</p>`);
      }
    }

    flushBullets();
    htmlParts.push(...htmlLines);
  }

  return htmlParts.join("");
}

// ── Keyword-set mapping for matching section names to PdfResumeData fields ──

const SECTION_KEYWORD_MAP: Record<
  string,
  string[]
> = {
  summary: ["summary", "objective", "profile", "about"],
  workExperiences: [
    "experience",
    "employment",
    "work",
    "professional background",
    "career history",
  ],
  education: ["education", "academic", "qualification"],
  projects: ["project", "portfolio"],
  certifications: ["certification", "certificate", "credential", "license"],
  skills: ["skill", "competenc", "technical", "technologies"],
};

function matchSectionKey(
  sectionName: string,
): string | null {
  const lower = sectionName.toLowerCase();
  for (const [key, keywords] of Object.entries(SECTION_KEYWORD_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return key;
    }
  }
  return null;
}

// ── HTML parsing helpers ──

/**
 * Extract bullet points from HTML content (used for work experience descriptions).
 */
/**
 * Extract plain text from HTML, stripping tags.
 */
function htmlToPlainText(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").trim();
}

// ── parsedData sections to HTML transforms (for untailored sections) ──

export function parsedDataToSectionHtml(
  key: string,
  data: NonNullable<unknown>,
): string {
  switch (key) {
    case "education": {
      const entries = data as Array<{
        institution: string;
        degree: string;
        field: string;
        year: string;
      }>;
      if (entries.length === 0) return "";
      const items = entries
        .map(
          (e) =>
            `<p><strong>${e.institution}</strong> — ${e.degree} in ${e.field}</p><p>${e.year}</p>`,
        )
        .join("");
      return `<h3>Education</h3>${items}`;
    }
    case "workExperiences": {
      const entries = data as Array<{
        company: string;
        title: string;
        startDate: string;
        endDate: string;
        description: string;
      }>;
      if (entries.length === 0) return "";
      const items = entries
        .map((e) => {
          const descLines = e.description
            .split("\n")
            .filter((l) => l.trim())
            .map((l) => `<li>${l.trim()}</li>`)
            .join("");
          const bullets = descLines
            ? `<ul>${descLines}</ul>`
            : "";
          return `<p><strong>${e.company}</strong> | ${e.title}</p><p>${e.startDate} – ${e.endDate}</p>${bullets}`;
        })
        .join("");
      return `<h3>Work Experience</h3>${items}`;
    }
    case "projects": {
      const entries = data as Array<{
        name: string;
        description: string;
        technologies: string[];
      }>;
      if (entries.length === 0) return "";
      const items = entries
        .map(
          (e) =>
            `<p><strong>${e.name}</strong></p><p>${e.description}</p><p>Technologies: ${e.technologies.join(", ")}</p>`,
        )
        .join("");
      return `<h3>Projects</h3>${items}`;
    }
    case "certifications": {
      const entries = data as Array<{
        name: string;
        issuer: string;
        year: string;
      }>;
      if (entries.length === 0) return "";
      const items = entries
        .map(
          (e) =>
            `<p><strong>${e.name}</strong> — ${e.issuer} (${e.year})</p>`,
        )
        .join("");
      return `<h3>Certifications</h3>${items}`;
    }
    default:
      return "";
  }
}

// ── Main transform: editor sections + parsedData → PdfResumeData ──

interface MinimalParsedData {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  technicalSkills?: string[];
  softSkills?: string[];
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;
  workExperiences?: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
}

export function editorToPdfData(
  sections: Array<{ id: string; name: string; htmlContent: string }>,
  parsedData: MinimalParsedData,
): PdfResumeData {
  // 1. Start with ALL parsedData as defaults (defensive: fallback to [] for missing arrays)
  const workExperiences = parsedData.workExperiences ?? [];
  const education = parsedData.education ?? [];
  const projects = parsedData.projects ?? [];
  const certifications = parsedData.certifications ?? [];
  const technicalSkills = parsedData.technicalSkills ?? [];
  const softSkills = parsedData.softSkills ?? [];

  const result: PdfResumeData = {
    name: parsedData.fullName ?? "",
    contact: {
      email: parsedData.email ?? "",
      phone: parsedData.phone ?? "",
      location: parsedData.location ?? "",
    },
    workExperiences: workExperiences.map((e) => ({
      company: e.company,
      title: e.title,
      dateRange: `${e.startDate} – ${e.endDate}`,
      bullets: (e.description ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0),
    })),
    education: education.map((e) => ({
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      year: e.year,
    })),
    projects: projects.map((e) => ({
      name: e.name,
      description: e.description,
      technologies: e.technologies ?? [],
    })),
    certifications: certifications.map((e) => ({
      name: e.name,
      issuer: e.issuer,
      year: e.year,
    })),
    skills: [...technicalSkills, ...softSkills],
    sectionOrder: [],
    additionalSections: [],
  };

  // Track which data keys have been matched by editor sections
  const matchedKeys = new Set<string>();

  // 2. Overlay tailored editor sections on top
  for (const section of sections) {
    const key = matchSectionKey(section.name);
    if (!key) {
      // Unmatched section → additionalSections
      const plain = htmlToPlainText(section.htmlContent);
      if (plain) {
        result.additionalSections!.push({
          title: section.name,
          content: plain,
        });
      }
      continue;
    }

    matchedKeys.add(key);

    switch (key) {
      case "summary":
        result.summary = htmlToPlainText(section.htmlContent);
        break;
      case "workExperiences":
        result.workExperiences = parseWorkExperiences(section.htmlContent);
        break;
      case "education":
        result.education = parseEducation(section.htmlContent);
        break;
      case "projects":
        result.projects = parseProjects(section.htmlContent);
        break;
      case "certifications":
        result.certifications = parseCertifications(section.htmlContent);
        break;
      case "skills": {
        const text = htmlToPlainText(section.htmlContent);
        result.skills = text
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        break;
      }
    }
  }

  // 3. Build sectionOrder — follow editor section order + append unmatched parsedData sections
  const order: string[] = [];

  // Editor sections come first, in their original order
  for (const section of sections) {
    const key = matchSectionKey(section.name);
    if (key) {
      if (!order.includes(key)) order.push(key);
    } else {
      // Additional section — use title as identifier
      order.push(`additional:${section.name}`);
    }
  }

  // Then append parsedData sections that weren't covered by editor sections
  const defaultOrder = [
    "summary",
    "workExperiences",
    "education",
    "projects",
    "certifications",
    "skills",
  ];

  for (const key of defaultOrder) {
    if (!matchedKeys.has(key) && hasData(key, result)) {
      order.push(key);
    }
  }

  result.sectionOrder = order;

  // Clean up empty additionalSections
  if (result.additionalSections!.length === 0) {
    delete result.additionalSections;
  }

  return result;
}

/** Check if a section has data worth showing */
function hasData(key: string, data: PdfResumeData): boolean {
  switch (key) {
    case "summary":
      return !!data.summary;
    case "workExperiences":
      return data.workExperiences.length > 0;
    case "education":
      return data.education.length > 0;
    case "projects":
      return data.projects.length > 0;
    case "certifications":
      return data.certifications.length > 0;
    case "skills":
      return data.skills.length > 0;
    default:
      return false;
  }
}

// ── HTML parsers for each section type ──

function parseWorkExperiences(
  html: string,
): PdfResumeData["workExperiences"] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const experiences: PdfResumeData["workExperiences"] = [];

  // Walk top-level children, group by headings
  let current: (typeof experiences)[number] | null = null;

  const children = Array.from(doc.body.children);
  for (const node of children) {
    const tag = node.tagName.toLowerCase();
    const text = (node.textContent ?? "").trim();
    if (!text) continue;

    if (tag === "h2" || tag === "h3") {
      if (current) experiences.push(current);
      current = { company: text, title: "", dateRange: "", bullets: [] };
      continue;
    }

    if (tag === "p") {
      const boldEl = node.querySelector("strong, b");
      if (boldEl) {
        if (current) experiences.push(current);
        const boldText = (boldEl.textContent ?? "").trim();
        const remaining = getNonBoldText(node);
        // "Company | Title" pattern
        if (remaining.startsWith("|") || remaining.startsWith("–") || remaining.startsWith("—")) {
          current = {
            company: boldText,
            title: remaining.replace(/^[|–—]\s*/, "").trim(),
            dateRange: "",
            bullets: [],
          };
        } else {
          current = {
            company: boldText,
            title: remaining,
            dateRange: "",
            bullets: [],
          };
        }
        continue;
      }

      // Non-bold paragraph — could be date range or description
      if (current) {
        if (!current.dateRange && /^\d/.test(text)) {
          current.dateRange = text;
        } else {
          current.bullets.push(text);
        }
      }
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      if (current) {
        node.querySelectorAll("li").forEach((li) => {
          const liText = (li.textContent ?? "").trim();
          if (liText) current!.bullets.push(liText);
        });
      }
    }
  }

  if (current) experiences.push(current);
  return experiences;
}

function parseEducation(html: string): PdfResumeData["education"] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const entries: PdfResumeData["education"] = [];

  let current: (typeof entries)[number] | null = null;
  let partCount = 0;

  const children = Array.from(doc.body.children);
  for (const node of children) {
    const tag = node.tagName.toLowerCase();
    const text = (node.textContent ?? "").trim();
    if (!text) continue;

    if (tag === "h2" || tag === "h3") {
      // Section heading, skip
      continue;
    }

    if (tag === "p") {
      const boldEl = node.querySelector("strong, b");
      if (boldEl) {
        if (current) entries.push(current);
        const boldText = (boldEl.textContent ?? "").trim();
        const remaining = getNonBoldText(node);
        current = {
          institution: boldText,
          degree: remaining
            .replace(/^[–—]\s*/, "")
            .split(" in ")[0]
            .trim(),
          field:
            remaining.includes(" in ")
              ? remaining.split(" in ").slice(1).join(" in ").trim()
              : "",
          year: "",
        };
        partCount = 1;
        continue;
      }

      // Non-bold paragraph — could be year
      if (current) {
        partCount++;
        if (!current.year && /^\d/.test(text)) {
          current.year = text;
        } else if (!current.degree) {
          current.degree = text;
        }
      }
    }
  }

  if (current) entries.push(current);
  return entries;
}

function parseProjects(html: string): PdfResumeData["projects"] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const entries: PdfResumeData["projects"] = [];

  let current: (typeof entries)[number] | null = null;
  let partCount = 0;

  const children = Array.from(doc.body.children);
  for (const node of children) {
    const tag = node.tagName.toLowerCase();
    const text = (node.textContent ?? "").trim();
    if (!text) continue;

    if (tag === "h2" || tag === "h3") continue;

    if (tag === "p") {
      const boldEl = node.querySelector("strong, b");
      if (boldEl) {
        if (current) entries.push(current);
        current = {
          name: (boldEl.textContent ?? "").trim(),
          description: "",
          technologies: [],
        };
        partCount = 0;
        continue;
      }

      if (current) {
        partCount++;
        if (text.toLowerCase().startsWith("technologies:")) {
          current.technologies = text
            .slice(13)
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s);
        } else if (!current.description) {
          current.description = text;
        }
      }
    }
  }

  if (current) entries.push(current);
  return entries;
}

function parseCertifications(
  html: string,
): PdfResumeData["certifications"] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const entries: PdfResumeData["certifications"] = [];

  const children = Array.from(doc.body.children);
  for (const node of children) {
    const tag = node.tagName.toLowerCase();
    const text = (node.textContent ?? "").trim();
    if (!text) continue;

    if (tag === "h2" || tag === "h3") continue;

    if (tag === "p") {
      // Format: "Name — Issuer (Year)" or just "Name"
      const match = text.match(/^(.+?)\s*[—–]\s*(.+?)\s*\((\d{4})\)$/);
      if (match) {
        entries.push({
          name: match[1].trim(),
          issuer: match[2].trim(),
          year: match[3],
        });
      } else {
        const boldEl = node.querySelector("strong, b");
        if (boldEl) {
          const boldText = (boldEl.textContent ?? "").trim();
          const remaining = getNonBoldText(node);
          // Parse "— Issuer (Year)"
          const issuerMatch = remaining.match(
            /^[—–]\s*(.+?)\s*\((\d{4})\)$/,
          );
          entries.push({
            name: boldText,
            issuer: issuerMatch ? issuerMatch[1].trim() : remaining.replace(/^[—–]\s*/, ""),
            year: issuerMatch ? issuerMatch[2] : "",
          });
        } else {
          entries.push({ name: text, issuer: "", year: "" });
        }
      }
    }
  }

  return entries;
}

/**
 * Extracts text content from a `<p>` element, excluding leading `<strong>`/`<b>` children.
 */
function getNonBoldText(element: Element): string {
  const parts: string[] = [];
  for (const child of Array.from(element.childNodes)) {
    if (
      child.nodeType === Node.ELEMENT_NODE &&
      ((child as Element).tagName.toLowerCase() === "strong" ||
        (child as Element).tagName.toLowerCase() === "b")
    ) {
      continue;
    }
    const text = (child.textContent ?? "").trim();
    if (text.length > 0) {
      parts.push(text);
    }
  }
  return parts.join(" ");
}
