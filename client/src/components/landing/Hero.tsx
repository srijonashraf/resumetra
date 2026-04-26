import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedSection from "../ui/AnimatedSection";
import Card from "../ui/Card";
import { btnPrimaryClasses, btnSecondaryClasses } from "../../utils/button-styles";

const scoreItems = [
  { label: "ATS", value: 8.2 },
  { label: "Content", value: 7.5 },
  { label: "Impact", value: 7.0 },
  { label: "Readability", value: 8.5 },
] as const;

const overallScore = 7.8;

const Hero = () => (
  <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
    {/* Background gradient orbs */}
    <div
      className="absolute top-20 -left-32 w-96 h-96 bg-amber-400 rounded-full opacity-10 blur-3xl"
      aria-hidden="true"
    />
    <div
      className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500 rounded-full opacity-15 blur-3xl"
      aria-hidden="true"
    />
    <div
      className="absolute top-40 right-1/3 w-64 h-64 bg-amber-300 rounded-full opacity-10 blur-3xl"
      aria-hidden="true"
    />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
        {/* Left column */}
        <AnimatedSection>
          <p className="text-amber-600 font-medium text-sm uppercase tracking-wider">
            AI-Powered Resume Analysis
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 font-heading leading-tight">
            Your Resume Deserves an Expert Review
          </h1>
          <p className="mt-6 text-lg text-stone-500 max-w-lg">
            Get instant, detailed feedback powered by advanced AI. Score your
            resume across 4 dimensions, identify gaps, and land your dream job.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link to="/app" className={`${btnPrimaryClasses} text-center`}>
              Analyze Your Resume &mdash; Free
            </Link>
            <a href="#how-to-use" className={`${btnSecondaryClasses} text-center`}>
              See How It Works
            </a>
          </div>
          <p className="text-sm text-stone-400 mt-4">
            No sign-up required. No data stored.
          </p>
        </AnimatedSection>

        {/* Right column — analysis preview card */}
        <AnimatedSection delay={0.2} className="mt-12 lg:mt-0">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Card className="shadow-xl max-w-md mx-auto lg:mx-0 lg:ml-auto">
              {/* Overall score */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-stone-500">
                  Overall Score
                </span>
                <span className="text-2xl font-bold text-stone-900 font-heading">
                  {overallScore}
                  <span className="text-sm font-normal text-stone-400">/10</span>
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 mb-6">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(overallScore / 10) * 100}%` }}
                />
              </div>

              {/* Score grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {scoreItems.map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-stone-50 rounded-xl px-4 py-3 text-center"
                  >
                    <p className="text-xs text-stone-400 mb-1">{label}</p>
                    <p className="text-lg font-bold text-stone-900 font-heading">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Hiring recommendation badge */}
              <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-4 py-3">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-sm font-medium text-emerald-700">
                  Hiring Recommendation: Hire
                </span>
              </div>
            </Card>
          </motion.div>
        </AnimatedSection>
      </div>
    </div>
  </section>
);

export default Hero;
