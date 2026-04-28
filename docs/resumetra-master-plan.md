
### The Resume Tool Built Specifically for Software Engineers

**Version**: 2.0 **Status**: Pre-build  
**Audience**: Founders, developers, designers working on Resumetra  
**Purpose**: This document is the single source of truth for what we are building, why we are building it, how it works, and in what order we execute. Every decision made in this plan traces back to a real user pain point or a market observation. Nothing in here is arbitrary.

---

## Table of Contents

1. [The Problem We Are Solving](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#1-the-problem-we-are-solving)
2. [Why Software Engineers First](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#2-why-software-engineers-first)
3. [Market Context](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#3-market-context)
4. [Our Positioning](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#4-our-positioning)
5. [What a Great SWE Resume Looks Like](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#5-what-a-great-swe-resume-looks-like)
6. [The Knowledge Base System](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#6-the-knowledge-base-system)
7. [Product Overview](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#7-product-overview)
8. [The AI Pipeline — High Level](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#8-the-ai-pipeline--high-level)
9. [Honest Tailoring — The Core Differentiator](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#9-honest-tailoring--the-core-differentiator)
10. [Edge Cases and How We Handle Them](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#10-edge-cases-and-how-we-handle-them)
11. [The Editor Experience](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#11-the-editor-experience)
12. [PDF Export](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#12-pdf-export)
13. [Go-To-Market Strategy](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#13-go-to-market-strategy)
14. [Phased Roadmap](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#14-phased-roadmap)
15. [System and Code Level Architecture](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#15-system-and-code-level-architecture)
16. [Success Metrics](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#16-success-metrics)
17. [What We Will Not Build Yet](https://claude.ai/chat/59f9afda-901c-4473-9b5b-41648a672956#17-what-we-will-not-build-yet)

---

## 1. The Problem We Are Solving

### 1.1 The Job Seeker's Reality

A software engineer applying for jobs in 2025 faces a broken pipeline:

- **ATS systems reject 75% of resumes before a human sees them.** Most engineers don't know why their resume failed. The ATS does not tell them. They just never hear back. (Source: Jobscan research, 2024)
- **Recruiters spend an average of 6-7 seconds on an initial resume scan.** If the right keywords and structure aren't immediately visible, the resume goes to the reject pile. (Source: Ladders eye-tracking study)
- **Generic AI tools make the problem worse.** Tools like ChatGPT rewrite resumes with fabricated skills and inflated claims. Engineers paste these into applications, get through screening, and then fail in technical interviews because the resume doesn't reflect their real abilities. This destroys confidence and wastes everyone's time.
- **Most resume builders are template tools, not intelligence tools.** Zety, Resume.io, Novoresume — they help you format. They don't tell you that your bullet points have no metrics, that you're missing a GitHub link, or that "worked with React" is meaningless when the job requires "built component libraries with React 18 + TypeScript."

### 1.2 The Current Market Gap

Every existing tool falls into one of two categories:

**Category A — Template builders** (Zety, Novoresume, Kickresume, Canva) They help you make a resume look good. They have no idea if the content is good. They will happily format a terrible resume beautifully.

**Category B — Generic AI keyword tools** (Rezi, Resume Worded, Jobscan) They match keywords and suggest rewrites. They treat a software engineer resume the same as a nurse resume or a marketing manager resume. They don't understand that "Led a team" means something completely different at a FAANG company vs a 5-person startup.

**The gap**: Nobody is doing deep, profession-specific, honest resume intelligence. Nobody is telling the engineer: "This bullet is weak because it has no metric. Here is how to rewrite it based on what you actually did. And by the way — this job requires Kubernetes experience and you don't have it. Here is how to build that in 6 weeks."

That is what Resumetra does.

### 1.3 Pain Points We Are Directly Solving

|Pain Point|How Common|What Exists Today|What We Do|
|---|---|---|---|
|Don't know why ATS rejected resume|Very common|Jobscan shows keyword gaps, nothing more|Deterministic ATS analysis + specific fix per gap|
|AI rewrites fabricate skills|Very common|Everyone does it|Honest gap classification — never fabricate|
|Resume missing key sections for SWE roles|Common|Generic checklists|SWE-specific section standards per career level|
|Bullet points are weak (no metrics, no action verbs)|Extremely common|Generic suggestions|Bullet-level analysis with specific rewrite|
|Don't know what skills to add vs what they don't have|Common|Not addressed anywhere|Learning path recommendations per missing skill|
|Tailored resume loses original content|Common (our current bug)|Not addressed|Full content preservation from original|
|Can't edit the tailored output|Current product limitation|Most tools read-only|Live structured editor with per-item accept/reject|
|Zero-experience users don't know where to start|Very common for students/new grads|Ignored or treated as an error|Build Mode — guided resume creation from nothing|

---

## 2. Why Software Engineers First

### 2.1 The Strategic Case

Launching for all professions at once means being generic for all of them. That is exactly what every competitor already does. We cannot win a generic fight against tools with millions of users and years of head start.

Launching for software engineers specifically means:

- We can encode real, deep knowledge of what a great SWE resume looks like at each career level (Junior, Mid, Senior, Staff, Principal)
- We can build ATS intelligence around the actual systems tech companies use (Greenhouse, Lever, Workday, iCIMS)
- We can speak the language of the community authentically
- Word of mouth travels fast inside tight engineering communities — Hacker News, Reddit r/cscareerquestions (3.2M members), Dev.to, LinkedIn tech circles, Discord servers

### 2.2 Market Size Within the Niche

Software engineering is one of the largest professional categories globally:

- 27 million software developers worldwide (Evans Data Corporation, 2023)
- The US alone has 4+ million software development jobs
- Tech layoffs since 2022 have put hundreds of thousands of engineers actively job hunting
- Even engineers who are employed are always passively exploring — a constant active market

This is not a small niche. It is a massive market with a shared language, shared pain points, and shared communities.

### 2.3 The Expansion Path

Starting with SWEs does not limit us. It gives us:

1. A proven product with real testimonials
2. An established brand in one community
3. A technical foundation that generalizes

The expansion sequence makes natural sense:

```
Phase 1 (Months 1-6):    Software Engineers
Phase 2 (Months 7-9):    Product Managers (adjacent, same tech companies)
Phase 3 (Months 10-12):  Data Scientists / ML Engineers (same community)
Phase 4 (Year 2 Q1):     UX / Design (portfolio-forward, different structure)
Phase 5 (Year 2 Q2+):    Finance, Marketing, Healthcare (broader expansion)
```

Each expansion adds profession-specific knowledge to the same underlying system. The infrastructure is built once. The knowledge grows.

---

## 3. Market Context

### 3.1 Market Size and Growth

- AI-powered resume builder market: $400M in 2024, projected $1.8B by 2032 (20% CAGR)
- The broader resume builder market: $470M+ growing at 8% annually
- Personal use (individual job seekers) accounts for 41.2% of revenue — our primary target
- No single player dominates: top 5 platforms control only ~42% of revenue combined

### 3.2 What Competitors Are Doing and Not Doing

**Rezi** ($29/month or $149 lifetime)

- ATS-optimized resume builder, keyword targeting
- Generic — no profession intelligence
- Does not tell users what they are missing
- 4M+ users, Forbes ranked #1 — proving market demand exists

**Resume Worded** (freemium + premium)

- Line-by-line scoring, brief/impact analysis
- Generic criteria applied to all professions equally
- No tailoring, no editing, no export
- Good at analysis, stops there

**Jobscan** (freemium + $49/month)

- Best ATS matching in the market
- Compares resume to job description keyword by keyword
- Enterprise product gaining traction (600+ corporate clients)
- Still generic — no profession depth, no honest gap analysis

**Enhancv** (free trial + subscription)

- 10M users, beautiful templates, visual CV feature
- Strong design, weak intelligence
- AI generates bullet suggestions but no profession awareness

**Kickresume** (freemium)

- 8M users, 350+ university partnerships
- Strong in education/student segment
- Template-first, AI is a feature not the core

**The Gap Nobody Is Filling**: Profession-specific intelligence + honest tailoring + full editing + clean PDF export. That is our exact position.

### 3.3 The Commoditization Risk

Generic AI resume generation is commoditizing fast. Adding GPT to a template builder takes a developer one weekend. The barrier to copy the generic approach is near zero.

The barrier to copy deep profession-specific intelligence, a trusted brand in a specific community, and an honest tailoring reputation is high. That is our moat.

---

## 4. Our Positioning

### 4.1 The One-Line Pitch

> **"The resume tool built specifically for software engineers — honest AI that tells you what to fix, what you're missing, and how to get there."**

### 4.2 What We Stand For

**Honesty over flattery.** We will not fabricate skills the user doesn't have. We will not inflate generic experience into senior-sounding claims. We will tell users the truth and give them a real path forward. This is our brand promise and our ethical line.

**Specificity over generality.** A senior software engineer at a startup and a junior engineer at a bank have completely different resume needs. We know the difference. Every other tool treats them the same.

**Completeness over shortcuts.** Every section of the user's original resume survives our process. Nothing is silently dropped. The user gets back everything they put in, improved.

### 4.3 Who We Are For

**Primary user**: Software engineer at any experience level — from zero experience (students, bootcamp graduates, self-taught developers building their first resume) through to senior engineers (10+ years) actively job hunting or passively open to opportunities.

**Zero-experience users specifically**: Students in CS programs, coding bootcamp graduates, self-taught developers who have built projects but have never worked professionally. These users are not a lesser use case — they are often the most motivated and the most in need of guidance. A student who builds their first professional resume with Resumetra will remember and return when they are a senior engineer. We treat them as first-class users with a dedicated experience (Build Mode) that guides them through creating a competitive resume from little or nothing.

**Secondary user**: Career changers entering software engineering from another field who need to frame adjacent experience correctly. A former teacher who learned to code has real skills — communication, structured thinking, documentation — that map to SWE roles. We help them frame that honestly.

**Not our user (yet)**: Non-technical professionals in fields completely unrelated to tech. If a doctor or lawyer uploads their resume, we do not reject them — we give them a generic scoring experience (see Section 10, Edge Case 10.10) and invite them to check back when we support their profession.

---

## 5. What a Great SWE Resume Looks Like

This section is the knowledge base that powers our AI for software engineers. Everything in here informs how we analyze, score, and improve resumes. This is not opinion — it is synthesized from public hiring manager interviews, FAANG engineering blogs, r/cscareerquestions wisdom, and recruiting research. Section 6 explains how this knowledge base is structured so it can expand to other professions over time.

### 5.1 Required Sections by Career Level

|Section|No Experience (Student/New Grad)|Junior (0-2 yrs)|Mid (2-5 yrs)|Senior (5-10 yrs)|Staff+ (10+ yrs)|
|---|---|---|---|---|---|
|Contact Info|Required|Required|Required|Required|Required|
|Professional Summary|Optional|Optional|Recommended|Recommended|Required|
|Work Experience|Optional (internships, part-time)|Required (internships OK)|Required|Required|Required|
|Education|Required|Required|Required|Optional (can deprioritize)|Optional|
|Projects|Required — this IS the resume|Required (compensates for thin experience)|Recommended|Optional|Not needed|
|Technical Skills|Required|Required|Required|Required|Required|
|Certifications|Optional|Optional|Optional|Optional|Rarely needed|
|GitHub / Portfolio|Required|Strongly recommended|Recommended|Optional|Optional|
|LinkedIn|Optional|Recommended|Required|Required|Required|
|Open Source Contributions|Bonus|Bonus|Optional|Recommended for Staff track|Valued|

### 5.2 Section Content Standards

**Contact Information — Must Have:**

- Full name (no nicknames unless that is how they are professionally known)
- Professional email (gmail/outlook — not yahoo, not hotmail)
- Phone number
- City and country (not full address — privacy and ATS compatibility)
- LinkedIn URL (customized, not the default number-heavy URL)
- GitHub URL (if they have meaningful public repositories)
- Portfolio URL (if applicable — especially for frontend/fullstack)

**Pain point**: Many engineers include their full home address (ATS can discriminate by location), use unprofessional email addresses (hotmail1992@...), or link to a GitHub with no public repos. We flag all of these.

**Professional Summary — What It Must Do:**

- 2-4 sentences maximum
- State the role/level they are targeting ("Senior Backend Engineer with 6 years experience...")
- Name the most relevant tech stack for the target job
- State one concrete differentiator (scaled systems to X users, reduced latency by Y%, built team from Z to N engineers)
- No generic filler ("passionate about technology", "team player", "eager to learn")

**Pain point**: Most summaries are either missing entirely or full of meaningless adjectives. We detect both and provide rewrites based on their actual experience.

**Work Experience — The Most Critical Section:**

Each role must include:

- Company name, job title, dates (month and year), location or "Remote"
- 3-6 bullet points per role (not more — recruiters stop reading)
- Each bullet must follow: **Action Verb + What You Did + Measurable Outcome**

Bullet quality standards:

- **Weak**: "Worked on backend services" — no action verb, no scope, no outcome
- **Medium**: "Developed RESTful APIs for the user service" — has action verb and scope, no outcome
- **Strong**: "Engineered RESTful APIs for the user service, reducing average response time from 800ms to 120ms and supporting 2M daily active users"

Action verbs that signal impact: Engineered, Architected, Reduced, Improved, Scaled, Automated, Eliminated, Delivered, Migrated, Mentored

Action verbs that are weak: Worked on, Assisted with, Helped, Was responsible for, Contributed to

**ATS formatting rules for work experience:**

- Use standard job title names — ATS systems match on titles. "Code Wizard" will not match "Software Engineer" searches
- Dates must be parseable — "Jan 2022 – Present" not "January of 2022 to now"
- Avoid tables for layout — ATS parsers cannot read tables reliably
- No text in headers or footers — ATS ignores them

**Technical Skills — Structure Matters:**

Correct structure for ATS and readability:

```
Languages: Python, TypeScript, Go, Java
Frameworks: React, Node.js, FastAPI, Spring Boot
Databases: PostgreSQL, MongoDB, Redis
Cloud/DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, GitHub Actions
Tools: Git, Postman, Jira, Figma
```

Wrong approach (a single comma-separated list):

```
Python TypeScript Go Java React Node.js FastAPI...
```

ATS systems parse structured categories better. Recruiters scan structured categories faster.

**Pain point**: Most engineers list skills as a blob. We restructure them into categories automatically.

**Projects — For Junior Engineers, This Is the Resume:**

Each project must include:

- Project name and 1-line description of what it does
- Technology stack (this is where keywords live for junior ATS matching)
- Your specific role if it was a team project
- Link to GitHub or live demo
- At least one metric or scale indicator ("handles 10K requests/day", "used by 500 students")

**Pain point**: Junior engineers list projects with no context ("Built a to-do app") or no links. We score projects the same way we score work experience bullets.

**Zero-Experience Resumes — A Special Case:**

A student or bootcamp graduate has no professional work experience. Their resume is built entirely around:

- Projects (personal, academic, hackathon, open source contributions)
- Education (institution, degree, relevant coursework, GPA if strong)
- Technical skills (even if learned from courses — self-taught counts)
- Any part-time work, freelance, or volunteer experience that used technical skills
- Certifications and online courses (AWS, Google Cloud, freeCodeCamp, etc.)

**What we do differently for zero-experience users:**

- We do not penalize missing work experience — we adjust scoring expectations for their career level
- We heavily weight project quality, GitHub activity, and technical skill breadth
- We flag missing GitHub link as HIGH priority (not optional as it would be for seniors)
- We prompt them to add coursework sections: "Did you take databases, algorithms, or systems courses? Add them — they signal CS fundamentals."
- Build Mode is the primary entry point for zero-experience users. They build their resume interactively rather than uploading a thin one.

### 5.3 Resume Length Standards

|Career Level|Target Length|Maximum|
|---|---|---|
|Junior (0-2 years)|1 page|1 page — hard limit|
|Mid (2-5 years)|1 page|1.5 pages|
|Senior (5-10 years)|1-2 pages|2 pages|
|Staff / Principal / Director|2 pages|2 pages|

**Pain point**: Engineers either cram everything onto one page (tiny font, no margins, unreadable) or write 3-page resumes that nobody reads past page 1. We flag both.

### 5.4 ATS Compatibility Rules

These are formatting rules that have nothing to do with content quality but everything to do with whether the resume gets parsed correctly by ATS software:

- **No tables** — Workday and Greenhouse have known issues parsing tables. Use plain text sections.
- **No text boxes** — Not parseable by most ATS
- **No columns in the main body** — Two-column layouts break ATS text extraction order
- **No headers/footers for important content** — ATS ignores headers and footers
- **Standard section titles** — "Work Experience" not "Where I've Been". ATS pattern-matches on section names.
- **Standard fonts** — ATS parse standard system fonts reliably
- **No special characters as bullets** — Some ATS cannot handle decorative bullet characters
- **File format** — PDF is generally safe; DOCX is parsed differently by different ATS systems. We export PDF.

**Reference**: Greenhouse, Lever, and Workday all publish partial documentation on their parsing behavior. Jobscan has compiled extensive ATS compatibility research from their database of 100+ ATS systems.

### 5.5 What Recruiters at Tech Companies Actually Look For

Based on published hiring manager interviews and engineering blog posts from Google, Meta, Stripe, Shopify, and various startups:

**First 6-second scan (recruiter)**:

1. Is the role/title obvious? (summary or most recent job title)
2. Are the company names recognizable or at least legitimate-sounding?
3. Is the tech stack visible and relevant?
4. Does the resume look clean and easy to read?

**15-second deep scan (if they're still interested)**:

1. Bullet points — do they show impact or just activity?
2. Career progression — are they growing between roles?
3. Education — for junior roles, is the institution credible?
4. Any red flags — gaps, too many short tenures, vague titles

**What triggers immediate rejection**:

- Objective statements that mention the wrong company (copy-paste error)
- Generic summaries with no specifics
- Bullets with no action verbs
- Outdated or irrelevant skills listed prominently
- Missing dates
- Unprofessional email addresses
- Resume not tailored to the role at all

---

## 6. The Knowledge Base System

### 6.1 Why the Knowledge Base Must Be Profession-Agnostic by Design

We are launching with software engineers. But the system must be architected today so that adding Product Managers tomorrow requires adding a knowledge config file — not rewriting the pipeline.

The mistake to avoid: hardcoding SWE rules into the agents. If the analysis agent has "check for GitHub link" baked into its logic, adding a doctor profession requires modifying that agent. That is the wrong architecture.

The correct architecture: agents receive a `ProfessionKnowledgeBase` config at runtime. They reason against whatever knowledge is injected. Adding a new profession means authoring a new config. The agents don't change.

### 6.2 Knowledge Base Data Structure

Every profession's knowledge lives in one config file. Here is the structure:

```
ProfessionKnowledgeBase {
  professionId: string             // "software_engineer", "product_manager", "doctor"
  displayName: string              // "Software Engineer"
  aliases: string[]                // ["SWE", "developer", "programmer", "coder", "engineer"]
                                   // used to auto-detect profession from resume content

  careerLevels: CareerLevel[]      // ordered from entry to senior
    CareerLevel {
      id: string                   // "new_grad", "junior", "mid", "senior", "staff"
      label: string                // "New Graduate / No Experience"
      experienceRange: string      // "0 years" | "0-2 years" | "2-5 years" etc.
      detectionHints: string[]     // how to identify: ["no work experience", "student", "bootcamp"]

      requiredSections: string[]   // section types that MUST be present
      recommendedSections: string[]
      optionalSections: string[]
      irrelevantSections: string[] // sections to flag as not needed for this level

      resumeLength: {
        target: number             // target pages
        maximum: number            // hard max pages
      }

      sectionWeights: {            // how heavily each section is weighted in scoring
        [sectionType: string]: number  // 0.0 to 1.0
      }
    }

  sectionStandards: {
    [sectionType: string]: SectionStandard
      SectionStandard {
        bulletFormula: string      // "Action Verb + What You Did + Measurable Outcome"
        bulletCountRange: [min, max]
        requiredElements: string[] // e.g., ["company", "title", "dates", "bullets"]
        forbiddenPatterns: string[] // e.g., ["responsible for", "worked on"]
        qualityIndicators: string[] // e.g., ["has metric", "has action verb", "has outcome"]
      }
  }

  atsRules: AtsRule[]              // ATS formatting rules specific to this profession
    AtsRule {
      id: string
      description: string
      severity: "high" | "medium" | "low"
      check: string                // describes what to check (code implements it)
      userMessage: string          // shown to user if violated
    }

  actionVerbs: {
    strong: string[]               // encouraged action verbs
    weak: string[]                 // flagged and replaced
  }

  metricPatterns: string[]         // regex-describable patterns that signal impact

  redFlags: RedFlag[]              // auto-flagged issues
    RedFlag {
      id: string
      pattern: string              // what to detect
      severity: "high" | "medium" | "low"
      userMessage: string
      suggestion: string
    }

  skillCategories: {               // how skills are grouped in this profession
    [categoryName: string]: {
      examples: string[]
      atsWeight: number
    }
  }

  keyRecruiterSignals: string[]    // what recruiters in this field look for first

  commonJobTitles: string[]        // used to detect profession from resume
  commonKeywords: string[]         // common JD keywords for this profession

  learningResources: {             // used by suggest_learning_path tool
    [skillName: string]: LearningPath
      LearningPath {
        courses: string[]
        projects: string[]
        timeline: string
        resumeBulletExample: string
      }
  }
}
```

### 6.3 How the Knowledge Base Is Loaded at Runtime

The system resolves which knowledge base to use in this order:

```
1. User explicitly selects profession in onboarding → use that knowledge base
2. Profession auto-detected from resume content:
   - Match resume text against each profession's commonJobTitles + aliases
   - Match section structure (e.g., "Publications" section → likely academic/medical)
   - Highest-confidence match wins
3. No profession matched → use GENERIC knowledge base (see Section 10.10)
```

Once resolved, the profession ID is stored in the analysis record. All downstream agents receive the corresponding `ProfessionKnowledgeBase` object injected into their system prompt.

### 6.4 The GENERIC Knowledge Base (Fallback)

When no profession matches, the GENERIC knowledge base applies universal resume best practices:

- Requires: Contact, at least one section with content, readable format
- Evaluates: Bullet quality (action verbs, metrics), section organization, ATS formatting
- Does NOT apply: Profession-specific section requirements, field-specific keywords
- Scoring: Adjusted downward to reflect that we cannot give full profession-specific guidance
- User message: "We don't have specific knowledge for your profession yet. Here is a general analysis. [Request your profession →]" — links to a form where users can request a profession. We use this data to prioritize expansion.

### 6.5 Knowledge Bases Shipped at Launch

|Profession ID|Status|Notes|
|---|---|---|
|`software_engineer`|Full — complete knowledge base|v1 launch|
|`generic`|Partial — universal rules only|Fallback for all unmatched professions|

### 6.6 Adding a New Profession (Future)

Adding Product Manager support requires:

1. Author `product_manager.knowledge.ts` using the `ProfessionKnowledgeBase` schema
2. Add profession aliases and detection hints
3. Define career levels, section standards, action verbs, red flags
4. Add to the profession registry
5. No agent code changes. No pipeline changes. Knowledge only.

This is a content authoring task, not an engineering task. That is the architecture goal.

---

## 7. Product Overview

### 7.1 The Core Product Loop

```
UPLOAD → VALIDATE → EXTRACT → ANALYZE → TAILOR → EDIT → DOWNLOAD
```

Every step in this loop is either intelligent (AI-powered) or deterministic (code-powered). Nothing is guessed.

### 7.2 Feature Set — Version 1

**Step 1: Upload**

- User uploads their resume PDF
- System immediately validates the document before doing anything else
- Instant feedback if the document is not a resume or cannot be processed

**Step 2: Intelligent Extraction**

- AI reads the resume and extracts every section dynamically
- No fixed schema — whatever sections exist in the resume are preserved
- Four output shapes: experience entries, text, list, and raw (see Section 8 for full shape definitions)
- Contact information extracted separately with validation

**Step 3: Resume Health Check**

- Before full analysis, show user a health snapshot
- What sections are present vs missing for their career level
- Content quality at a glance (bullet quality, section length, ATS format issues)
- User can see immediately what needs work before even pasting a job description

**Step 4: ATS Analysis (with or without job description)**

- Without JD: score against SWE ATS standards for detected career level
- With JD: deterministic keyword matching against the specific job description
- Every gap is explained — not a score, a specific issue with a specific fix

**Step 5: AI Tailoring (with job description)**

- Per-bullet rewrite suggestions with rationale
- Honest gap classification: REWRITTEN vs REFRAMED vs MISSING (never fabricated)
- Skill suggestions: only skills the user already has but didn't mention
- Missing skills get learning path recommendations, not fake entries

**Step 6: Live Editor**

- Split-pane: editing panel on left, live preview on right
- Structured form editors per section type (not a generic text box)
- Per-bullet accept/reject for AI rewrites
- User edits override everything — user's final decision is always respected
- Real-time preview updates on every change
- Template switching without losing edits

**Step 7: PDF Download**

- Clean, ATS-compatible PDF
- Consistent app font (no mixed fonts from original)
- User's complete resume — every section preserved
- WYSIWYG — what they see in preview is what they get in PDF

### 7.3 What Makes Each Step Different From Competitors

|Feature|Rezi|Jobscan|Resume Worded|Resumetra|
|---|---|---|---|---|
|Profession-specific analysis|No|No|No|Yes — SWE knowledge base|
|Dynamic section extraction|No|No|No|Yes — no data loss|
|Deterministic ATS scoring|Partial|Yes|Partial|Yes|
|Honest gap classification|No|No|No|Yes|
|Per-bullet accept/reject|No|No|No|Yes|
|User edits always respected|N/A|N/A|N/A|Yes — user is final authority|
|Learning paths for missing skills|No|No|No|Yes|
|Zero-experience support|No|No|No|Yes — Build Mode|
|Live split-pane preview|No|No|No|Yes|
|Full content preservation|No|No|No|Yes|
|WYSIWYG export|N/A|N/A|N/A|Yes|
|Extensible profession knowledge base|No|No|No|Yes|

---

## 8. The AI Pipeline — High Level

### 7.1 Architecture Philosophy

**Three principles that govern every AI decision in this pipeline:**

1. **AI decides what, code verifies how.** AI extracts content and generates suggestions. Code validates structure, computes metrics, and enforces constraints. We never let AI produce a number (score, word count, keyword match percentage) without verifying it in code.
    
2. **Per-item granularity.** We never process the entire resume as one blob. Each section is extracted individually. Each bullet is evaluated individually. Each rewrite targets a specific item. This means one failure does not break everything, and users see diffs at the item level.
    
3. **Tool calls over prompt dumps.** Instead of one massive prompt that returns one massive JSON, agents call specific tools with specific schemas. Each tool call is validated immediately. One bad tool call is retried. The whole pipeline is observable.
    

### 7.2 The Five Stages

**Stage 0: Document Validation (before anything else)**

Purpose: Reject bad inputs immediately with clear, helpful messages.

What it checks:

- Is this a resume? (has name, contact, at least one work/education section)
- Is the text extractable? (not a scanned image, not encrypted, not corrupted)
- Is the length reasonable? (more than 4 pages = not a resume — a resume is never 5+ pages regardless of seniority)
- Is there sufficient content to analyze? (minimum viable threshold)
- Is the language English? (v1 is English-only)

Outcomes:

- VALID → proceed to Stage 1
- NOT_A_RESUME → "This looks like [what we found]. Please upload your resume."
- SCANNED_IMAGE → "Your PDF is scanned. Please upload a text-based PDF."
- TOO_LONG → "This document is X pages. Resumes are 1-2 pages (4 maximum). Please upload just your resume."
- INSUFFICIENT_CONTENT → "Your resume has very little content. Here is what is missing."
- CORRUPT → "We could not read this file. Please re-save as PDF and try again."

**Pain point solved**: Currently the system crashes or produces garbage on bad inputs. Users see a generic error and don't know what to fix.

---

**Stage 1: Extraction Agent**

Purpose: Pull every section out of the resume without losing anything.

How it works:

- Agent reads the full resume text
    
- Calls a detect_sections tool first — finds all section headers and their boundaries
    
- Calls extract_contact once — structured contact info extraction
    
- Calls extract_section once per detected section — each section extracted individually
    
- Each section maps to one of four shapes. The shapes are defined by us in the system prompt with explicit examples:
    
    - **Experience shape**: heading (company/project) + subheading (title/role) + dateRange + bullets[] Used for: Work Experience, Projects, Volunteer Work, Research, Internships, Freelance
        
    - **Text shape**: title + content (plain paragraph, multiple paragraphs allowed) Used for: Professional Summary, Objective, Profile, Personal Statement, Cover Note
        
    - **List shape**: title + items[] (flat list of strings) Used for: Technical Skills, Languages, Interests, Certifications (when brief), Awards (when brief)
        
    - **Table shape**: title + rows[] where each row is key-value pairs Used for: Certifications with issuers and dates, Education with multiple fields (institution, degree, GPA, year), Training records Example row: { institution: "MIT", degree: "BSc", field: "Computer Science", year: "2022", gpa: "3.8" }
        
    - **Raw shape** (fallback): title + rawText (unparsed string) Used for: Any section that does not fit the above shapes, or where extraction confidence is low This is always a fallback — never the intended shape. Displayed in the editor as a Custom section the user edits manually.
        

**Are there sections that don't fit any of these four shapes?** Yes, occasionally. Here is how we handle each:

- **Mixed sections** (e.g., a section that has both narrative paragraphs and bullet lists): Extract as Experience shape if bullets dominate. If paragraphs dominate, use Text shape and preserve bullets as line-separated content within the text. The editor will display these in a text area.
    
- **Nested experience** (e.g., a company with multiple roles at different dates): Flatten into multiple Experience items under the same section, each with its own heading/subheading/dateRange. We do not support nested entries — they complicate the editor and the PDF template.
    
- **Visual-only content** (icons, logos, decorative separators): Ignored entirely. We extract text. Visual decoration is stripped at PDF extraction time and does not make it into the data model.
    
- **Sidebar content in two-column resumes**: pdfjs extracts text in reading order, which for two-column layouts may interleave left and right column content. The Extraction Agent's detect_sections tool is specifically prompted to handle out-of-order text resulting from column extraction, grouping content by semantic section rather than physical position.
    
- AI decides which shape fits each section. The shapes are defined by us in the system prompt with examples.
    
- If a section fails to extract cleanly, it falls back to raw text — never dropped
    

Error handling:

- Individual section failure → mark as raw text, continue pipeline
- Contact extraction failure → flag fields as missing, continue pipeline
- After extraction, show user a confirmation: "We found these N sections. Anything missing?"

**Pain point solved**: Fixed schema dropped volunteer work, certifications, training, awards, languages, custom sections. Dynamic extraction keeps everything.

---

**Stage 2: Deterministic Metrics (no AI)**

Purpose: Compute objective measurements in code so they are accurate and explainable.

**Why no AI here — explained plainly**: AI language models are probabilistic. Ask an AI "how many words are in this text?" and it might say 47 when the real answer is 52. This is not a flaw — it is how LLMs work. They predict likely tokens, not exact counts. For any number we show the user (ATS score, word count, keyword match percentage), the user must be able to trust it. If it changes every time they run it, they stop trusting the tool. Code gives the same answer every time.

**What code computes and exactly how:**

Word count per section and total:

- Split text by whitespace, count tokens. Strip punctuation before counting. This matches how ATS systems count words.

Bullet count per role:

- Count list items detected during extraction. Cross-reference against the items[] array in the Experience shape. Each item in bullets[] is one bullet.

Average bullet length in words:

- Sum word counts of all bullets in a section, divide by bullet count. Flag if average is under 6 words (too short, no context) or over 35 words (too long, hard to scan).

Action verb presence per bullet:

- Take the first word of each bullet. Normalize to lowercase. Check against the `actionVerbs.strong[]` and `actionVerbs.weak[]` arrays from the loaded ProfessionKnowledgeBase. No AI needed — it is a dictionary lookup.

Metric presence per bullet:

- Run regex patterns against each bullet text. Patterns check for: numbers (\d+), percentages (\d+%), currency ($\d+, £\d+), multipliers (\d+x), time periods (\d+ months, \d+ weeks), scale terms (K, M, billion). If any pattern matches, bullet is marked as having a metric.

Section coverage against profession standards:

- Load requiredSections[], recommendedSections[] from the active ProfessionKnowledgeBase for the detected career level. Compare against extracted section types. Missing required sections = HIGH severity. Missing recommended sections = MEDIUM severity.

Career level detection:

- Find all dateRange fields across Work Experience sections. Parse start and end years. Sum total months of professional experience. Map to career level thresholds defined in the ProfessionKnowledgeBase (e.g., 0 months = new_grad, 1-24 months = junior, 25-60 months = mid, etc.). If no work experience found, detect by education status ("currently enrolled", "expected graduation" in text) → new_grad level.

ATS formatting checks (code reads the raw PDF structure via pdfjs):

- Tables detected: pdfjs returns text extraction with position data. If multiple text elements share the same Y coordinate in columns, flag as potential table layout.
- Columns detected: if text elements cluster into two distinct X-coordinate ranges across multiple pages, flag as two-column layout.
- Header/footer content: pdfjs reports page margins. Text above the top margin threshold or below the bottom margin threshold is header/footer. If meaningful text (name, contact) is found only in header/footer, flag it.
- Decorative bullets: check first character of extracted list items against a set of known problematic unicode characters (❖, ★, ➤, etc.). Standard bullets (•, -, *) are fine.

Keyword frequency in resume text:

- Tokenize full resume text. Normalize (lowercase, strip punctuation, stem optional). Count frequency of each unique token. This produces a keyword frequency map used downstream by ATS matching.

**If job description is provided:**

JD keyword extraction:

- The JD text is sent to a small, focused AI tool call: extract_jd_keywords. This is the one place AI is used in Stage 2 — because understanding which words in a JD are requirements vs boilerplate requires semantic understanding. The prompt: "Extract technical skills, tools, frameworks, and professional requirements from this job description. Return as a flat list. Ignore compensation, culture, and legal text."
- The returned list is then used purely as a lookup table — no more AI in this stage.

Exact keyword matching:

- Normalize both the JD keyword list and the resume keyword frequency map (lowercase, strip punctuation).
- For each JD keyword: check if it exists in the resume keyword map. If yes: matched. If no: missing.

Partial matching:

- For each unmatched JD keyword: compute trigram similarity against all resume keywords. If any pair has similarity ≥ 0.8, mark as partial match. This catches "Typescript" vs "TypeScript", "postgres" vs "PostgreSQL", "k8s" vs "Kubernetes".

Match score calculation (pure code):

```
exactMatchScore    = matchedKeywords.length / jdKeywords.length * 100
partialMatchScore  = partialMatches.length / jdKeywords.length * 50  (weighted half)
sectionCoverage    = coveredRequiredSections / requiredSections.length * 100
formattingScore    = 100 - (formattingIssues.length * 15)  (capped at 0)

atsScore = (exactMatchScore * 0.5) + (partialMatchScore * 0.2) + (sectionCoverage * 0.2) + (formattingScore * 0.1)
```

Every number in the final ATS score traces back to a specific keyword, section, or formatting check. The user can see exactly why they scored what they scored.

---

**Stage 3: Analysis Agent**

Purpose: Evaluate quality — the things code cannot judge.

What AI evaluates (grounded by Stage 2 data):

- Impact framing: does the bullet show a result, or just an activity?
- Career progression: is there visible growth between roles?
- Relevance: given the target role, how relevant is each section?
- Readability: is the language clear and professional?
- Consistency: are tenses consistent? Is formatting consistent?

Tools the agent calls:

- score_section: given a section and deterministic metrics, rate content quality
- flag_issue: given a specific item, identify a specific problem with a specific suggestion
- assess_readability: evaluate the overall document language

Key constraint: Analysis Agent receives the Stage 2 metrics. It does not recompute them. It uses them as ground truth and reasons on top of them.

---

**Stage 4: Tailor Agent (separate pipeline, triggered by JD)**

Purpose: Improve the resume specifically for a target job description.

How honest tailoring works (see Section 9 for full detail):

The agent receives:

- The extracted ResumeDocument from Stage 1
- The JD keyword report from Stage 2
- The analysis issues from Stage 3

The agent calls tools per item:

- rewrite_bullet: rewrites one bullet with JD keywords + honesty constraints
- rewrite_summary: rewrites summary for target role
- suggest_skill_addition: surfaces skills already implied by experience but not listed
- flag_redundancy: identifies bullets that are weak or irrelevant given the target JD
- suggest_learning_path: for genuinely missing skills, recommends how to build them

Output: A list of Rewrite objects, each targeting a specific section + item + field, with before, after, rationale, keywords added, and a gap classification (REWRITTEN / REFRAMED / MISSING).

---

**Stage 5: Merge and Persist**

Purpose: Combine all pipeline outputs and save to database.

What gets saved:

- The full ResumeDocument (all sections)
- All deterministic metrics
- All analysis issues and scores
- All tailor rewrites (with accepted/rejected state, defaulting to pending)
- Pipeline version (for backward compatibility as we iterate)

What gets sent to the client:

- Full ResumeDocument
- Health check summary
- ATS report
- Issue list (ordered by severity)
- Rewrite list (if tailoring was run)

---

### 7.3 SSE Events (Progress Streaming)

The pipeline takes time. Users must see progress, not a loading spinner.

```
"validating"         → Checking document...
"extracting:summary" → Reading Summary...
"extracting:experience" → Reading Work Experience...
"extracting:N"       → Reading [section name]...
"computing_metrics"  → Running ATS analysis...
"analyzing:experience" → Analyzing Work Experience...
"analyzing:N"        → Analyzing [section name]...
"tailoring:N"        → Improving bullet N of M...
"complete"           → Done.
```

Each event corresponds to a real operation completing. Users see the AI working section by section.

---

## 9. Honest Tailoring — The Core Differentiator

### 8.1 The Problem With Every Other Tool

Every AI resume tool today does the same thing: take the job description, take the resume, and rewrite the resume to include as many JD keywords as possible. The result is a resume that might pass ATS but does not reflect reality.

Engineers then get into technical interviews and are asked about skills and experiences that were inflated or fabricated. They fail. They blame the tool — rightfully.

This approach also creates a broader harm: it floods companies with resumes that misrepresent candidates, which wastes everyone's time and degrades trust in AI tools generally.

We do not do this.

### 8.2 The Three-Bucket Classification

Before rewriting anything, the Tailor Agent classifies every gap between the resume and the JD into one of three buckets:

**Bucket 1: HAVE IT, NOT SHOWING IT** The user has this skill or experience. It is present in their resume but worded poorly, or it is implied by their experience but not explicitly stated.

What we do: Rewrite to surface it clearly with the right keywords.

Example:

- JD requires: "Stakeholder management"
- User has: "coordinated with product and design teams on sprint planning"
- Our rewrite: "Managed cross-functional stakeholder relationships across product and design, coordinating sprint planning and feature prioritization"
- Label in UI: ✅ REWRITTEN — surfaced from your existing experience

**Bucket 2: PARTIALLY HAVE IT (Adjacent Experience)** The user has done something related but not exactly what the JD describes. An honest reframe is possible but the user should be aware it is a stretch.

What we do: Reframe existing experience honestly. Show the user exactly what we are doing and why. Make them aware this is an honest stretch, not a direct match.

Example:

- JD requires: "Team leadership, managing engineers"
- User has: "mentored 2 junior developers on React best practices"
- Our rewrite: "Provided technical mentorship to 2 junior engineers, guiding code reviews and architectural decisions"
- Label in UI: ⚠️ REFRAMED — honest reframe of your mentoring experience. Note: this positions you as having led, which you can speak to in interviews through your mentoring context.

**Bucket 3: GENUINELY DON'T HAVE IT** The user has no meaningful experience in this area. No honest rewrite is possible.

What we do: Do NOT rewrite. Tell the user explicitly. Give them a learning path.

Example:

- JD requires: "Kubernetes, container orchestration"
- User has: Docker mentioned, no Kubernetes
- What we show: ❌ MISSING — This job requires Kubernetes experience you don't currently have. We have not added this to your resume.
    - Recommended path: Kubernetes for Developers (Linux Foundation course, ~20 hours)
    - Project to add: Deploy a personal project to a local k3s cluster. Document in a GitHub repo.
    - Realistic timeline: 4-6 weeks of part-time study
    - Once you have hands-on experience, return here and we will add it to your resume honestly.

### 8.3 Why This Wins

This approach makes us the only trustworthy tool in the market. The short-term cost is that we cannot add every JD keyword to every resume. The long-term gain is:

- Users trust us because we respect their integrity
- Users get actual help: learning paths are genuinely useful
- Users who follow the learning paths come back with better resumes
- Word of mouth: "This is the only tool that told me the truth" is a powerful testimonial
- We avoid the credibility collapse that happens when AI-fabricated resumes fail in interviews

### 8.4 The Learning Path System

For every MISSING skill, the Tailor Agent calls suggest_learning_path with the skill name and the user's current tech stack as context. The output includes:

- Recommended course or resource (free preferred, paid noted)
- Recommended project to build to demonstrate the skill
- Realistic timeline estimate
- Which section of the resume to add it to once complete
- Example bullet to aim for once they have the experience

This is not just a rejection. It is a roadmap. Users who are told "you're missing X, here's how to get X in 6 weeks" will come back in 6 weeks. That is retention and long-term value.

---

## 9. Edge Cases and How We Handle Them

### 9.1 Bad Input Documents

|Input Type|Detection Method|Response to User|
|---|---|---|
|Not a resume|Stage 0: missing name, no professional sections|"This doesn't look like a resume. We found [X]. Please upload your resume."|
|Scanned image PDF|Stage 0: text extraction yields <50 characters per page|"Your PDF is a scanned image. Upload a text-based PDF or paste your resume text directly."|
|Encrypted/password PDF|Stage 0: extraction fails entirely|"This PDF is password-protected. Remove the password and re-upload."|
|Corrupted file|Stage 0: file cannot be parsed|"We could not read this file. Try re-saving as PDF from your word processor and uploading again."|
|>4 pages|Stage 0: page count check|"This document is X pages. Resumes should be 1-2 pages. If you are a very senior professional, 4 pages is the absolute maximum. Please upload just your resume."|
|Book or long document|Stage 0: page count + content type check|Same as above|
|Non-English resume|Stage 0: language detection|"Resumetra currently supports English resumes only. Multi-language support is coming."|
|Empty PDF|Stage 0: near-zero text|"Your PDF appears to be empty. Please check the file and re-upload."|

### 9.2 Thin or Incomplete Resumes

A resume is "thin" if it passes validation but has insufficient content to be competitive.

**Triggers for thin resume detection:**

- Fewer than 2 work experience entries for a mid or senior engineer
- Work experience with no bullets (dates and titles only)
- No technical skills section
- Projects section with no descriptions
- Total resume under 200 words

**What we do:** Instead of just analyzing and producing a weak score, we enter "Build Mode" — a guided experience that helps the user add content before analysis.

Build Mode shows:

```
Your resume is missing content to be competitive for SWE roles. 
Let us help you build it out.

✅ Contact information — complete
⚠️ Work experience — found but no bullet points. Tell us what you built.
❌ Technical skills — missing. What technologies do you use?
❌ GitHub link — not found. Do you have public repositories?
⚠️ Project details — found project names but no descriptions.

[Complete your resume first →]   [Analyze with what I have →]
```

For "Complete your resume first" — each missing item has a guided natural language input:

"Tell us about your role at [Company]. What did you build, what problem did it solve, who used it, and what was the result?"

User answers in plain English. AI converts it to a properly formatted, ATS-friendly bullet. User approves.

This is a feature no competitor offers. It transforms a thin resume into a complete one before analysis even runs.

### 9.3 Non-Standard Section Names

Engineers from different countries, companies, and backgrounds name sections differently:

- "Professional Background" instead of "Work Experience"
- "Academic Qualifications" instead of "Education"
- "Core Competencies" instead of "Technical Skills"
- "Personal Projects" or "Open Source" instead of "Projects"

**Solution**: The Extraction Agent uses semantic understanding, not string matching. The section title is preserved exactly as-is. The type is determined by content, not title. "Professional Background" extracts as experience-type with heading/subheading/bullets structure. The original title appears in the editor and the PDF.

The user's voice is preserved. Our structure is applied underneath.

### 9.4 Career Gaps

A resume with a gap between jobs is not a red flag by itself. But the way it is presented matters for ATS and for recruiter perception.

**What we detect**: Date ranges that show a gap of more than 3 months between roles.

**What we do**: Flag it gently in the health check, not as an error but as something to be intentional about.

"We noticed a gap between [Company A, end date] and [Company B, start date]. If this was intentional (caregiving, education, health, personal projects), consider adding a brief note or using it as context in your cover letter. Some ATS systems are neutral on gaps, but some recruiters look for them."

We do not penalize the gap in scoring. We surface it so the user can make an informed decision.

### 9.5 Unsupported File Types

Users sometimes upload:

- .docx instead of PDF → we accept this and convert before extraction
- .jpg or .png of a resume → detected as image, prompt to upload PDF
- .txt → accepted, extraction runs on plain text
- Google Docs link → not supported in v1, explain and prompt for PDF export

### 9.6 AI Extraction Failure for One Section

If the Extraction Agent fails to extract one section cleanly (malformed content, ambiguous structure):

- That section is preserved as raw text
- The pipeline continues with all other sections
- In the editor, the failed section is shown as a "Custom" type with its raw content
- User can manually edit it in the editor
- The health check notes: "We had trouble parsing your [section name]. You can edit it directly in the editor."

One bad section does not break the analysis.

### 9.7 The User Does Not Have What the Job Requires

This is the most common and most important edge case. The JD asks for Kubernetes, the user has never touched Kubernetes.

Handled fully in Section 9 (Honest Tailoring). The key principle: never fabricate, always provide a path forward.

### 9.8 Very Long Job Descriptions

Some job postings are 2,000+ words with extensive lists of requirements, nice-to-haves, company culture sections, and legal boilerplate.

**What we do**: JD keyword extraction uses a tool call that is instructed to focus on technical requirements and hard skills only. Culture sections, compensation details, and legal text are ignored. Nice-to-haves are weighted lower than required skills in the ATS match score.

### 9.9 Designed, Colored, Two-Column, or Heavily Formatted Resumes

Many users — especially those who have used Canva, Novoresume, or Enhancv — upload resumes with:

- Two-column layouts (sidebar for contact/skills, main column for experience)
- Custom colors, colored section headers, colored backgrounds
- Decorative icons (phone icon, email icon, LinkedIn icon)
- Custom bullet styles (arrows, diamonds, checkmarks)
- Infographic elements (skill bars, rating circles, timeline graphics)
- Photos or avatar images
- Decorative horizontal rules or borders

**The fundamental truth about these resumes**: They look impressive to humans but perform poorly with ATS systems. Two-column layouts cause ATS to extract text in the wrong order. Skill bars communicate nothing to ATS (a circle showing "80% Python" is meaningless data). Icons are invisible to ATS. Colors and decorations are stripped.

**What we do at extraction**:

- pdfjs extracts all text content regardless of visual design. Colors, icons, and decorative elements are ignored — we get the raw text.
- Two-column text is extracted but may be interleaved. The ExtractionAgent is specifically prompted to handle this: "The following text may be extracted from a two-column layout and may be out of reading order. Group content by semantic section, not by physical proximity."
- Skill bars and rating graphics contain no extractable text. If a user has "Python ●●●●○" in their resume, pdfjs may extract "Python" and some unicode dots, or just "Python". We extract whatever is readable.
- Photos produce no extractable text and are ignored.

**What we tell the user in the health check**: If we detect two-column layout or known ATS-unfriendly patterns, we show a specific flag:

```
⚠️ ATS COMPATIBILITY WARNING
Your resume appears to use a two-column layout and/or decorative formatting.
Many ATS systems cannot read this correctly — your experience and skills may 
not be parsed in the right order, which can cause automatic rejection.

Our exported PDF rebuilds your resume in a clean, ATS-compatible format 
with all your content preserved. This is actually an upgrade, not a downgrade.

[What does ATS-compatible mean? →]
```

**What we do at export**: The exported PDF is always rebuilt clean — no columns, no decorative elements, consistent app fonts and bullets. The user's content is 100% preserved. The visual design is replaced with our professional template. This is not a limitation — it is the product working correctly.

**User objection handling**: Some users are attached to their colorful Canva resume. We handle this in the onboarding and in the editor:

"Your original resume's design has been replaced with a clean, ATS-optimized layout. If you are applying to creative agencies where visual design matters, you may want to keep your original as a second version for those applications. For most tech companies, the clean version performs better."

This is honest. Some users genuinely need the designed version for certain roles. We acknowledge that without abandoning our ATS-first approach.

### 9.10 Unsupported Profession — Generic Fallback

When a user uploads a resume we cannot identify as a software engineer (or any other supported profession), we do not reject them. Rejection is hostile and loses a future customer.

**Detection**: The profession detection in Section 6.3 runs. If confidence is below the threshold for any supported profession — e.g., a doctor uploads a resume with sections like "Clinical Experience", "Research Publications", "Medical Licenses" — no profession match is found.

**What happens**:

1. The full extraction pipeline runs normally. All sections are extracted using the dynamic shape system. Nothing changes there — extraction is profession-agnostic.
    
2. Analysis runs using the GENERIC knowledge base (Section 6.4) — universal resume best practices: action verbs, metric presence, readability, ATS formatting.
    
3. Profession-specific scoring is skipped. We do not penalize a doctor for not having a GitHub link.
    
4. The user sees a clear, respectful message in the health check:
    

```
We noticed your resume is for a profession we don't have specific expertise in yet.

We've given you a general resume analysis covering writing quality, formatting, 
and ATS compatibility. For profession-specific advice tailored to your field, 
we'd love to add it.

[Tell us your profession →]    → links to a short form
[Continue with general analysis →]
```

5. Tailoring still works. The JD keyword matching is deterministic code — it works for any profession. The TailorAgent runs with the GENERIC knowledge base context, which means it focuses on keyword gaps and bullet quality without profession-specific advice.
    
6. PDF export works identically. The resume is rebuilt clean regardless of profession.
    

**What we gain from the "Tell us your profession" form**: Real data on which professions are requesting the tool. When doctors submit 200 times, we know to prioritize the medical knowledge base next. This is our profession expansion roadmap driven by actual demand, not assumption.

---

## 10. The Editor Experience

### 10.1 Philosophy

The editor is not a text editor. It is a structured resume editor. Every section has a form that matches its content type. Work experience has company, title, dates, and bullet inputs — not a single text box. Skills has a tag input. Summary has a text area with a character counter.

This structure matters because:

- The live preview can update instantly (no HTML parsing needed)
- The PDF export is clean and consistent (data flows directly into the template)
- The AI rewrites can target specific items (not just blocks of text)
- Users cannot accidentally break the structure of a section

**The User Is the Final Authority — Always**

This is not just a design principle. It is a rule enforced at every layer of the system.

The editor has three layers of state (from lowest to highest priority):

1. **Source layer**: What the AI extracted from the original resume
2. **Rewrite layer**: What the AI suggested as improvements
3. **User edit layer**: What the user typed or changed

Layer 3 always wins. No AI action can override what the user has typed. Specifically:

- If a user rejects an AI rewrite and types their own version — their version is used. The AI suggestion is dismissed permanently for that item.
- If a user accepts an AI rewrite and then edits it further — the edited version is used. The original AI rewrite is overridden.
- If a user types something that the AI would flag as weak (no metric, passive verb) — we may show a soft suggestion, but we do not block the edit or force a change.
- If a user deletes a section the AI recommends keeping — it is deleted. We may warn once ("This section helps with ATS — are you sure?") but we respect their decision.
- "Reset to original" only resets to the extracted source. It does not re-apply AI rewrites unless the user explicitly does so.

**What we never do**:

- Silently override user text with AI suggestions
- Re-apply a rejected rewrite after the user has dismissed it
- Prevent the user from writing something we think is suboptimal
- Add content to the resume without the user explicitly accepting it

The AI is an advisor. The user is the author.

### 10.2 Split-Pane Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ [Template: Professional ▼]   [Section Order ↕]   [Download PDF] │
├─────────────────────────────┬────────────────────────────────────┤
│                             │                                    │
│   EDITING PANEL             │   LIVE PREVIEW                     │
│                             │                                    │
│   Structured form editors   │   Real-time HTML render of the     │
│   per section type          │   selected template + your data    │
│                             │                                    │
│   AI rewrite suggestions    │   Updates on every keystroke,      │
│   inline per bullet         │   every accept/reject, every       │
│                             │   template switch                  │
│   Accept / Reject per item  │                                    │
│                             │   Exactly what the PDF will look   │
│   Add / Remove bullets      │   like when you download           │
│   Add / Remove entries      │                                    │
│                             │                                    │
└─────────────────────────────┴────────────────────────────────────┘
```

### 10.3 Section Editors by Type

**Experience Sections (Work, Projects, Volunteer)**

Each entry has:

- Heading field (company or project name)
- Subheading field (job title or role)
- Date range field (with smart parsing — "2021-2023" auto-formats)
- Bullet list with per-bullet text inputs
- Add bullet button
- Remove entry button
- Drag handle for reordering entries

Each bullet that has an AI rewrite pending shows:

- The original text (dimmed)
- The AI suggestion below it
- Accept / Reject buttons
- Rationale tooltip ("Why: Adds quantifiable impact. Keywords added: scalable, distributed")

**Text Sections (Summary, Objective)**

- Text area with word count and recommended length indicator
- If AI has a rewrite, shows side-by-side comparison
- User can type freely or accept the AI version

**List Sections (Skills, Certifications, Languages)**

- Tag-style input: user types a skill and presses Enter to add
- Suggested skills from JD analysis appear as chips: [+ Python] [+ Kubernetes]
- Each suggestion is labeled with its gap classification (you mentioned this in your experience / this is new / you don't have this)
- Remove any item with an X

**Custom / Unknown Sections**

- Plain text area
- AI does not make suggestions for unknown sections
- User edits freely

### 10.4 Rewrite Manager (Bulk Actions)

At the top of the editing panel:

```
AI suggested 12 improvements   [Accept All] [Review Each] [Reject All]
[Show only AI changes ▼]  [Reset to original]
```

- Accept All: applies all pending rewrites in one click (with confirmation)
- Review Each: scrolls through rewrites one by one
- Reject All: dismisses all suggestions, keeps original
- Show only AI changes: filter to see only sections with pending rewrites
- Reset to original: undo all accepted rewrites and manual edits, return to extraction output

### 10.5 Template Switching

Two templates in v1:

- **Professional**: Single-column, clean, amber accents, traditional layout. Best for enterprise and established companies.
- **Modern**: Two-column with dark sidebar, tech-forward look. Best for startups and design-aware companies.

Switching template is one click. Same data, completely different visual. The edit state is not lost on switch. The PDF download uses whichever template is currently selected.

### 10.6 Section Reordering

Users can drag sections up and down. Changes reflect in the preview instantly. The PDF respects the order.

Default order (follows original resume structure):

1. Contact
2. Summary
3. Work Experience
4. Education
5. Projects
6. Technical Skills
7. Certifications
8. Everything else in the order found

### 10.7 Live Overflow Indicator

When a user edits a bullet and the text grows very long, a subtle indicator shows:

- Green: fits comfortably
- Amber: getting long, consider trimming
- Red: this bullet is too long for standard resume conventions (over 2 lines)

This is a guide, not a hard limit. The user can override.

---

## 11. PDF Export

### 11.1 What the PDF Must Be

- ATS-compatible: no tables, no columns in body, no headers/footers with content
- Consistent font throughout: Outfit for headings, DM Sans for body — never the original PDF's fonts
- Consistent bullets throughout: our bullet style, not whatever was in the original
- Complete: every section the user has in the editor appears in the PDF
- WYSIWYG: the PDF matches the live preview exactly — no surprises
- Clean: no watermarks in paid plan, subtle watermark in free plan

### 11.2 What We Give Up vs What We Keep

Users sometimes ask: "Can my PDF look exactly like my original?"

The honest answer: No. And here is why that is the right trade-off.

What we give up by rebuilding the PDF:

- The exact original font (replaced with our app font)
- Any graphic design elements, custom layouts, decorative elements
- Photos (if the original had them — not recommended for US/UK market anyway)

What we keep:

- Every word of content
- Every section, in order
- All formatting intent (headings, bullets, bold text)
- ATS compatibility (the original might have had table layouts that break ATS)

What the user gains:

- Guaranteed ATS compatibility
- Consistent, professional appearance
- Font that renders correctly in all PDF viewers
- Clean structure that works with all ATS systems

This is a conversation to have with users explicitly during onboarding. "We will rebuild your resume with a professional layout. Your content is preserved completely."

### 11.3 The Download Flow

1. User clicks "Download PDF"
2. System calls getResolvedDocument() — merges source + accepted rewrites + user edits
3. Passes resolved document into GenericTemplate with selected TemplateConfig
4. @react-pdf/renderer generates the PDF on the client side
5. PDF blob downloads to user's device
6. Toast notification: "Your resume has been downloaded"
7. Editor state is NOT reset — user can edit and download again

---

## 12. Go-To-Market Strategy

### 12.1 Launch Positioning

We launch as: **"The resume tool built for software engineers — not a template builder, not a keyword stuffer. Honest AI that tells you what to fix and how."**

This positioning:

- Immediately filters out the wrong audience (non-engineers)
- Signals to the right audience (engineers) that we understand their world
- Differentiates from every generic competitor
- Sets up the honesty narrative as a brand value from day one

### 12.2 Target Communities for Launch

These are the communities where software engineers talk about job hunting. We need to be genuinely helpful in these spaces before we sell anything.

**Reddit**:

- r/cscareerquestions (3.2M members) — most active SWE job hunting community
- r/ExperiencedDevs — senior engineers, often job hunting after layoffs
- r/cscareerquestionsEU — European market
- r/developersIndia — large and active market

**Hacker News**:

- Show HN post on launch day
- Comment helpfully on job hunting threads before launch

**Dev.to and Hashnode**:

- Write genuinely useful articles: "Why your SWE resume fails ATS and how to fix it"
- "The honest guide to tailoring your resume without lying"
- These rank well in Google for resume-related searches

**LinkedIn**:

- Target engineers who post about job hunting or layoffs
- Publishing articles with real resume teardowns (anonymized)

**Discord**:

- Tech layoff servers
- Coding bootcamp alumni servers
- Language/framework specific servers (Python Discord, Reactiflux, etc.)

### 12.3 Content Strategy (Pre and Post Launch)

Content that earns trust before asking for anything:

**Article: "We analyzed 500 SWE resumes. Here is what separates the ones that get interviews."** Real data, real patterns. Publish on Dev.to and LinkedIn. Link to Resumetra at the end.

**Thread: "How to write a bullet point that actually gets past ATS — with 10 before/after examples"** Twitter/X thread with concrete rewrites. Shareable, saveable, re-postable.

**Interactive: "Is your resume ATS-ready? 10-question checklist"** No sign-up required. Shows value before asking for anything.

**Teardown series: "I analyzed [famous engineer]'s public resume. Here is what I would change."** Use public LinkedIn profiles of engineering leaders (with respect). Demonstrates expertise.

### 12.4 Pricing Model

**Free tier**:

- Upload resume, get health check and ATS analysis
- See issue list (first 3 issues only)
- One tailor run (see rewrites, cannot accept/edit)
- Cannot download PDF

**Pro tier ($19/month or $149/year)**:

- Full analysis, all issues visible
- Unlimited tailor runs
- Full editor with accept/reject
- PDF download (no watermark)
- Resume history (access previous analyses)
- Cover letter generation (future feature)

**Why this pricing**:

- Free tier shows enough value to convert
- $19/month is below Jobscan ($49) and comparable to Rezi ($29)
- Annual at $149 = $12.40/month — strong incentive to commit
- Most job hunters are active for 2-3 months — monthly is fine for them
- Engineers getting a job offer off one improved resume will gladly pay $19

### 12.5 The Honesty Brand Play

Our most powerful marketing asset is that we tell the truth.

Users who use every other tool and get ghosted in interviews will find us and feel relief. "Finally a tool that didn't lie to me."

We should actively encourage users to share their experience:

- "Did Resumetra help you land an interview? Tell us. We will share your story (anonymized)."
- Collect these testimonials. Use them in marketing.
- The specific testimonial we want: "I used [Competitor] and it added skills I didn't have. I got embarrassed in the interview. Resumetra was the first tool that told me what I actually needed to work on."

---

## 13. Phased Roadmap

### Phase 0: Pre-Build (1-2 weeks)

**Goal**: Lay the foundation. No user-facing features yet.

Steps:

1. Define all data types: ResumeDocument, DynamicSection, SectionItem, Rewrite (shared server/client)
2. Define TemplateConfig schema
3. Create database migration: new tables (resume_sections, resume_tailor_rewrites, resume_ats_keywords) + alter existing tables
4. Set up AI model configuration: confirm paid model (GPT-4o or Claude 3.5 Sonnet) — tool calling required
5. Define all agent tool schemas in code (even before building the agents)
6. Write the SWE resume standards knowledge base (Section 5 of this document formalized as a config the agents consume)

**Pain point solved**: Undefined types and schemas cause cascading bugs. Starting with types means every subsequent step has a contract to follow.

---

### Phase 1: Validation + Extraction (2-3 weeks)

**Goal**: Users can upload a resume and get back a complete, structured representation of it.

Steps:

1. Build Stage 0: DocumentValidationAgent with all detection cases and user-facing messages
2. Build Stage 1: ExtractionAgent with detect_sections, extract_contact, extract_section tools
3. Build the three output shapes and their validation schemas
4. Build SSE events for extraction progress
5. Build the section confirmation UI: "We found these N sections — anything missing?"
6. Build the Resume Health Check UI (pre-analysis summary)

Success criteria: Upload a resume with 10 sections including non-standard ones (volunteer, languages, awards). Confirm all 10 sections are extracted and displayed correctly. Upload a scanned PDF. Confirm helpful error message, not a crash.

---

### Phase 2: Analysis + ATS Scoring (2-3 weeks)

**Goal**: Users get accurate, actionable analysis with deterministic scoring.

Steps:

1. Build Stage 2: DeterministicMetrics service (word counts, bullet quality, ATS format checks)
2. Build ATS keyword extraction tool call
3. Build keyword matching algorithm (exact + trigram partial matching)
4. Build Stage 3: AnalysisAgent (score_section, flag_issue tools)
5. Build the Analysis Results UI: issue list ordered by severity, ATS report with matched/missing keywords
6. Build the SWE standards checker: career level detection + section coverage assessment

Success criteria: Run the same resume through old pipeline and new pipeline. New pipeline identifies more issues, all issues have specific locations and specific fixes. ATS match score matches a manual keyword count within 5%.

---

### Phase 3: Honest Tailoring (2-3 weeks)

**Goal**: Per-bullet rewrites with honest gap classification.

Steps:

1. Build Stage 4: TailorAgent with rewrite_bullet, rewrite_summary, suggest_skill_addition, flag_redundancy tools
2. Build honest gap classifier (REWRITTEN / REFRAMED / MISSING logic in the agent system prompt with examples)
3. Build suggest_learning_path tool
4. Build Rewrite data model and persistence (resume_tailor_rewrites table)
5. Update SSE to stream per-bullet progress during tailoring
6. Build the tailor results UI: rewrites with classification badges, learning path cards for MISSING skills

Success criteria: Run tailoring against a JD that has 3 skills the user has, 2 they are adjacent to, and 2 they genuinely lack. Confirm: 3 are REWRITTEN with accurate rewrites, 2 are REFRAMED with honest reframes, 2 are MISSING with learning paths, 0 are fabricated.

---

### Phase 4: Live Editor (3-4 weeks)

**Goal**: Full split-pane editor with structured section editors, per-item accept/reject, and live preview.

Steps:

1. Build useResumeEditorStore with three-layer state (source / rewrites / edits) and getResolvedDocument()
2. Build structured section editor components per type (WorkExperienceEditor, EducationEditor, SkillsEditor, SummaryEditor, CustomSectionEditor)
3. Build RewriteDiff component (pending / accepted / rejected states)
4. Build RewriteManager toolbar (Accept All, Reject All, filter, reset)
5. Build EditorSidebar with section list, AI badge labels, drag reorder
6. Build GenericTemplatePreview (HTML/Tailwind, config-driven, reactive to store)
7. Build split-pane layout with template switcher
8. Build section reordering (drag-and-drop)
9. Build add/remove items (bullets, entries, skills)
10. Wire Build Mode for thin resumes (guided content creation)

Success criteria: Open editor with a tailored resume. Accept 3 rewrites, reject 2, manually edit 1 bullet. Verify preview updates in real time for each action. Switch template. Verify preview changes, editor state unchanged. Reorder sections. Verify preview reflects new order. Add a bullet. Verify it appears in preview.

---

### Phase 5: PDF Export (1-2 weeks)

**Goal**: Download a PDF that matches the preview exactly, is ATS-compatible, and contains all content.

Steps:

1. Build GenericTemplate PDF renderer driven by TemplateConfig + ResumeDocument
2. Convert Professional and Modern template designs to TemplateConfig objects
3. Build font registration (Outfit + DM Sans as base64 embedded — Vite arraybuffer import)
4. Build generatePdf() utility (pdf().toBlob() → URL.createObjectURL() → download)
5. Verify ATS compatibility of output: run generated PDF through Jobscan manually
6. Build free tier watermark / paid tier clean output logic

Success criteria: Download PDF. Open in Adobe Reader — renders correctly. Run through Jobscan — all sections parsed, all keywords detected, no ATS format warnings. Compare to live preview — WYSIWYG confirmed. Upload a complex resume (photo, table layout, two columns) — confirm PDF is rebuilt cleanly without those ATS-unfriendly elements.

---

### Phase 6: Polish and Launch Prep (1-2 weeks)

**Goal**: Production-ready product with onboarding, error states, and marketing site.

Steps:

1. Build onboarding flow: explain what Resumetra does and what it does not do (font replacement, honest tailoring)
2. Build empty states for every major UI state
3. Build error boundaries with recovery actions for every failure mode
4. Build resume history: access previous analyses
5. Confirm all SSE events stream correctly under load
6. Security review: ensure uploaded PDFs are not retained beyond the session (or per privacy policy)
7. Marketing site: landing page with positioning, pricing, and sign-up
8. Write launch content (Hacker News post, Reddit posts, Dev.to article)

---

### Phase 7: Post-Launch (Ongoing)

**Goal**: Iterate based on real user data. Expand toward next profession.

Month 1 post-launch focus:

- Monitor which issues users most commonly find and fix
- Monitor where users drop off in the flow
- Collect testimonials from users who got interviews
- Fix extraction failures on edge-case resume formats

Month 2-3:

- Add cover letter generation (uses the tailored resume + JD as context)
- Add LinkedIn profile optimization (same analysis, different format)
- Evaluate readiness to expand to Product Managers

---

## 15. System and Code Level Architecture

This section translates the product decisions above into concrete system design. It is high-level enough to guide architecture decisions without prescribing implementation detail.

### 15.1 System Topology

```
CLIENT (React + Vite)
  │
  │  HTTPS / SSE
  │
SERVER (Node.js + Express)
  │
  ├── AI Service Layer (tool-calling agents)
  │     └── OpenAI / Anthropic API
  │
  ├── Deterministic Metrics Layer (pure code, no AI)
  │     └── atsScoring.ts, deterministicMetrics.ts
  │
  ├── Knowledge Base Layer (config files, loaded at runtime)
  │     └── software_engineer.knowledge.ts
  │     └── generic.knowledge.ts
  │
  ├── Database Layer (PostgreSQL)
  │     └── resume_analyses, resume_sections,
  │         resume_tailor_rewrites, resume_ats_keywords
  │
  └── File Handling (PDF upload, text extraction)
        └── pdfjs-dist (server-side extraction)
            multer (upload handling)
```

### 15.2 Core Data Types (Shared Server + Client)

These types are defined once in a shared types package and imported on both sides. No duplication, no drift.

```
ResumeDocument
  contact: ContactInfo
  sections: DynamicSection[]
  detectedProfession: string       // profession ID or "generic"
  detectedCareerLevel: string      // career level ID

DynamicSection
  id: string                       // stable UUID, used as foreign key in DB
  type: SectionType                // "experience" | "text" | "list" | "table" | "raw"
  title: string                    // original section title from resume
  displayOrder: number             // order in the original resume
  items: SectionItem[]

SectionItem
  id: string
  heading?: string
  subheading?: string
  dateRange?: string
  description?: string
  bullets?: string[]
  items?: string[]                 // for list-type sections
  rows?: Record<string,string>[]   // for table-type sections
  metadata?: Record<string,string>

Rewrite
  id: string
  sectionId: string
  itemId: string
  field: string                    // "heading" | "subheading" | "bullets[N]" | "content" | "items[N]"
  before: string
  after: string
  rationale: string
  keywordsAdded: string[]
  gapClassification: "REWRITTEN" | "REFRAMED" | "MISSING"
  accepted: boolean | null         // null = pending

DeterministicMetrics
  wordCount: number
  bulletCount: number
  avgBulletWordCount: number
  sectionsPresent: string[]
  sectionsMissing: string[]
  bulletsWithActionVerb: number
  bulletsWithMetric: number
  formattingIssues: FormattingIssue[]
  careerLevelDetected: string
  totalExperienceMonths: number

AtsReport
  matchScore: number               // 0-100
  resumeKeywords: string[]
  jdKeywords: string[]
  matchedKeywords: string[]
  missingKeywords: string[]
  partialMatches: PartialMatch[]
  sectionCoverage: Record<string,boolean>
```

### 15.3 Server File Structure

```
server/src/
  routes/
    api.ts                  # All HTTP endpoints + SSE handlers

  services/
    documentValidator.ts    # Stage 0: validates uploads before pipeline
    extractionAgent.ts      # Stage 1: tool-calling extraction agent
    deterministicMetrics.ts # Stage 2: pure code metrics computation
    atsScoring.ts           # Stage 2: keyword matching + ATS score
    analysisAgent.ts        # Stage 3: quality evaluation agent
    tailorAgent.ts          # Stage 4: honest rewriting agent
    agentOrchestrator.ts    # Chains all stages, emits SSE events

  knowledge/
    registry.ts             # Maps professionId → knowledge base file
    software_engineer.knowledge.ts
    generic.knowledge.ts
    types.ts                # ProfessionKnowledgeBase interface

  types/
    resumeDocument.ts       # All shared types (ResumeDocument, Rewrite, etc.)
    templateConfig.ts       # TemplateConfig interface

  db/
    migrations/
      001_initial_schema.sql
      002_add_resume_sections.sql
      003_add_tailor_rewrites.sql
      004_add_ats_keywords.sql
    queries/
      analyses.ts           # DB query functions for analyses
      sections.ts           # DB query functions for sections
      rewrites.ts           # DB query functions for rewrites

  utils/
    pdfExtractor.ts         # pdfjs-dist text extraction, page count, layout detection
    sseEmitter.ts           # SSE event helper
    professionDetector.ts   # Auto-detects profession from resume content
```

### 15.4 Client File Structure

```
client/src/
  store/
    useStore.ts               # Global store: document, rewrites, atsReport
    useResumeEditorStore.ts   # Editor store: three-layer state + getResolvedDocument()
    useTemplateStore.ts       # Template selection + config

  types/
    resumeDocument.ts         # Mirror of server types (single source if monorepo)
    templateConfig.ts

  services/
    api.ts                    # All API calls + SSE subscription handler

  utils/
    professionDetector.ts     # Client-side display logic for detected profession
    getResolvedDocument.ts    # Merges source + accepted rewrites + user edits

  components/
    upload/
      UploadPanel.tsx
      ValidationFeedback.tsx  # Shows Stage 0 outcome messages

    analysis/
      HealthCheck.tsx         # Section coverage, quick issues summary
      AtsReport.tsx           # Keyword match, score breakdown
      IssueList.tsx           # Ordered list of flagged issues with fixes

    editor/
      ResumeEditorPanel.tsx   # Split-pane container
      EditorSidebar.tsx       # Section list, AI badges, drag reorder
      LivePreview.tsx         # Right pane: GenericTemplatePreview
      RewriteManager.tsx      # Accept All / Reject All toolbar
      RewriteDiff.tsx         # Per-item pending/accepted/rejected states
      BuildMode.tsx           # Guided content creation for thin/zero-exp resumes
      SectionEditor/
        WorkExperienceEditor.tsx
        EducationEditor.tsx
        SkillsEditor.tsx
        SummaryEditor.tsx
        ProjectsEditor.tsx
        CertificationsEditor.tsx
        TableSectionEditor.tsx  # For table-shape sections
        CustomSectionEditor.tsx # For raw-shape sections

    pdf/
      GenericTemplate.tsx         # Config-driven @react-pdf/renderer document
      GenericTemplatePreview.tsx  # Config-driven HTML preview (same data, browser render)
      templates/
        configs/
          professional.config.ts
          modern.config.ts
        templateRegistry.ts       # Maps templateId → TemplateConfig
```

### 15.5 Database Schema Summary

```sql
-- Core analysis record
resume_analyses (
  id UUID PRIMARY KEY,
  user_id UUID,
  original_filename TEXT,
  pipeline_version INTEGER,
  profession_detected TEXT,
  career_level_detected TEXT,
  created_at TIMESTAMPTZ
)

-- Dynamic sections extracted from resume (replaces fixed parsedData tables)
resume_sections (
  id UUID PRIMARY KEY,
  analysis_id UUID REFERENCES resume_analyses,
  section_type TEXT,             -- "experience" | "text" | "list" | "table" | "raw"
  section_title TEXT,            -- original title from resume
  display_order INTEGER,
  section_data JSONB,            -- SectionItem[] as JSON
  created_at TIMESTAMPTZ
)

-- ATS keyword matching results
resume_ats_keywords (
  id UUID PRIMARY KEY,
  analysis_id UUID REFERENCES resume_analyses UNIQUE,
  resume_keywords TEXT[],
  jd_keywords TEXT[],
  matched_keywords TEXT[],
  missing_keywords TEXT[],
  match_score NUMERIC,
  keyword_report JSONB,
  created_at TIMESTAMPTZ
)

-- Per-item tailor rewrites
resume_tailor_rewrites (
  id UUID PRIMARY KEY,
  analysis_id UUID REFERENCES resume_analyses,
  section_id UUID REFERENCES resume_sections,
  item_id TEXT,                  -- SectionItem.id
  field TEXT,                    -- "bullets[0]", "heading", "content" etc.
  before_text TEXT,
  after_text TEXT,
  rationale TEXT,
  keywords_added TEXT[],
  gap_classification TEXT,       -- "REWRITTEN" | "REFRAMED" | "MISSING"
  accepted BOOLEAN DEFAULT NULL, -- null=pending
  created_at TIMESTAMPTZ
)

-- Per-section analysis scores
resume_section_scores (
  id UUID PRIMARY KEY,
  section_id UUID REFERENCES resume_sections,
  content_score NUMERIC,
  impact_score NUMERIC,
  issues JSONB,                  -- Issue[] as JSON
  created_at TIMESTAMPTZ
)
```

### 15.6 Agent Tool Call Contracts

Each tool is a typed function the AI can call. The contract is defined in code and enforced by Zod validation before any data enters the database.

```
ExtractionAgent tools:
  detect_sections(resumeText: string)
    → { sections: Array<{ title: string, textContent: string }> }

  extract_contact(contactText: string)
    → ContactInfo

  extract_section(title: string, text: string, suggestedShape: SectionType)
    → DynamicSection

AnalysisAgent tools:
  score_section(section: DynamicSection, metrics: SectionMetrics, knowledgeBase: ProfessionKnowledgeBase)
    → { contentScore: number, impactScore: number }

  flag_issue(sectionId: string, itemId: string | null, issueType: string, severity: string, description: string, suggestion: string)
    → Issue

TailorAgent tools:
  rewrite_bullet(sectionId: string, itemId: string, bulletIndex: number, original: string, jdKeywords: string[], context: string)
    → Rewrite  (gapClassification must be REWRITTEN | REFRAMED only — MISSING handled separately)

  flag_missing_skill(skillName: string, jdRequirement: string)
    → { skill: string, jdRequirement: string }
    (triggers suggest_learning_path on the server side — AI does not generate the learning path itself)

  suggest_skill_addition(sectionId: string, skill: string, existingEvidence: string)
    → Rewrite  (gapClassification = REWRITTEN — surfacing an existing implicit skill)
```

### 15.7 The Three-Layer Editor State (Code Model)

The editor store manages three independent data structures that merge on read:

```
useResumeEditorStore state:
  sourceDocument: ResumeDocument         // from API, immutable after load
  acceptedRewrites: Map<string, boolean> // rewriteId → accepted (true) or rejected (false)
                                         // absent = pending
  userEdits: Map<string, string>         // "{sectionId}:{itemId}:{field}" → edited value

getResolvedDocument(): ResumeDocument
  For each section in sourceDocument:
    For each item in section.items:
      For each field in item:
        key = "{sectionId}:{itemId}:{field}"
        1. If userEdits.has(key) → use userEdits.get(key)           // Layer 3 wins
        2. Else if acceptedRewrite exists for this field → use rewrite.after  // Layer 2
        3. Else → use sourceDocument value                           // Layer 1 baseline
  Return merged ResumeDocument
```

This function is called every time any of the three layers change. It is memoized — only recomputes when its inputs change. The output flows into both the live preview and the PDF export. One function, two consumers, one source of truth.

### 15.8 SSE Architecture

Server-Sent Events stream pipeline progress to the client in real time. The client never polls.

```
Server side (agentOrchestrator.ts):
  emit("validating")
  emit("extracting", { sectionName: "Work Experience", index: 2, total: 8 })
  emit("computing_metrics")
  emit("analyzing", { sectionName: "Work Experience" })
  emit("tailoring_bullet", { bulletIndex: 3, sectionName: "Work Experience", total: 12 })
  emit("complete", { document, metrics, atsReport, rewrites })
  emit("error", { stage: "extraction", message: "...", recoverable: true })

Client side (api.ts):
  const es = new EventSource('/api/analyze?resumeId=...')
  es.on("extracting", (data) => updateProgress(data))
  es.on("complete", (data) => {
    useStore.setDocument(data.document)
    useStore.setRewrites(data.rewrites)
    useStore.setAtsReport(data.atsReport)
    es.close()
  })
  es.on("error", (data) => handleError(data))
```

### 15.9 Profession Detection Algorithm (Code)

```
function detectProfession(resumeDocument: ResumeDocument): { professionId: string, confidence: number }

1. Load all profession knowledge bases from registry
2. For each profession in registry:
   a. Score job title match:
      - Find most recent work experience entry
      - Compare heading (job title) against profession.commonJobTitles[]
      - Exact match = 1.0, partial match = 0.5
   b. Score alias match:
      - Tokenize full resume text
      - Count tokens that appear in profession.aliases[]
      - Score = matchCount / aliases.length
   c. Score section structure match:
      - Check which section titles appear in resume
      - Compare against expected sections for this profession
      - Score = matchedExpected / totalExpected
   d. Combined score = (titleScore * 0.5) + (aliasScore * 0.3) + (structureScore * 0.2)

3. Sort professions by score descending
4. If highest score >= 0.7 → use that profession
5. If highest score < 0.7 → use "generic"
6. Return { professionId, confidence: highestScore }
```

### 15.10 Key Engineering Constraints

These are non-negotiable technical constraints that every implementation decision must respect:

**Constraint 1: One AI model call per tool call, validated immediately.** No batching of tool outputs into a single unparsed blob. Each tool call result is validated against its Zod schema before being used. If validation fails, that specific tool call is retried (max 2 retries) with a corrected prompt. Not the entire pipeline.

**Constraint 2: All numbers that users see come from code, not AI.** Word counts, ATS scores, keyword counts, match percentages — all deterministic code. The only AI involvement in Stage 2 is JD keyword extraction, which returns a list that is then processed entirely in code.

**Constraint 3: User edit layer is never overwritten by AI.** Once a user edits a field, that field is locked from AI modification. The `userEdits` map is only written to by user interaction handlers. The AI cannot write to it.

**Constraint 4: No section is ever dropped.** If extraction of a section fails, it becomes a raw-shape section. The pipeline always continues. The user always gets back everything in their original resume.

**Constraint 5: The PDF and the preview share one data source.** `getResolvedDocument()` is called once. Its output goes into both `GenericTemplatePreview` (HTML browser render) and `GenericTemplate` (pdf/renderer export). They receive identical data. WYSIWYG is guaranteed by shared data source, not by visual comparison.

**Constraint 6: Knowledge base is injected, not hardcoded.** No agent file contains SWE-specific rules in its code. Rules come from the loaded `ProfessionKnowledgeBase` object passed into the agent's system prompt at runtime. Adding a new profession requires a new knowledge file only — zero agent code changes.

---

## 16. Success Metrics

### Product Metrics (What We Track)

**Activation**: Percentage of users who complete the full loop (upload → analyze → tailor → download). Target: >40% in first 30 days.

**Extraction quality**: Percentage of resumes where all sections are extracted correctly. Target: >95%. Monitored via the section confirmation step — if users report missing sections, we log it.

**Tailoring honesty rate**: Percentage of rewrites that are REWRITTEN or REFRAMED (not MISSING and not fabricated). Target: >80% of rewrites are REWRITTEN or REFRAMED, meaning the user had enough experience to improve honestly.

**User acceptance rate**: Percentage of AI-suggested rewrites that users accept. Target: >60%. If acceptance rate is low, our rewrites are not useful or not trusted.

**Download rate**: Percentage of users who download a PDF. Target: >50% of paying users per session.

**Conversion rate**: Percentage of free users who upgrade to paid. Target: >8% within 14 days of sign-up.

**Retention**: Percentage of paid users who renew. Target: >60% monthly retention.

### Business Metrics (What We Target)

- Month 1: 100 paying users
- Month 3: 500 paying users
- Month 6: 2,000 paying users
- Month 12: 8,000 paying users

At $19/month average, 8,000 users = $152,000 MRR. That is a real SaaS business.

### The Metric That Matters Most

**Interviews generated per resume tailored.** This is the ultimate proof that the product works. We should track this via follow-up (optional user report): "Did you get an interview after using this tailored resume?"

If users report yes, that is the testimonial engine. If they report no, we need to understand why and improve.

---

## 17. What We Will Not Build Yet

These are deliberate deferrals. They are good ideas. They are not Phase 1 priorities.

**Multi-language support** — v1 is English only. Adds significant extraction and analysis complexity.

**LinkedIn profile optimization** — valuable, but a different product. Post Phase 1.

**Cover letter generation** — natural extension. Phase 7 or later.

**Mobile-native editor** — the editor is desktop-first. A proper mobile editor requires a different UX design. Post-launch.

**Multiple professions** — we are Software Engineers only until we have product-market fit and a full team to expand the knowledge base responsibly.

**Enterprise / recruiter tools** — different buyer, different sales motion. Post Phase 1.

**Interview preparation** — a completely different product. Natural extension but not v1.

**Resume from scratch (no upload)** — some users have no resume to start from. This is a valid use case but Build Mode (for thin resumes) covers the most urgent version of it. Full from-scratch creation is later.

**Integration with job boards** — auto-apply, job tracking, ATS submission. Powerful but far out of scope for v1.

---

## Appendix: Reference Materials

### A. ATS Systems Used by Tech Companies

|ATS|Companies That Use It|Known Parsing Notes|
|---|---|---|
|Greenhouse|Stripe, Airbnb, Figma, Notion, many startups|Good PDF parsing, handles most formats|
|Lever|Shopify, Dropbox, Reddit, many scaleups|Good PDF parsing|
|Workday|Microsoft, Amazon, large enterprises|Known issues with tables and columns|
|iCIMS|Large enterprises, finance-adjacent tech|More conservative parser|
|Taleo|Oracle, IBM, large traditional enterprises|Oldest, most restrictive parser|
|Ashby|Modern startups|Most permissive, good parsing|

**Implication for our PDF export**: Target Workday-compatibility as the strictest standard. If it passes Workday, it passes everything.

### B. Strong Action Verbs for SWE Resumes

Grouped by the type of impact they signal:

**Architecture / Technical Leadership**: Architected, Designed, Engineered, Spearheaded, Established, Pioneered

**Building / Shipping**: Built, Developed, Implemented, Launched, Shipped, Deployed, Released

**Improvement / Optimization**: Optimized, Improved, Reduced, Eliminated, Accelerated, Enhanced, Streamlined

**Scale / Growth**: Scaled, Expanded, Extended, Grew, Increased

**Team / Collaboration**: Led, Mentored, Collaborated, Coordinated, Partnered

**Problem-solving**: Resolved, Debugged, Diagnosed, Refactored, Migrated, Modernized

**Weak verbs to flag and replace**: Worked on, Assisted with, Helped, Was responsible for, Contributed to, Participated in

### C. Metric Patterns to Detect and Encourage

Our bullet quality checker looks for these patterns. If none are present, it flags the bullet for improvement.

- Percentages: "reduced by 40%", "improved by 3x"
- User counts: "10K daily active users", "serving 2M customers"
- Time: "reduced from 800ms to 120ms", "shipped in 2 weeks"
- Team size: "led team of 5 engineers"
- Money: "reduced infrastructure cost by $50K/month"
- Scale: "processed 1M transactions per day"
- Code metrics: "reduced bundle size by 60%", "achieved 95% test coverage"

### D. SWE Resume Red Flags (Auto-Flagged)

|Red Flag|Why It Matters|Our Response|
|---|---|---|
|Photo on resume|Illegal to consider in US/UK hiring, ATS ignores, creates bias risk|Flag: "Photos are not standard for US/UK tech resumes. Consider removing."|
|"References available upon request"|Outdated, wastes space|Flag: "This phrase is outdated. Remove it — references are assumed."|
|Objective statement instead of summary|Focuses on what you want, not what you offer|Flag: "Replace objective with a summary that focuses on what you bring."|
|GPA on a resume over 5 years old|Irrelevant for experienced engineers|Flag: "Consider removing GPA — your experience is more relevant now."|
|Job duties instead of achievements|"Responsible for X" vs "Improved X by Y"|Flag per bullet with rewrite suggestion|
|Hotmail/Yahoo email|Signals to some recruiters|Flag gently: "Consider a Gmail or professional domain email."|
|Generic skills ("Microsoft Office")|Irrelevant for SWE roles|Flag: "Microsoft Office is not relevant for software engineering roles. Remove."|
|"Hardworking", "team player", "passionate"|Meaningless filler|Flag: "Remove generic adjectives — show these through your achievements instead."|

---

_This document is a living plan. It will be updated as we learn from users, as the market evolves, and as we make new decisions. Every update should be versioned. Every major decision should trace back to a user pain point or a market observation — not an opinion._

_Last updated: Version 2.0 — Pre-build. Added: zero-experience user support, user-is-final-authority principle, designed/colored resume handling, four extraction shapes with edge cases, full deterministic metrics explanation, versatile profession-agnostic knowledge base architecture, unsupported profession fallback, system and code level architecture (Section 15)._