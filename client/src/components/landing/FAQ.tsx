import AnimatedSection from "../ui/AnimatedSection";
import AccordionItem from "../ui/AccordionItem";

const faqItems = [
  {
    question: "Is Resumetra really free?",
    answer:
      "Yes. You get one free resume analysis without creating an account. If you sign in with Google, you unlock unlimited analyses, job matching, resume tailoring, and full history — all still free.",
  },
  {
    question: "Do you store my resume data?",
    answer:
      "Guest analyses are processed in real-time and the raw text is never stored. For signed-in users, we save parsed insights (scores, feedback, detected skills) so you can review your history and track improvement. Your original resume text is never stored — only a one-way hash for deduplication. You can delete any analysis from your history at any time.",
  },
  {
    question: "How accurate is the AI analysis?",
    answer:
      "Our AI analyzes your resume across 4 key dimensions used by professional recruiters: ATS compatibility, content quality, impact, and readability. While no automated tool is perfect, our analysis is based on proven hiring criteria and industry standards.",
  },
  {
    question: "What resume formats are supported?",
    answer:
      "Currently, we support PDF resume uploads, which is the most widely accepted format by ATS systems and recruiters. Simply drag and drop your PDF file to get started.",
  },
  {
    question: "Can I tailor my resume for specific jobs?",
    answer:
      "Yes! After analyzing your resume, you can paste any job description and our AI will provide section-by-section tailored rewrites to optimize your resume for that specific role. Sign in with Google to unlock this feature.",
  },
  {
    question: "Is my data shared with third parties?",
    answer:
      "We never sell, share, or distribute your data. To provide the analysis, your resume text is sent to an AI processing service. Beyond that, your data stays with Resumetra and is never shared with anyone else.",
  },
];

const FAQ = () => (
  <section id="faq" className="py-20 md:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimatedSection className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-stone-900">
          Frequently Asked Questions
        </h2>
      </AnimatedSection>

      <div className="max-w-3xl mx-auto mt-12">
        {faqItems.map((item) => (
          <AccordionItem
            key={item.question}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </div>
    </div>
  </section>
);

export default FAQ;
