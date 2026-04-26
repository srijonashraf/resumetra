import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Logo from "../layout/Logo";
import { Button } from "../ui";
import { btnPrimaryClasses } from "../../utils/button-styles";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-heading font-bold text-xl text-stone-900">
              Resumetra
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium"
            >
              Features
            </a>
            <a
              href="#faq"
              className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium"
            >
              FAQ
            </a>
            <Link to="/app" className={`${btnPrimaryClasses} text-sm`}>
              Get Started Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-stone-600 hover:text-stone-900"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-stone-200 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#features"
              className="block text-stone-600 hover:text-stone-900 text-sm font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#faq"
              className="block text-stone-600 hover:text-stone-900 text-sm font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              FAQ
            </a>
            <Link
              to="/app"
              className="block btn-primary text-sm text-center"
              onClick={() => setMobileOpen(false)}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
