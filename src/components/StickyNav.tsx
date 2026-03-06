"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Acasă", href: "#home" },
  { label: "Când", href: "#when" },
  { label: "Unde", href: "#where" },
  { label: "Confirmă", href: "#rsvp" },
];

export default function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 100);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const bgClass = scrolled
    ? "bg-forest-green/95 backdrop-blur shadow-md"
    : "bg-transparent";
  const textClass = scrolled ? "text-cream" : "text-burgundy";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-14 md:h-16">
        {/* Logo / brand */}
        <a
          href="#home"
          className={`font-script text-xl md:text-2xl transition-colors duration-300 ${
            scrolled ? "text-gold-light" : "text-gold"
          }`}
        >
          Cristina &amp; Andrei
        </a>

        {/* Desktop links */}
        <div className={`hidden md:flex items-center gap-8 text-sm font-body tracking-wide uppercase transition-colors duration-300 ${textClass}`}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-gold transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden transition-colors duration-300 ${textClass}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Meniu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className={`md:hidden border-t ${scrolled ? "border-cream/10 bg-forest-green/95" : "border-burgundy/10 bg-cream/95"} backdrop-blur`}>
          <div className="flex flex-col px-4 py-4 gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-body tracking-wide uppercase transition-colors hover:text-gold ${textClass}`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
