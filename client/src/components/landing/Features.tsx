import {
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  MapIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import AnimatedSection from "../ui/AnimatedSection";
import Card from "../ui/Card";

const features = [
  {
    icon: ChartBarIcon,
    title: "AI Resume Scoring",
    description:
      "Multi-dimensional analysis scoring your resume across ATS compatibility, content quality, impact, and readability.",
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: "ATS Compatibility Check",
    description:
      "Identify formatting issues, missing keywords, and structural problems that block ATS screening.",
  },
  {
    icon: MagnifyingGlassIcon,
    title: "Job Match Analysis",
    description:
      "Compare your resume against any job description. See exact skill matches, gaps, and keyword coverage.",
  },
  {
    icon: PencilSquareIcon,
    title: "Smart Resume Tailoring",
    description:
      "AI-powered section-by-section rewrites to optimize your resume for specific job descriptions.",
  },
  {
    icon: MapIcon,
    title: "Career Path Mapping",
    description:
      "Visualize your career trajectory with personalized paths, skill requirements, and timeline projections.",
  },
  {
    icon: AdjustmentsHorizontalIcon,
    title: "Detailed Metrics",
    description:
      "Word count, bullet point analysis, contact completeness, grammar issues, and quantifiable achievement tracking.",
  },
] as const;

const Features = () => (
  <section id="features" className="py-20 md:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 font-heading">
          Everything You Need to Land the Job
        </h2>
        <p className="text-stone-500 mt-4">
          Powerful AI tools to analyze, optimize, and perfect your resume
        </p>
      </div>

      <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ icon: Icon, title, description }, index) => (
          <AnimatedSection key={title} delay={index * 0.08}>
            <Card hover="lift" className="h-full">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mt-4">
                {title}
              </h3>
              <p className="text-stone-500 mt-2 leading-relaxed">
                {description}
              </p>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
