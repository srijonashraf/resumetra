import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeTemplateProps, PdfResumeData } from "./templateTypes";
import "../fonts";

const COLORS = {
  stone900: "#1c1917",
  stone800: "#292524",
  stone700: "#44403c",
  stone500: "#78716c",
  amber600: "#d97706",
  amber400: "#fbbf24",
} as const;

const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: "DM Sans",
    fontSize: 9.5,
    color: COLORS.stone900,
    lineHeight: 1.5,
  },
  header: { marginBottom: 12 },
  name: {
    fontFamily: "Outfit",
    fontSize: 24,
    fontWeight: 700,
    color: COLORS.stone900,
    lineHeight: 1.2,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    gap: 6,
    fontSize: 9,
    color: COLORS.stone500,
  },
  headerRule: {
    height: 2,
    backgroundColor: COLORS.amber600,
    marginTop: 10,
    marginBottom: 16,
  },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontFamily: "Outfit",
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.stone800,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionRule: {
    height: 1,
    backgroundColor: COLORS.amber600,
    marginBottom: 8,
  },

  entry: { marginBottom: 10 },
  entryHeading: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.stone800,
  },
  entrySubheading: {
    fontSize: 9,
    color: COLORS.stone500,
    marginBottom: 2,
  },
  dateRange: {
    fontSize: 9,
    color: COLORS.stone500,
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
    color: COLORS.stone900,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: COLORS.stone700,
    lineHeight: 1.5,
  },
  bodyText: {
    fontSize: 9.5,
    color: COLORS.stone700,
    lineHeight: 1.5,
    marginBottom: 2,
  },

  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillsText: {
    fontSize: 9.5,
    color: COLORS.stone700,
    lineHeight: 1.5,
  },

  summaryText: {
    fontSize: 9.5,
    color: COLORS.stone700,
    lineHeight: 1.5,
    marginBottom: 4,
  },

  certEntry: {
    flexDirection: "row",
    marginBottom: 4,
  },

  projectTech: {
    fontSize: 9,
    color: COLORS.stone500,
    fontStyle: "italic",
    marginBottom: 2,
  },

  additionalContent: {
    fontSize: 9.5,
    color: COLORS.stone700,
    lineHeight: 1.5,
  },
});

// ── Section renderers ──

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
          <Text style={styles.entryHeading}>{exp.company}</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.entrySubheading}>{exp.title}</Text>
            {exp.dateRange && (
              <Text style={styles.dateRange}>{exp.dateRange}</Text>
            )}
          </View>
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

function CertificationsSection({
  entries,
}: {
  entries: PdfResumeData["certifications"];
}) {
  if (entries.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      <View style={styles.sectionRule} />
      {entries.map((cert, i) => (
        <View key={i} style={styles.certEntry}>
          <Text style={styles.entryHeading}>{cert.name}</Text>
          {cert.issuer && (
            <Text style={styles.entrySubheading}>
              {" "}
              — {cert.issuer}
              {cert.year ? ` (${cert.year})` : ""}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

function SkillsSection({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.sectionRule} />
      <View style={styles.skillsContainer}>
        <Text style={styles.skillsText}>{skills.join(", ")}</Text>
      </View>
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

export function ProfessionalTemplate({ data }: ResumeTemplateProps) {
  const contactParts = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
  ].filter(Boolean);

  // Render sections in order specified by sectionOrder
  const renderSection = (key: string, index: number) => {
    if (key.startsWith("additional:")) {
      const title = key.slice("additional:".length);
      const additional = data.additionalSections?.find(
        (s) => s.title === title,
      );
      if (additional) {
        return (
          <AdditionalSection
            key={index}
            title={additional.title}
            content={additional.content}
          />
        );
      }
      return null;
    }

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
      case "certifications":
        return (
          <CertificationsSection key={key} entries={data.certifications} />
        );
      case "skills":
        return <SkillsSection key={key} skills={data.skills} />;
      default:
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" wrap style={styles.page}>
        <View style={styles.header} wrap={false}>
          <Text style={styles.name}>{data.name}</Text>
          {contactParts.length > 0 && (
            <View style={styles.contactRow}>
              {contactParts.map((part, index) => (
                <View key={index} style={{ flexDirection: "row" }}>
                  {index > 0 && <Text style={{ color: COLORS.stone500 }}> | </Text>}
                  <Text>{part}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.headerRule} />
        </View>

        {data.sectionOrder.map((key, index) => renderSection(key, index))}
      </Page>
    </Document>
  );
}
