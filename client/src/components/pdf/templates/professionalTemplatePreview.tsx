import type { ResumeTemplateProps, PdfResumeData } from "./templateTypes";

function SummaryPreview({ text }: { text: string }) {
  return (
    <section className="mb-4">
      <h2 className="font-[Outfit,sans-serif] text-[11pt] font-bold uppercase tracking-[1px] text-stone-800">
        Summary
      </h2>
      <div className="mb-2 mt-1 h-px bg-amber-600" />
      <p className="font-[DM_Sans,sans-serif] text-[9.5pt] text-stone-700 leading-[1.5]">
        {text}
      </p>
    </section>
  );
}

function WorkExperiencePreview({
  experiences,
}: {
  experiences: PdfResumeData["workExperiences"];
}) {
  if (experiences.length === 0) return null;
  return (
    <section className="mb-4">
      <h2 className="font-[Outfit,sans-serif] text-[11pt] font-bold uppercase tracking-[1px] text-stone-800">
        Work Experience
      </h2>
      <div className="mb-2 mt-1 h-px bg-amber-600" />
      {experiences.map((exp, i) => (
        <div key={i} className="mb-2.5">
          <div className="flex justify-between">
            <p className="font-[DM_Sans,sans-serif] text-[10pt] font-bold text-stone-800">
              {exp.company}
            </p>
            {exp.dateRange && (
              <p className="font-[DM_Sans,sans-serif] text-[9pt] text-stone-500">
                {exp.dateRange}
              </p>
            )}
          </div>
          <p className="font-[DM_Sans,sans-serif] text-[9pt] text-stone-500 italic">
            {exp.title}
          </p>
          {exp.bullets.map((bullet, bIdx) => (
            <div key={bIdx} className="flex pl-[15px]">
              <span className="mr-0 w-3 shrink-0 text-[9.5pt] text-stone-900">
                &bull;
              </span>
              <span className="font-[DM_Sans,sans-serif] text-[9.5pt] text-stone-700 leading-[1.5]">
                {bullet}
              </span>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

function EducationPreview({
  entries,
}: {
  entries: PdfResumeData["education"];
}) {
  if (entries.length === 0) return null;
  return (
    <section className="mb-4">
      <h2 className="font-[Outfit,sans-serif] text-[11pt] font-bold uppercase tracking-[1px] text-stone-800">
        Education
      </h2>
      <div className="mb-2 mt-1 h-px bg-amber-600" />
      {entries.map((edu, i) => (
        <div key={i} className="mb-2.5">
          <div className="flex justify-between">
            <p className="font-[DM_Sans,sans-serif] text-[10pt] font-bold text-stone-800">
              {edu.institution}
            </p>
            {edu.year && (
              <p className="font-[DM_Sans,sans-serif] text-[9pt] text-stone-500">
                {edu.year}
              </p>
            )}
          </div>
          {(edu.degree || edu.field) && (
            <p className="font-[DM_Sans,sans-serif] text-[9pt] text-stone-500 italic">
              {edu.degree}
              {edu.field ? ` in ${edu.field}` : ""}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}

function ProjectsPreview({
  entries,
}: {
  entries: PdfResumeData["projects"];
}) {
  if (entries.length === 0) return null;
  return (
    <section className="mb-4">
      <h2 className="font-[Outfit,sans-serif] text-[11pt] font-bold uppercase tracking-[1px] text-stone-800">
        Projects
      </h2>
      <div className="mb-2 mt-1 h-px bg-amber-600" />
      {entries.map((proj, i) => (
        <div key={i} className="mb-2.5">
          <p className="font-[DM_Sans,sans-serif] text-[10pt] font-bold text-stone-800">
            {proj.name}
          </p>
          {proj.technologies.length > 0 && (
            <p className="font-[DM_Sans,sans-serif] text-[9pt] text-stone-500 italic">
              Technologies: {proj.technologies.join(", ")}
            </p>
          )}
          {proj.description && (
            <p className="font-[DM_Sans,sans-serif] text-[9.5pt] text-stone-700 leading-[1.5]">
              {proj.description}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}

function CertificationsPreview({
  entries,
}: {
  entries: PdfResumeData["certifications"];
}) {
  if (entries.length === 0) return null;
  return (
    <section className="mb-4">
      <h2 className="font-[Outfit,sans-serif] text-[11pt] font-bold uppercase tracking-[1px] text-stone-800">
        Certifications
      </h2>
      <div className="mb-2 mt-1 h-px bg-amber-600" />
      {entries.map((cert, i) => (
        <p key={i} className="mb-1 font-[DM_Sans,sans-serif] text-[9.5pt] text-stone-700">
          <span className="font-bold text-stone-800">{cert.name}</span>
          {cert.issuer && (
            <span className="text-stone-500">
              {" "}
              — {cert.issuer}
              {cert.year ? ` (${cert.year})` : ""}
            </span>
          )}
        </p>
      ))}
    </section>
  );
}

function SkillsPreview({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <section className="mb-4">
      <h2 className="font-[Outfit,sans-serif] text-[11pt] font-bold uppercase tracking-[1px] text-stone-800">
        Skills
      </h2>
      <div className="mb-2 mt-1 h-px bg-amber-600" />
      <p className="font-[DM_Sans,sans-serif] text-[9.5pt] text-stone-700 leading-[1.5]">
        {skills.join(", ")}
      </p>
    </section>
  );
}

export function ProfessionalTemplatePreview({ data }: ResumeTemplateProps) {
  const contactParts = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
  ].filter(Boolean);

  const renderSection = (key: string, index: number) => {
    if (key.startsWith("additional:")) {
      const title = key.slice("additional:".length);
      const additional = data.additionalSections?.find(
        (s) => s.title === title,
      );
      if (additional) {
        return (
          <section key={index} className="mb-4">
            <h2 className="font-[Outfit,sans-serif] text-[11pt] font-bold uppercase tracking-[1px] text-stone-800">
              {additional.title}
            </h2>
            <div className="mb-2 mt-1 h-px bg-amber-600" />
            <p className="font-[DM_Sans,sans-serif] text-[9.5pt] text-stone-700 leading-[1.5]">
              {additional.content}
            </p>
          </section>
        );
      }
      return null;
    }

    switch (key) {
      case "summary":
        return data.summary ? (
          <SummaryPreview key={key} text={data.summary} />
        ) : null;
      case "workExperiences":
        return (
          <WorkExperiencePreview key={key} experiences={data.workExperiences} />
        );
      case "education":
        return <EducationPreview key={key} entries={data.education} />;
      case "projects":
        return <ProjectsPreview key={key} entries={data.projects} />;
      case "certifications":
        return (
          <CertificationsPreview key={key} entries={data.certifications} />
        );
      case "skills":
        return <SkillsPreview key={key} skills={data.skills} />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-[612px] bg-white px-[40px] pt-[50px] pb-[40px] font-[DM_Sans,sans-serif] text-[10pt] text-stone-900 antialiased">
      <header className="mb-3">
        <h1 className="mb-1 font-[Outfit,sans-serif] text-2xl font-bold text-stone-900">
          {data.name}
        </h1>
        {contactParts.length > 0 && (
          <p className="flex flex-wrap items-center gap-1.5 font-[DM_Sans,sans-serif] text-[9pt] text-stone-500">
            {contactParts.map((part, index) => (
              <span key={index} className="contents">
                {index > 0 && <span className="text-stone-500">|</span>}
                <span>{part}</span>
              </span>
            ))}
          </p>
        )}
        <div className="mt-2.5 h-[2px] bg-amber-600" />
      </header>

      <div className="mt-4">
        {data.sectionOrder.map((key, index) => renderSection(key, index))}
      </div>
    </div>
  );
}
