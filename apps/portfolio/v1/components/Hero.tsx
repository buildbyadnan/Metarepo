"use client";
import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';

// This is the upgraded Hero component with enhanced 3D tech glitch effect
function Hero() {
  const controls = useAnimation();
  const homeRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Scroll animations
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const translateY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  
  // Animation on load
  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
    
    // Small delay to ensure CSS animations trigger properly
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [controls]);
  
  return (
    <section id="home" ref={homeRef} className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-black">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80 z-0"></div>
      {/* Animated code lines in background */}
      <div className="absolute inset-0 opacity-20 z-0">
        <div className="code-rain"></div>
      </div>
      {/* Hexagon grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('https://adnanthecoder.com/assets/hexagon-grid.png')] bg-repeat opacity-5 z-0"></div>
      <motion.div 
        className="container mx-auto px-6 py-24 text-center relative z-10"
        initial={{ opacity: 0 }}
        animate={controls}
        transition={{ duration: 1 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Enhanced 3D Tech Glitch effect on name */}
          <motion.div
            className="tech-glitch-wrapper mb-4 perspective-1000"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className={`text-4xl md:text-6xl font-bold text-white relative ${isLoaded ? 'tech-glitch-text' : ''}`}>
              <span className="tech-bracket text-gray-300 relative">{"<"}</span>
              <span className="tech-intro relative">Hi, I'm </span> 
              <span className="tech-name relative">
                <span className={`tech-name-text font-mono ${isLoaded ? 'tech-glitch-active' : ''}`}>Syed Adnan Ali</span>
                {isLoaded && (
                  <>
                    <span className="tech-name-ghost tech-ghost-1 font-mono">Syed Adnan Ali</span>
                    <span className="tech-name-ghost tech-ghost-2 font-mono">Syed Adnan Ali</span>
                    <span className="tech-highlight"></span>
                    <span className="tech-scan-line"></span>
                  </>
                )}
              </span>
              <span className="tech-bracket text-gray-300 relative">{"/"}</span>
              <span className="tech-bracket text-gray-300 relative">{">"}</span>
              {/* Decorative elements */}
              <span className="tech-corner tech-corner-tl"></span>
              <span className="tech-corner tech-corner-tr"></span>
              <span className="tech-corner tech-corner-bl"></span>
              <span className="tech-corner tech-corner-br"></span>
              {/* Digital noise overlay */}
              <span className="tech-digital-noise"></span>
            </h1>
          </motion.div>
          {/* Terminal-style typewriter effect */}
          <motion.div 
            className="flex justify-center items-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className="text-green-500 mr-2 font-mono tech-prompt">$</span>
            <h2 className="text-xl md:text-3xl font-mono text-gray-300 tech-typewriter">
              Software_Developer.exe
              <span className="text-green-500 tech-cursor">_</span>
            </h2>
          </motion.div>
          <motion.div 
            className="bg-gray-900/70 backdrop-blur-sm border border-green-500/30 rounded-lg p-6 mb-8 max-w-3xl mx-auto terminal-box shadow-lg shadow-green-500/10 relative tech-terminal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="tech-terminal-header absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/0 via-green-500/70 to-green-500/0"></div>
            <p className="text-lg text-gray-400 font-mono text-left">
              <span className="text-green-400">{">"}</span> A passionate full-stack developer and founder of 
              <span className="text-cyan-400"> Electroplix</span>, currently pursuing a degree in 
              <span className="text-cyan-400"> Computer Science Engineering</span>, with hands-on experience in building 
              <span className="text-green-400"> scalable</span> and <span className="text-green-400">dynamic</span> end-to-end applications.
            </p>
            <div className="tech-terminal-scan absolute top-0 left-0 right-0 bottom-0 pointer-events-none"></div>
          </motion.div>
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <a 
              href="#projects" 
              className="bg-green-500 hover:bg-green-600 text-gray-900 font-mono font-bold px-8 py-3 rounded transition-all flex items-center gap-2 border border-green-400 hover:shadow-lg hover:shadow-green-500/30 tech-button"
            >
              <span>{'{'}</span> VIEW_PROJECTS <span>{'}'}</span>
              <span className="tech-button-glow"></span>
            </a>
            <a 
              href="#contact" 
              className="bg-transparent border-2 border-green-500 text-green-400 hover:bg-green-500/10 font-mono font-bold px-8 py-3 rounded transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/20 tech-button-outline"
            >
              <span>{'['}</span> CONTACT <span>{']'}</span>
              <span className="tech-button-glow"></span>
            </a>
          </motion.div>
          <motion.div 
            className="mt-16"
            style={{ opacity: opacity, y: translateY }}
          >
            <p className="text-gray-500 mb-4 font-mono">./scroll_to_explore.sh</p>
            <div className="w-6 h-10 border-2 border-green-500/50 rounded-full mx-auto relative tech-scroll-indicator">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mx-auto animate-bounce mt-2"></div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default Hero;