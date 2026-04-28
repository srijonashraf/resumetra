import type { ResumeTemplateProps, PdfResumeData } from "./templateTypes";

function SidebarSkillsPreview({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <div className="mb-4">
      <h2
        className="text-amber-600 mb-2"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Skills
      </h2>
      <div className="flex flex-wrap gap-1">
        {skills.map((skill) => (
          <span
            key={skill}
            className="text-stone-200 bg-stone-700 rounded px-1.5 py-0.5"
            style={{ fontSize: "7.5px" }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function SidebarCertsPreview({
  entries,
}: {
  entries: PdfResumeData["certifications"];
}) {
  if (entries.length === 0) return null;
  return (
    <div>
      <h2
        className="text-amber-600 mb-2"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Certifications
      </h2>
      {entries.map((cert, i) => (
        <div key={i} className="mb-1.5">
          <p className="text-stone-200" style={{ fontSize: "8px", fontWeight: 700 }}>
            {cert.name}
          </p>
          <p className="text-stone-400" style={{ fontSize: "7px" }}>
            {cert.issuer}
            {cert.year ? ` (${cert.year})` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

function SummaryPreview({ text }: { text: string }) {
  return (
    <div className="mb-4">
      <h2
        className="text-amber-600 mb-1.5"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Summary
      </h2>
      <div className="mb-2 h-px bg-amber-600" />
      <p className="text-stone-700" style={{ fontSize: "9.5px", lineHeight: "1.5" }}>
        {text}
      </p>
    </div>
  );
}

function WorkExperiencePreview({
  experiences,
}: {
  experiences: PdfResumeData["workExperiences"];
}) {
  if (experiences.length === 0) return null;
  return (
    <div className="mb-4">
      <h2
        className="text-amber-600 mb-1.5"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Work Experience
      </h2>
      <div className="mb-2 h-px bg-amber-600" />
      {experiences.map((exp, i) => (
        <div key={i} className="mb-2.5">
          <div className="flex justify-between">
            <p className="text-stone-800" style={{ fontSize: "10px", fontWeight: 700 }}>
              {exp.company}
            </p>
            {exp.dateRange && (
              <p className="text-stone-500" style={{ fontSize: "9px" }}>
                {exp.dateRange}
              </p>
            )}
          </div>
          <p className="text-stone-500 italic" style={{ fontSize: "9px" }}>
            {exp.title}
          </p>
          {exp.bullets.map((bullet, bIdx) => (
            <div key={bIdx} className="flex pl-[15px]">
              <span className="mr-0 w-3 shrink-0 text-[9.5pt] text-stone-600">
                &bull;
              </span>
              <span className="text-stone-600" style={{ fontSize: "9.5px", lineHeight: "1.5" }}>
                {bullet}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EducationPreview({
  entries,
}: {
  entries: PdfResumeData["education"];
}) {
  if (entries.length === 0) return null;
  return (
    <div className="mb-4">
      <h2
        className="text-amber-600 mb-1.5"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Education
      </h2>
      <div className="mb-2 h-px bg-amber-600" />
      {entries.map((edu, i) => (
        <div key={i} className="mb-2.5">
          <div className="flex justify-between">
            <p className="text-stone-800" style={{ fontSize: "10px", fontWeight: 700 }}>
              {edu.institution}
            </p>
            {edu.year && (
              <p className="text-stone-500" style={{ fontSize: "9px" }}>
                {edu.year}
              </p>
            )}
          </div>
          {(edu.degree || edu.field) && (
            <p className="text-stone-500 italic" style={{ fontSize: "9px" }}>
              {edu.degree}
              {edu.field ? ` in ${edu.field}` : ""}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectsPreview({
  entries,
}: {
  entries: PdfResumeData["projects"];
}) {
  if (entries.length === 0) return null;
  return (
    <div className="mb-4">
      <h2
        className="text-amber-600 mb-1.5"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Projects
      </h2>
      <div className="mb-2 h-px bg-amber-600" />
      {entries.map((proj, i) => (
        <div key={i} className="mb-2.5">
          <p className="text-stone-800" style={{ fontSize: "10px", fontWeight: 700 }}>
            {proj.name}
          </p>
          {proj.technologies.length > 0 && (
            <p className="text-stone-500 italic" style={{ fontSize: "9px" }}>
              Technologies: {proj.technologies.join(", ")}
            </p>
          )}
          {proj.description && (
            <p className="text-stone-700" style={{ fontSize: "9.5px", lineHeight: "1.5" }}>
              {proj.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function ModernTemplatePreview({ data }: ResumeTemplateProps) {
  const { name, contact, sectionOrder, skills, certifications, additionalSections } = data;

  const mainSectionKeys = sectionOrder.filter(
    (key) => key !== "skills" && key !== "certifications" && !key.startsWith("additional:"),
  );
  const additionalKeys = sectionOrder.filter((key) =>
    key.startsWith("additional:"),
  );

  const renderMainSection = (key: string) => {
    switch (key) {
      case "summary":
        return data.summary ? <SummaryPreview key={key} text={data.summary} /> : null;
      case "workExperiences":
        return <WorkExperiencePreview key={key} experiences={data.workExperiences} />;
      case "education":
        return <EducationPreview key={key} entries={data.education} />;
      case "projects":
        return <ProjectsPreview key={key} entries={data.projects} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="flex w-full max-w-[794px] mx-auto shadow-lg"
      style={{ fontFamily: "'DM Sans', sans-serif", aspectRatio: "210 / 297" }}
    >
      {/* ── Left Sidebar ── */}
      <div className="w-[35%] bg-stone-800 px-5 pt-[30px] pb-6 flex flex-col">
        <h1
          className="text-white mb-4 leading-tight"
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: "20px", fontWeight: 700 }}
        >
          {name}
        </h1>

        <div className="flex flex-col gap-1 mb-6">
          {contact.email && (
            <span className="text-stone-300" style={{ fontSize: "8px" }}>
              {contact.email}
            </span>
          )}
          {contact.phone && (
            <span className="text-stone-300" style={{ fontSize: "8px" }}>
              {contact.phone}
            </span>
          )}
          {contact.location && (
            <span className="text-stone-300" style={{ fontSize: "8px" }}>
              {contact.location}
            </span>
          )}
        </div>

        <SidebarSkillsPreview skills={skills} />
        <SidebarCertsPreview entries={certifications} />
      </div>

      {/* ── Right Main Content ── */}
      <div className="w-[65%] bg-white pt-[30px] px-[25px] pb-6">
        {mainSectionKeys.map((key) => renderMainSection(key))}

        {additionalKeys.map((key, index) => {
          const title = key.slice("additional:".length);
          const additional = additionalSections?.find((s) => s.title === title);
          if (additional) {
            return (
              <div key={index} className="mb-4">
                <h2
                  className="text-amber-600 mb-1.5"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {additional.title}
                </h2>
                <div className="mb-2 h-px bg-amber-600" />
                <p className="text-stone-700" style={{ fontSize: "9.5px", lineHeight: "1.5" }}>
                  {additional.content}
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
