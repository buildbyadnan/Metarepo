import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin,FaInstagram, FaCode, FaServer } from 'react-icons/fa';
import { BiCodeAlt } from 'react-icons/bi';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.2, rotate: 5, transition: { type: "spring" as const, stiffness: 400 } }
  };

  // Particle elements for tech aesthetic
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div 
      key={i}
      className="absolute w-1 h-1 bg-cyan-500 rounded-full opacity-30"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `pulse ${2 + Math.random() * 4}s infinite ${Math.random() * 2}s ease-in-out`
      }}
    />
  ));

  return (
    <footer className="relative py-16 bg-gray-950 overflow-hidden">
      {/* Tech circuit pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
        <div className="absolute left-2/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
        <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        {particles}
      </div>
      <div className="container relative mx-auto px-6">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Logo and tagline section */}
          <motion.div variants={itemVariants} className="flex flex-col items-center md:items-start">
            <div className="mb-4 flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                &lt;Adnan/&gt;
              </span>
            </div>
            <p className="text-gray-400 text-sm text-center md:text-left">
              Building digital experiences with code, creativity, and coffee.
            </p>
          </motion.div>
          {/* Quick links */}
          <motion.div variants={itemVariants} className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-medium mb-4 relative">
              <span className="relative z-10">Navigation</span>
              <span className="absolute -bottom-1 left-0 w-12 h-1 bg-cyan-500"></span>
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <a href="#home" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Home</a>
              <a href="#about" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">About</a>
              <a href="#projects" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Projects</a>
              <a href="#experience" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Experience</a>
              <a href="#skills" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Skills</a>
              <a href="#contact" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Contact</a>
            </div>
          </motion.div>
          {/* Contact section */}
          <motion.div variants={itemVariants} className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-medium mb-4 relative">
              <span className="relative z-10">Connect</span>
              <span className="absolute -bottom-1 left-0 w-12 h-1 bg-cyan-500"></span>
            </h4>
            <div className="flex gap-2 mb-4">
              <motion.a 
                href="https://github.com/Adnan-The-Coder" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg transition-colors"
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
              >
                <FaGithub size={18} />
              </motion.a>
              <motion.a 
                href="https://linkedin.com/in/syedadnanali99" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg transition-colors"
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
              >
                <FaLinkedin size={18} />
              </motion.a>
              <motion.a 
                href="https://www.instagram.com/adnan_the_coder" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg transition-colors"
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
              >
                <FaInstagram size={18} />
              </motion.a>
            </div>
            <p className="text-gray-400 text-sm text-center md:text-left">
              syedadnanali0106@gmail.com
            </p>
          </motion.div>
        </motion.div>
        {/* Bottom section with copyright */}
        <motion.div 
          className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1, transition: { delay: 0.5 } }}
          viewport={{ once: true }}
        >
          <p className="flex items-center text-gray-500 text-sm mb-4 md:mb-0">
            <span className="relative px-2 py-1 bg-gray-900 rounded-md mr-2 flex items-center">
              <span className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
              <BiCodeAlt className="mr-1 text-cyan-500" />
              <span>Status: Busy</span>
            </span>
            &copy; {currentYear} Syed Adnan Ali
          </p>
          <div className="flex items-center text-gray-600 text-xs">
            <span className="flex items-center">
              <FaCode className="mr-1" />
              <span>with</span>
              <span className="text-red-500 mx-1">❤</span>
              <span className="mr-2">by Adnan</span>
            </span>
            <span className="hidden md:flex items-center border-l border-gray-700 pl-2">
              <FaServer className="mr-1" />
              <span>v2.0.0</span>
            </span>
          </div>
        </motion.div>
      </div>
      {/* Animated glow effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-sm"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-sm"></div>
    </footer>
  );
}

export default Footer;