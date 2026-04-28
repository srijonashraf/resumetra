export interface PdfResumeData {
  name: string;
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  summary?: string;
  workExperiences: Array<{
    company: string;
    title: string;
    dateRange: string;
    bullets: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  skills: string[];
  sectionOrder: string[];
  additionalSections?: Array<{
    title: string;
    content: string;
  }>;
}

export interface ResumeTemplateProps {
  data: PdfResumeData;
}

export type TemplateId = "professional" | "modern";
