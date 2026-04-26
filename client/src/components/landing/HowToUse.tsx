import {
  ArrowUpTrayIcon,
  CpuChipIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import AnimatedSection from "../ui/AnimatedSection";

const steps = [
  {
    number: 1,
    icon: ArrowUpTrayIcon,
    title: "Upload Your Resume",
    text: "Drag and drop your PDF resume or click to browse. Our system extracts the text instantly.",
  },
  {
    number: 2,
    icon: CpuChipIcon,
    title: "AI Analysis",
    text: "Our AI reviews your resume across 4 dimensions — ATS compatibility, content quality, impact, and readability.",
  },
  {
    number: 3,
    icon: RocketLaunchIcon,
    title: "Get Actionable Insights",
    text: "Receive detailed scores, identified gaps, skill suggestions, and tailored improvement recommendations.",
  },
];

const stepDelays = [0, 0.15, 0.3];

const HowToUse = () => (
  <section id="how-to-use" className="py-20 md:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimatedSection className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-stone-900">
          Analyze Your Resume in 3 Steps
        </h2>
        <p className="text-stone-500 mt-4">
          From upload to actionable insights in under 30 seconds
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto mt-16">
        {steps.map((step, index) => (
          <AnimatedSection key={step.number} delay={stepDelays[index]}>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold font-heading mx-auto">
                {step.number}
              </div>
              <step.icon className="w-10 h-10 text-amber-600 mx-auto mt-4" />
              <h3 className="mt-3 text-xl font-semibold text-stone-900">
                {step.title}
              </h3>
              <p className="mt-2 text-stone-500 text-sm leading-relaxed">
                {step.text}
              </p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default HowToUse;
