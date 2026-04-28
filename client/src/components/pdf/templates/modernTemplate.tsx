import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import "../fonts";
import type { ResumeTemplateProps, PdfResumeData } from "./templateTypes";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "DM Sans",
  },

  // ── Left sidebar ──
  sidebar: {
    width: "35%",
    backgroundColor: "#292524",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 24,
  },
  name: {
    fontFamily: "Outfit",
    fontSize: 20,
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.2,
    marginBottom: 16,
  },
  contactContainer: {
    marginBottom: 24,
    gap: 4,
  },
  contactItem: {
    fontSize: 8,
    color: "#d6d3d1",
    lineHeight: 1.4,
  },

  sidebarSectionTitle: {
    fontFamily: "Outfit",
    fontSize: 10,
    fontWeight: 700,
    color: "#d97706",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },

  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    fontSize: 7.5,
    color: "#e7e5e4",
    backgroundColor: "#44403c",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },

  sidebarCertEntry: {
    marginBottom: 6,
  },
  sidebarCertName: {
    fontSize: 8,
    color: "#e7e5e4",
    fontWeight: 700,
  },
  sidebarCertDetail: {
    fontSize: 7,
    color: "#a8a29e",
  },

  // ── Right main content ──
  main: {
    width: "65%",
    paddingTop: 30,
    paddingHorizontal: 25,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Outfit",
    fontSize: 11,
    fontWeight: 700,
    color: "#d97706",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionRule: {
    height: 0.5,
    backgroundColor: "#d97706",
    marginBottom: 8,
  },

  entry: { marginBottom: 10 },
  entryHeading: {
    fontFamily: "DM Sans",
    fontSize: 10,
    fontWeight: 700,
    color: "#292524",
    marginBottom: 1,
  },
  entrySubheading: {
    fontSize: 9,
    color: "#78716c",
    marginBottom: 3,
  },
  dateRange: {
    fontSize: 9,
    color: "#78716c",
  },

  bulletItem: {
    flexDirection: "row",
    paddingLeft: 15,
    marginBottom: 4,
    lineHeight: 1.5,
  },
  bulletPrefix: {
    width: 12,
    fontSize: 9.5,
    color: "#44403c",
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: "#44403c",
    lineHeight: 1.5,
  },
  bodyText: {
    fontSize: 9.5,
    color: "#44403c",
    lineHeight: 1.5,
    marginBottom: 2,
  },

  projectTech: {
    fontSize: 9,
    color: "#78716c",
    fontStyle: "italic",
    marginBottom: 2,
  },

  summaryText: {
    fontSize: 9.5,
    color: "#44403c",
    lineHeight: 1.5,
    marginBottom: 4,
  },

  additionalContent: {
    fontSize: 9.5,
    color: "#44403c",
    lineHeight: 1.5,
  },
});

// ── Sidebar sections (skills, certifications) ──

function SidebarSkills({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.sidebarSectionTitle}>Skills</Text>
      <View style={styles.skillsContainer}>
        {skills.map((skill) => (
          <Text key={skill} style={styles.skillTag}>
            {skill}
          </Text>
        ))}
      </View>
    </View>
  );
}

