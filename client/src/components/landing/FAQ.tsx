import AnimatedSection from "../ui/AnimatedSection";
import AccordionItem from "../ui/AccordionItem";

const faqItems = [
  {
    question: "Is Resumetra really free?",
    answer:
      "Yes, Resumetra is completely free to use. You can analyze your resume, get job matches, and receive tailored suggestions without any cost. We may introduce premium features in the future, but the core analysis will always remain free.",
  },
  {
    question: "Do you store my resume data?",
    answer:
      "No. Your resume text is processed in real-time and immediately discarded. We never store, save, or share your personal information, work history, or any content from your resume.",
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
      "Yes! After analyzing your resume, you can paste any job description and our AI will provide section-by-section tailored rewrites to optimize your resume for that specific role.",
  },
  {
    question: "Is my data shared with third parties?",
    answer:
      "Never. We do not share, sell, or distribute any of your data. Your resume analysis is private and exists only during your active session.",
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
