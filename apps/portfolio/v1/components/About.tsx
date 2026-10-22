import {motion} from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { FaGithub,FaLinkedin, FaEnvelope } from 'react-icons/fa';

function About() {
  const aboutRef = useRef<HTMLDivElement>(null);
    
  return (
    <section id="about" ref={aboutRef} className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white text-center">
            About <span className="text-cyan-400">Me</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-2">
              <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full overflow-hidden border-4 border-cyan-500/20">
                <Image 
                  src="/assets/about_img.jpg" 
                  alt="Adnan" 
                  fill 
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/300?text=Avatar";
                  }}
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">
                Software Developer & Founder
              </h3>
              <p className="text-gray-300 mb-6">
                A passionate full-stack developer and founder of Electroplix, currently pursuing a degree in Computer Science Engineering, with hands-on experience in building scalable and dynamic end-to-end applications.
              </p>
              <p className="text-gray-300 mb-6">
                Proficient in modern technologies including React.js, Next.js, Node.js, BunJS, HonoJS, Elysia, and database solutions like NeonDB, Supabase, PostgreSQL, and MongoDB.
              </p>
              <p className="text-gray-300 mb-8">
                Skilled in deploying serverless architectures using Cloudflare Workers, combining strong technical foundations with creative problem-solving to craft efficient, high-impact digital solutions.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com/Adnan-The-Coder" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FaGithub size={24} />
                </a>
                <a href="https://linkedin.com/in/syedadnanali99" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FaLinkedin size={24} />
                </a>
                <a href="mailto:syedadnanali0106@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                  <FaEnvelope size={24} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default About
