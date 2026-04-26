import {
  ShieldExclamationIcon,
  InboxArrowDownIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import AnimatedSection from "../ui/AnimatedSection";
import Card from "../ui/Card";

const painPoints = [
  {
    icon: ShieldExclamationIcon,
    title: "ATS Black Hole",
    text: "75% of resumes never reach a human recruiter. Your resume might be rejected by ATS software before anyone reads it.",
  },
  {
    icon: InboxArrowDownIcon,
    title: "Applying Into the Void",
    text: "Sending dozens of applications with zero responses. No feedback, no clarity on what\u2019s wrong.",
  },
  {
    icon: PuzzlePieceIcon,
    title: "Missing Skills Blindspot",
    text: "You don\u2019t know what skills you\u2019re missing or how to position yourself for the roles you want.",
  },
] as const;

const PainPoints = () => (
  <section id="pain-points" className="py-20 md:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 font-heading">
          Sound Familiar?
        </h2>
        <p className="text-stone-500 mt-4">
          Most job seekers face these common struggles
        </p>
      </div>

      <div className="max-w-5xl mx-auto mt-16 grid md:grid-cols-3 gap-8">
        {painPoints.map(({ icon: Icon, title, text }, index) => (
          <AnimatedSection key={title} delay={index * 0.1}>
            <Card padding="lg" hover="lift" className="h-full">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900">
                {title}
              </h3>
              <p className="text-stone-500 mt-2 leading-relaxed">{text}</p>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default PainPoints;
