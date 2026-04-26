import {
  LockClosedIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import AnimatedSection from "../ui/AnimatedSection";

const trustIndicators = [
  {
    icon: ShieldCheckIcon,
    title: "No Data Stored",
    description: "Your resume text is processed and immediately discarded",
  },
  {
    icon: ClockIcon,
    title: "Session Only",
    description: "Analysis results exist only during your active session",
  },
  {
    icon: UserIcon,
    title: "Your Data, Your Control",
    description: "No third-party sharing, no data selling, ever",
  },
];

const Privacy = () => (
  <section className="bg-amber-50/50 py-20 md:py-28">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <AnimatedSection>
        <LockClosedIcon className="w-16 h-16 text-amber-600 mx-auto" />
        <h2 className="mt-6 text-3xl md:text-4xl font-bold font-heading text-stone-900">
          Your Resume Never Touches Our Servers
        </h2>
        <p className="mt-6 text-stone-500 text-lg max-w-2xl mx-auto">
          We analyze your resume in real-time and never store your data. Your
          personal information, work history, and skills remain completely
          private.
        </p>
      </AnimatedSection>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {trustIndicators.map((item) => (
          <AnimatedSection key={item.title}>
            <item.icon className="w-8 h-8 text-amber-600 mx-auto" />
            <h3 className="mt-3 font-semibold text-stone-900">{item.title}</h3>
            <p className="text-stone-500 text-sm mt-1">{item.description}</p>
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default Privacy;
