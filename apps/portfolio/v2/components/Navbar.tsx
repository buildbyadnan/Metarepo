"use client";
import { useState, useEffect, useCallback, type MouseEvent } from "react";
import { motion, useAnimation } from "framer-motion";
import Bookings from "@/components/Bookings";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
  // { label: 'Testimonials', href: '#testimonials' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const controls = useAnimation();
  const navOffset = 88;

  // Scroll-based header state only (no section detection to avoid jank)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for active section detection (smoother than scroll loops)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        threshold: 0.35,
        rootMargin: "-10% 0px -50% 0px",
      }
    );

    navItems.forEach(({ label }) => {
      const el = document.getElementById(label.toLowerCase());
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = useCallback(
    (sectionId: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const target = document.getElementById(sectionId);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({ top, behavior: 'smooth' });
        setActiveSection(sectionId);
        setMenuOpen(false);
      }
    },
    [navOffset]
  );

  // Add animation when scrolled
  useEffect(() => {
    controls.start({
      opacity: scrolled ? 1 : 0.9,
      scale: scrolled ? 1 : 0.95,
      transition: { duration: 0.5 },
    });
  }, [scrolled, controls]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-black/85 py-3 shadow-lg shadow-cyan-500/10 backdrop-blur-lg border-b border-cyan-500/20'
            : 'bg-black/40 py-5 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
            {/* Logo */}
            <motion.a
              href="#home"
              className="text-xl sm:text-2xl font-black tracking-tight text-white flex-shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="bg-gradient-to-r from-white via-cyan-200 to-slate-400 bg-clip-text text-transparent">
                Adnan
              </span>
            </motion.a>
            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-2 sm:gap-3 md:gap-4 md:flex">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold tracking-wide transition-colors whitespace-nowrap ${
                    activeSection === item.label.toLowerCase()
                      ? 'text-white bg-white/5 border border-cyan-500/30 shadow-cyan-500/20 shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={handleNavClick(item.label.toLowerCase())}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
          </div>

          {/* Desktop CTA + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="hidden md:block rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20 hover:text-white transition-colors"
            >
              Build your MVP
            </button>
            {/* Mobile CTA Button */}
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="md:hidden rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs sm:text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20 hover:text-white transition-colors"
            >
              MVP
            </button>
            {/* Mobile Navigation Toggle */}
            <button 
              type="button"
              className="text-white focus:outline-none md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors z-50 relative"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-6 h-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Rendered OUTSIDE header to avoid containment issues */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 md:hidden z-30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          
          {/* Menu Content */}
          <motion.div 
            className="fixed left-0 top-0 right-0 bottom-0 md:hidden z-40 pt-16 sm:pt-20 bg-black flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Scrollable Navigation Items */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2">
              <nav className="flex flex-col gap-2 sm:gap-3">
                {navItems.map((item) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className={`py-4 px-4 rounded-lg text-base sm:text-lg font-semibold transition-all cursor-pointer block ${
                      activeSection === item.label.toLowerCase() 
                        ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/25' 
                        : 'text-gray-200 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                    onClick={handleNavClick(item.label.toLowerCase())}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>
            </div>
            
            {/* Fixed Footer Section */}
            <div className="border-t border-cyan-500/20 px-4 sm:px-6 py-6 bg-black/90 space-y-3">
              <motion.button
                onClick={() => {
                  setConsultationModalOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-4 py-4 text-base sm:text-lg font-bold text-cyan-100 hover:bg-cyan-500/30 hover:border-cyan-500/70 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Build your MVP
              </motion.button>
              <motion.button
                onClick={() => setMenuOpen(false)}
                className="w-full rounded-lg border border-slate-600/50 bg-slate-800/40 px-4 py-4 text-base sm:text-lg font-bold text-slate-300 hover:bg-slate-800/60 hover:border-slate-600/70 transition-all active:scale-95"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                Close Menu
              </motion.button>
            </div>
          </motion.div>
        </>
      )}

      <Bookings
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        bookingType="build-mvp"
      />
    </>
  );
}