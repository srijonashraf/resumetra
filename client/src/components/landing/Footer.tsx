import { Link } from "react-router-dom";
import Logo from "../layout/Logo";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How To Use", href: "#how-to-use" },
  { label: "FAQ", href: "#faq" },
];

const companyLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
];

const Footer = () => (
  <footer className="bg-stone-100 border-t border-stone-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top row: logo + tagline */}
      <div className="flex items-center gap-3">
        <Logo className="w-8 h-8" />
        <span className="text-lg font-bold font-heading text-stone-900">
          Resumetra
        </span>
      </div>
      <p className="mt-2 text-stone-500 text-sm">
        AI-powered resume analysis for the modern job seeker
      </p>

      {/* Middle row: link columns */}
      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div>
          <h4 className="font-semibold text-stone-900 text-sm">Product</h4>
          <ul className="mt-3 space-y-2">
            {productLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-stone-500 hover:text-amber-600 transition-colors text-sm"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-stone-900 text-sm">Company</h4>
          <ul className="mt-3 space-y-2">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-stone-500 hover:text-amber-600 transition-colors text-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-stone-900 text-sm">Connect</h4>
          <ul className="mt-3 space-y-2">
            <li>
              <a
                href="https://github.com/srijonashraf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-500 hover:text-amber-600 transition-colors text-sm inline-flex items-center gap-1.5"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-8 pt-8 border-t border-stone-200 flex items-center justify-between">
        <p className="text-sm text-stone-400">
          Made with care by{" "}
          <a
            href="https://srijonashraf.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Srijon Ashraf
          </a>
        </p>
        <a
          href="https://github.com/srijonashraf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-400 hover:text-amber-600 transition-colors"
          aria-label="GitHub profile"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
