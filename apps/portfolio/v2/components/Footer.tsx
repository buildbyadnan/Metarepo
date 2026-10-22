// needs to be refactored with biome disable removals
"use client";
import { useEffect, useRef, useCallback } from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaCode, FaServer, FaThreads } from "react-icons/fa6";
import { BiCodeAlt } from "react-icons/bi";
import Link from "next/link";

interface NavigationLink {
  href: string;
  text: string;
}

interface SocialLink {
  href: string;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  label: string;
}

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const circuitSparkRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const statusRef = useRef<HTMLSpanElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const iconsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  
  const currentYear = new Date().getFullYear();

  // Navigation links configuration
  const navigationLinks: NavigationLink[] = [
    { href: "#home", text: "Home" },
    { href: "#about", text: "About" },
    { href: "#projects", text: "Projects" },
    { href: "#experience", text: "Experience" },
    { href: "#skills", text: "Skills" },
    { href: "#contact", text: "Contact" }
  ];

  // Social links configuration
  const socialLinks: SocialLink[] = [
    { 
      href: "https://github.com/Adnan-The-Coder", 
      icon: FaGithub, 
      color: "hover:bg-gray-700 hover:shadow-gray-500/25", 
      label: "GitHub"
    },
    { 
      href: "https://linkedin.com/in/syedadnanali99", 
      icon: FaLinkedin, 
      color: "hover:bg-blue-600 hover:shadow-blue-500/25", 
      label: "LinkedIn"
    },
    { 
      href: "https://www.instagram.com/adnan_the_coder", 
      icon: FaInstagram, 
      color: "hover:bg-pink-600 hover:shadow-pink-500/25", 
      label: "Instagram"
    },
    { 
      href: "https://www.threads.com/@adnan_the_coder", 
      icon: FaThreads, 
      color: "hover:bg-gray-800 hover:shadow-gray-500/25", 
      label: "Threads"
    }
  ];

  // Enhanced particle animation system
  const animateParticles = useCallback(() => {
    for (const [index, particle] of particlesRef.current.entries()) {
      if (!particle) continue;
      
      const duration = 3000 + Math.random() * 4000;
      const delay = Math.random() * 2000;
      
      const animate = () => {
        const yOffset = index % 2 === 0 ? 30 : -40;
        const xOffset = index % 3 === 0 ? 25 : -35;
        
        particle.style.transition = `transform ${duration}ms ease-in-out`;
        particle.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        
        setTimeout(() => {
          if (particle) {
            particle.style.transform = 'translate(0px, 0px)';
            setTimeout(animate, duration);
          }
        }, duration);
      };
      
      setTimeout(animate, delay);
    }
  }, []);

  // Status indicator color cycling animation
  const animateStatus = useCallback(() => {
    if (!statusRef.current) return;
    
    const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
    let colorIndex = 0;
    
    const cycleColors = () => {
      const dot = statusRef.current?.querySelector('.status-dot') as HTMLElement;
      if (dot) {
        dot.style.backgroundColor = colors[colorIndex];
        dot.style.boxShadow = `0 0 10px ${colors[colorIndex]}, 0 0 20px ${colors[colorIndex]}40`;
        colorIndex = (colorIndex + 1) % colors.length;
      }
    };
    
    // Initial call and then interval
    cycleColors();
    const interval = setInterval(cycleColors, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Circuit spark animation
  const animateCircuitSpark = useCallback(() => {
    if (!circuitSparkRef.current) return;
    
    const spark = circuitSparkRef.current;
    const duration = 5000;
    
    const animate = () => {
      // Reset position
      spark.style.transition = 'none';
      spark.style.left = '0%';
      spark.style.top = '33%';
      spark.style.opacity = '0';
      
      setTimeout(() => {
        if (spark) {
          spark.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          spark.style.left = '100%';
          spark.style.top = '67%';
          spark.style.opacity = '1';
          
          setTimeout(() => {
            if (spark) {
              spark.style.opacity = '0';
              setTimeout(animate, 2000);
            }
          }, duration - 1000);
        }
      }, 100);
    };
    
    // Start animation after a delay
    const timeout = setTimeout(animate, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Enhanced magnetic icon effect
  const setupMagneticIcons = useCallback(() => {
    const cleanupFunctions: (() => void)[] = [];
    
    for (const icon of iconsRef.current) {
      if (!icon) continue;
      
      const handleMouseMove = (e: MouseEvent) => {
        const rect = icon.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.25;
        const deltaY = (e.clientY - centerY) * 0.25;
        
        icon.style.transition = 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)';
        icon.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05) rotate(${deltaX * 0.1}deg)`;
      };
      
      const handleMouseLeave = () => {
        icon.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        icon.style.transform = 'translate(0px, 0px) scale(1) rotate(0deg)';
      };
      
      const handleMouseEnter = () => {
        icon.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
      };
      
      icon.addEventListener('mousemove', handleMouseMove);
      icon.addEventListener('mouseleave', handleMouseLeave);
      icon.addEventListener('mouseenter', handleMouseEnter);
      
      cleanupFunctions.push(() => {
        icon.removeEventListener('mousemove', handleMouseMove);
        icon.removeEventListener('mouseleave', handleMouseLeave);
        icon.removeEventListener('mouseenter', handleMouseEnter);
      });
    }
    
    return () => {
      for (const cleanup of cleanupFunctions) {
        cleanup();
      }
    };
  }, []);

  // Main useEffect for all animations
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    
    // Initialize animations with staggered delays
    const timers = [
      setTimeout(animateParticles, 500),
      setTimeout(() => {
        const cleanup = animateStatus();
        if (cleanup) cleanupFunctions.push(cleanup);
      }, 1000),
      setTimeout(() => {
        const cleanup = animateCircuitSpark();
        if (cleanup) cleanupFunctions.push(cleanup);
      }, 1500),
      setTimeout(() => {
        const cleanup = setupMagneticIcons();
        if (cleanup) cleanupFunctions.push(cleanup);
      }, 200)
    ];

    return () => {
      // Clear all timers
      for (const timer of timers) {
        clearTimeout(timer);
      }
      // Execute all cleanup functions
      for (const cleanup of cleanupFunctions) {
        cleanup();
      }
    };
  }, [animateParticles, animateStatus, animateCircuitSpark, setupMagneticIcons]);

  // Particle ref callback
  const setParticleRef = useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      particlesRef.current[index] = el;
    };
  }, []);

  // Link ref callback
  const setLinkRef = useCallback((index: number) => {
    return (el: HTMLAnchorElement | null) => {
      linksRef.current[index] = el;
    };
  }, []);

  // Icon ref callback
  const setIconRef = useCallback((index: number) => {
    return (el: HTMLAnchorElement | null) => {
      iconsRef.current[index] = el;
    };
  }, []);

  // Enhanced particles with better performance
  const particles = Array.from({ length: 30 }, (_, i) => {
    const size = Math.random() > 0.7 ? 'w-1.5 h-1.5' : 'w-1 h-1';
    const opacity = 0.2 + Math.random() * 0.3;
    
    return (
      <div 
        key={`particle-${// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              i}`}
        ref={setParticleRef(i)}
        className={`absolute ${size} bg-cyan-400 rounded-full pointer-events-none`}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity,
          filter: 'blur(0.5px)',
          boxShadow: '0 0 6px rgba(6, 182, 212, 0.6)',
          willChange: 'transform'
        }}
      />
    );
  });

  return (
    <footer 
      ref={footerRef} 
      className="relative py-12 sm:py-16 lg:py-20 bg-gray-950 overflow-hidden"
      // biome-ignore lint/a11y/useSemanticElements: <explanation>
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Enhanced tech circuit pattern with spark */}
      <div className="absolute inset-0 opacity-8 sm:opacity-10 pointer-events-none" aria-hidden="true">
        {/* Vertical circuit lines */}
        <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-pulse" 
             style={{ animationDuration: '3s' }} />
        <div className="absolute left-2/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-pulse" 
             style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-pulse" 
             style={{ animationDuration: '4s', animationDelay: '1s' }} />
        
        {/* Horizontal circuit lines */}
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" 
             style={{ animationDuration: '3.5s' }} />
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" 
             style={{ animationDuration: '2.8s', animationDelay: '0.8s' }} />
        
        {/* Circuit connection nodes */}
        <div className="absolute left-1/4 top-1/3 w-2 h-2 bg-cyan-500 rounded-full opacity-60 animate-pulse" 
             style={{ animationDelay: '1s' }} />
        <div className="absolute left-2/4 top-2/3 w-2 h-2 bg-purple-500 rounded-full opacity-60 animate-pulse" 
             style={{ animationDelay: '2s' }} />
        <div className="absolute left-3/4 top-1/3 w-2 h-2 bg-cyan-500 rounded-full opacity-60 animate-pulse" 
             style={{ animationDelay: '0.5s' }} />
        
        {/* Enhanced circuit spark */}
        <div 
          ref={circuitSparkRef}
          className="absolute w-3 h-3 bg-cyan-300 rounded-full opacity-0 z-10 pointer-events-none"
          style={{
            boxShadow: '0 0 12px #67e8f9, 0 0 24px #06b6d4',
            filter: 'blur(0.5px)',
            willChange: 'transform, opacity'
          }}
          aria-hidden="true"
        />
        
        {particles}
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-10 lg:mb-16">
          {/* Logo and tagline section */}
          <div className="flex flex-col items-center md:items-start space-y-4 transform transition-all duration-700 hover:scale-105">
            <div className="flex items-center">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 relative">
                &lt;Adnan/&gt;
                <span className="absolute -inset-2 bg-gradient-to-r from-cyan-400/15 via-purple-500/15 to-pink-500/15 blur-xl rounded-lg -z-10" aria-hidden="true" />
              </span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base text-center md:text-left hover:text-gray-300 transition-colors duration-300 leading-relaxed max-w-xs">
              Building digital experiences with code, creativity, and coffee.
            </p>
          </div>
          
          {/* Navigation links */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="text-white font-semibold text-lg relative">
              <span className="relative z-10">Navigation</span>
              <span className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" aria-hidden="true" />
            </h4>
            <nav className="grid grid-cols-2 gap-x-6 gap-y-3 sm:gap-x-8" aria-label="Footer navigation">
              {navigationLinks.map((link, i) => (
                <a 
                  key={link.href}
                  ref={setLinkRef(i)}
                  href={link.href} 
                  className="text-gray-400 hover:text-cyan-400 focus:text-cyan-400 transition-all duration-300 text-sm sm:text-base relative group transform hover:translate-x-1 focus:translate-x-1 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-gray-950 rounded px-1 py-0.5"
                  style={{
                    animationDelay: `${i * 100}ms`,
                    animation: 'slideInLeft 0.6s ease-out forwards'
                  }}
                >
                  {link.text}
                  <span 
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 group-hover:w-full group-focus:w-full" 
                    aria-hidden="true"
                  />
                </a>
              ))}
            </nav>
          </div>
          
          {/* Contact section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="text-white font-semibold text-lg relative">
              <span className="relative z-10">Follow me on</span>
              <span className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" aria-hidden="true" />
            </h4>
            {/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
            <div className="flex gap-3 sm:gap-4" role="list">
              {socialLinks.map((social, i) => (
                <Link
                  key={social.href}
                  ref={setIconRef(i)}
                  href={social.href}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gray-800 ${social.color} text-cyan-400 rounded-xl transition-all duration-300 relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-gray-950`}
                  style={{
                    boxShadow: '0 4px 20px rgba(6, 182, 212, 0.15)',
                    willChange: 'transform'
                  }}
                  aria-label={`Visit ${social.label} profile`}
                  // biome-ignore lint/a11y/useSemanticElements: <explanation>
                  role="listitem"
                >
                  <social.icon size={20} />
                  <div 
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300" 
                    aria-hidden="true"
                  />
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
            <a 
              href="mailto:contact@adnanthecoder.com"
              className="text-gray-400 text-sm sm:text-base text-center md:text-left hover:text-cyan-400 focus:text-cyan-400 transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-gray-950 rounded px-2 py-1"
              aria-label="Send email to contact@adnanthecoder.com"
            >
              contact@AdnanTheCoder.com
            </a>
          </div>
        </div>
        
        {/* Enhanced bottom section */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800 flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-gray-500 text-sm">
            <span 
              ref={statusRef}
              className="relative px-3 py-2 bg-gray-900 rounded-lg flex items-center border border-gray-700 hover:border-cyan-500/50 focus-within:border-cyan-500/50 transition-colors group"
              // biome-ignore lint/a11y/useSemanticElements: <explanation>
              role="status"
              aria-live="polite"
            >
              <span 
                className="status-dot absolute -top-1 -left-1 w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-lg transition-all duration-300" 
                aria-hidden="true"
              />
              <BiCodeAlt className="mr-2 text-cyan-500 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
              <span className="group-hover:text-cyan-400 transition-colors duration-200">Status: Available</span>
            </span>
            <span>&copy; {currentYear} Syed Adnan Ali. All rights reserved.</span>
          </div>
          <div className="flex items-center text-gray-600 text-xs sm:text-sm space-x-1">
            <span className="flex items-center hover:text-cyan-400 focus:text-cyan-400 transition-colors duration-200">
              <FaCode className="mr-1" aria-hidden="true" />
              <span>crafted with</span>
              <span className="text-red-500 mx-1 animate-pulse" aria-hidden="true">❤</span>
              <span className="mr-2">by Adnan</span>
            </span>
            <span className="hidden sm:flex items-center border-l border-gray-700 pl-2 hover:text-cyan-400 focus:text-cyan-400 transition-colors duration-200">
              <FaServer className="mr-1" aria-hidden="true" />
              <span>v2.1.0</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Enhanced multi-layered glow effects */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-sm animate-pulse" aria-hidden="true" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-sm animate-pulse" style={{ animationDelay: '1s' }} aria-hidden="true" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-2 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} aria-hidden="true" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }} aria-hidden="true" />
      
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;