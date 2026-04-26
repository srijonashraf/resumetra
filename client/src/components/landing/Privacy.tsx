import {
  LockClosedIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import AnimatedSection from "../ui/AnimatedSection";

const trustIndicators = [
  {
    icon: ShieldCheckIcon,
    title: "Raw Text Never Stored",
    description:
      "Your original resume text is processed and discarded. We only store parsed insights if you create an account.",
  },
  {
    icon: TrashIcon,
    title: "You Can Delete Your Data",
    description:
      "Logged-in users can delete any analysis from their history at any time. You stay in control.",
  },
  {
    icon: UserIcon,
    title: "No Data Selling",
    description:
      "We never sell, share, or distribute your data. Period. Your resume insights are yours alone.",
  },
];

const Privacy = () => (
  <section className="bg-amber-50/50 py-20 md:py-28">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <AnimatedSection>
        <LockClosedIcon className="w-16 h-16 text-amber-600 mx-auto" />
        <h2 className="mt-6 text-3xl md:text-4xl font-bold font-heading text-stone-900">
          Your Privacy, Honestly
        </h2>
        <p className="mt-6 text-stone-500 text-lg max-w-2xl mx-auto">
          No sign-up needed to try Resumetra — one free analysis, no strings
          attached. If you create an account, we save your analysis history so
          you can track improvement over time. You can delete any entry anytime.
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
