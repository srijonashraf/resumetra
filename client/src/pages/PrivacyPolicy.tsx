import { Link } from "react-router-dom";

const sections = [
  {
    title: "Information We Collect",
    content: [
      {
        subtitle: "Guest Users",
        text: "When you use Resumetra without an account, we collect only what is necessary to provide the service: your resume text is sent to an AI processing service for analysis, and we log your IP address and user agent to enforce the one-analysis guest limit and prevent abuse. Your original resume text is never stored in our database.",
      },
      {
        subtitle: "Authenticated Users",
        text: "When you sign in with Google, we receive your Google profile information: name, email address, and profile picture URL. We do not receive or store your Google password.",
      },
      {
        subtitle: "Resume Data",
        text: "Your original resume text is processed in real-time and discarded. We never store the raw text in our database. For authenticated users, we store parsed insights from the analysis — including scores, feedback, detected skills, work experience summaries, and education details — so you can review your analysis history. A one-way hash (SHA-256) of your resume text is stored solely to detect duplicate submissions.",
      },
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      {
        text: "We use collected information solely to:",
      },
      {
        text: "• Provide resume analysis, scoring, and feedback",
      },
      {
        text: "• Enable features like job matching, resume tailoring, and career path mapping for authenticated users",
      },
      {
        text: "• Maintain your analysis history so you can track improvement over time",
      },
      {
        text: "• Enforce guest usage limits and prevent abuse",
      },
      {
        text: "• Authenticate you via Google OAuth",
      },
    ],
  },
  {
    title: "Third-Party Services",
    content: [
      {
        text: "To analyze your resume, we send your resume text to an AI processing service (an OpenAI-compatible API). This is necessary to generate your analysis results. We do not control how that service handles data during processing, and we encourage you to review their privacy policy.",
      },
      {
        text: "We use Google OAuth for authentication. Google's privacy policy applies to the authentication process.",
      },
    ],
  },
  {
    title: "Data Storage and Security",
    content: [
      {
        text: "Analysis data is stored in a PostgreSQL database hosted on Railway. We use parameterized queries to prevent SQL injection and require authentication to access user-specific data. Database connections support SSL encryption.",
      },
      {
        text: "However, no system is perfectly secure. We take reasonable measures to protect your data but cannot guarantee absolute security.",
      },
    ],
  },
  {
    title: "Data Retention and Deletion",
    content: [
      {
        text: "For authenticated users, analysis history is retained until you delete it. You can delete individual analyses from your history at any time via the dashboard.",
      },
      {
        text: "Guest usage logs (IP address, user agent) are retained indefinitely for abuse prevention. We do not currently offer a mechanism for guests to request deletion of these logs.",
      },
      {
        text: "We do not currently offer account deletion or bulk data export. If you need your data removed, please contact us.",
      },
    ],
  },
  {
    title: "What We Do Not Do",
    content: [
      {
        text: "• We do not sell your data",
      },
      {
        text: "• We do not share your data with advertisers",
      },
      {
        text: "• We do not share your data with any third party beyond the AI processing service required to provide the analysis",
      },
      {
        text: "• We do not store your original resume text in our database",
      },
      {
        text: "• We do not use your data to train AI models",
      },
    ],
  },
  {
    title: "Cookies and Local Storage",
    content: [
      {
        text: "We use browser localStorage to store your authentication token (JWT). This is necessary to keep you signed in. We do not use tracking cookies or third-party analytics.",
      },
    ],
  },
  {
    title: "Children's Privacy",
    content: [
      {
        text: "Resumetra is not intended for use by individuals under the age of 16. We do not knowingly collect data from children.",
      },
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      {
        text: "We may update this privacy policy from time to time. Changes will be posted on this page with an updated effective date.",
      },
    ],
  },
  {
    title: "Contact",
    content: [
      {
        text: "If you have questions about this privacy policy or your data, reach out via our GitHub page.",
      },
    ],
  },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-white">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <Link
        to="/"
        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
      >
        &larr; Back to Home
      </Link>

      <h1 className="mt-8 text-3xl md:text-4xl font-bold font-heading text-stone-900">
        Privacy Policy
      </h1>
      <p className="mt-2 text-stone-400 text-sm">
        Effective date: April 26, 2026
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold text-stone-900">
              {section.title}
            </h2>
            <div className="mt-3 space-y-3">
              {section.content.map((block, i) =>
                "subtitle" in block ? (
                  <div key={i}>
                    <h3 className="font-medium text-stone-800 mt-4">
                      {block.subtitle}
                    </h3>
                    <p className="text-stone-500 mt-1 leading-relaxed">
                      {block.text}
                    </p>
                  </div>
                ) : (
                  <p key={i} className="text-stone-500 leading-relaxed">
                    {block.text}
                  </p>
                )
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