function SidebarCertifications({
  entries,
}: {
  entries: PdfResumeData["certifications"];
}) {
  if (entries.length === 0) return null;
  return (
    <View>
      <Text style={styles.sidebarSectionTitle}>Certifications</Text>
      {entries.map((cert, i) => (
        <View key={i} style={styles.sidebarCertEntry}>
          <Text style={styles.sidebarCertName}>{cert.name}</Text>
          <Text style={styles.sidebarCertDetail}>
            {cert.issuer}
            {cert.year ? ` (${cert.year})` : ""}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Main content sections ──

function SummarySection({ text }: { text: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Summary</Text>
      <View style={styles.sectionRule} />
      <Text style={styles.summaryText}>{text}</Text>
    </View>
  );
}

function WorkExperienceSection({
  experiences,
}: {
  experiences: PdfResumeData["workExperiences"];
}) {
  if (experiences.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Work Experience</Text>
      <View style={styles.sectionRule} />
      {experiences.map((exp, i) => (
        <View key={i} style={styles.entry} wrap>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.entryHeading}>{exp.company}</Text>
            {exp.dateRange && (
              <Text style={styles.dateRange}>{exp.dateRange}</Text>
            )}
          </View>
          <Text style={styles.entrySubheading}>{exp.title}</Text>
          {exp.bullets.map((bullet, bIdx) => (
            <View key={bIdx} style={styles.bulletItem}>
              <Text style={styles.bulletPrefix}>{"\u2022"}</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function EducationSection({
  entries,
}: {
  entries: PdfResumeData["education"];
}) {
  if (entries.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Education</Text>
      <View style={styles.sectionRule} />
      {entries.map((edu, i) => (
        <View key={i} style={styles.entry}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.entryHeading}>{edu.institution}</Text>
            {edu.year && <Text style={styles.dateRange}>{edu.year}</Text>}
          </View>
          {(edu.degree || edu.field) && (
            <Text style={styles.entrySubheading}>
              {edu.degree}
              {edu.field ? ` in ${edu.field}` : ""}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

function ProjectsSection({
  entries,
}: {
  entries: PdfResumeData["projects"];
}) {
  if (entries.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Projects</Text>
      <View style={styles.sectionRule} />
      {entries.map((proj, i) => (
        <View key={i} style={styles.entry} wrap>
          <Text style={styles.entryHeading}>{proj.name}</Text>
          {proj.technologies.length > 0 && (
            <Text style={styles.projectTech}>
              Technologies: {proj.technologies.join(", ")}
            </Text>
          )}
          {proj.description && (
            <Text style={styles.bodyText}>{proj.description}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function AdditionalSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />
      <Text style={styles.additionalContent}>{content}</Text>
    </View>
  );
}

// ── Main template ──

export function ModernTemplate({ data }: ResumeTemplateProps) {
  const { name, contact, sectionOrder, skills, certifications, additionalSections } = data;

  // Main content sections (everything except skills and certs, which go to sidebar)
  const mainSectionKeys = sectionOrder.filter(
    (key) => key !== "skills" && key !== "certifications" && !key.startsWith("additional:"),
  );

  // Additional sections go to main content
  const additionalKeys = sectionOrder.filter((key) =>
    key.startsWith("additional:"),
  );

  const renderMainSection = (key: string) => {
    switch (key) {
      case "summary":
        return data.summary ? (
          <SummarySection key={key} text={data.summary} />
        ) : null;
      case "workExperiences":
        return (
          <WorkExperienceSection key={key} experiences={data.workExperiences} />
        );
      case "education":
        return <EducationSection key={key} entries={data.education} />;
      case "projects":
        return <ProjectsSection key={key} entries={data.projects} />;
      default:
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Left Sidebar ── */}
        <View style={styles.sidebar}>
          <Text style={styles.name}>{name}</Text>

          <View style={styles.contactContainer}>
            {contact.email ? (
              <Text style={styles.contactItem}>{contact.email}</Text>
            ) : null}
            {contact.phone ? (
              <Text style={styles.contactItem}>{contact.phone}</Text>
            ) : null}
            {contact.location ? (
              <Text style={styles.contactItem}>{contact.location}</Text>
            ) : null}
          </View>

          <SidebarSkills skills={skills} />
          <SidebarCertifications entries={certifications} />
        </View>

        {/* ── Right Main Content ── */}
        <View style={styles.main}>
          {mainSectionKeys.map((key) =>
            renderMainSection(key),
          )}

          {additionalKeys.map((key) => {
            const title = key.slice("additional:".length);
            const additional = additionalSections?.find(
              (s) => s.title === title,
            );
            if (additional) {
              return (
                <AdditionalSection
                  key={key}
                  title={additional.title}
                  content={additional.content}
                />
              );
            }
            return null;
          })}
        </View>
      </Page>
    </Document>
  );
}
