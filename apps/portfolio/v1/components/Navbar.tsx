/* eslint-disable no-unused-vars */
 "use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import `useRouter` for programmatic navigation
import { motion, useAnimation } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Hobbies', href: '#hobbies' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const controls = useAnimation();
  const router = useRouter(); // Initialize the useRouter hook for navigation

  // Handle scroll event to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
      
      // Determine active section based on scroll position
      const sections = navItems.map(item => item.label.toLowerCase());
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add animation when scrolled
  useEffect(() => {
    controls.start({
      opacity: scrolled ? 1 : 0.9,
      scale: scrolled ? 1 : 0.95,
      transition: { duration: 0.5 },
    });
  }, [scrolled, controls]);

  return (
    <header 
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-gray-900/90 py-3 shadow-md backdrop-blur-md' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.a 
            href="#home"
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-cyan-500"></span>Adnan
          </motion.a>
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                className={`relative text-sm font-medium transition-colors ${
                  activeSection === item.label.toLowerCase() 
                    ? 'text-cyan-400' 
                    : 'text-gray-300 hover:text-white'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(item.label.toLowerCase());
                  if (target) {
                    window.scrollTo({
                      top: target.offsetTop - 100,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                {item.label}
                {activeSection === item.label.toLowerCase() && (
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 w-full bg-cyan-500"
                    layoutId="navbar-underline"
                  />
                )}
              </motion.a>
            ))}
          </nav>
          {/* Mobile Navigation Toggle */}
          <button 
            className="text-white focus:outline-none md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="size-6" 
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
      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <motion.div 
          className="bg-gray-900 shadow-xl md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto p-4">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`py-2 text-sm font-medium transition-colors ${
                    activeSection === item.label.toLowerCase() 
                      ? 'text-cyan-400' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(item.label.toLowerCase());
                    if (target) {
                      window.scrollTo({
                        top: target.offsetTop - 100,
                        behavior: 'smooth'
                      });
                      setMenuOpen(false);
                    }
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
}