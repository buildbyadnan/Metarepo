"use client";

import { useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  FaGithub,
  FaServer,
  FaDatabase,
  FaReact,
  FaNode,
  FaCode,
  FaJava,
  FaPython,
  FaCar,
  FaVideo,
  FaBook,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiPrisma,
  SiTypescript,
  SiJavascript,
  SiMongodb,
  SiPostgresql,
  SiSupabase,
  SiCloudflare,
  SiTailwindcss,
  SiC,
  SiGooglecloud,
  SiBlockchaindotcom,
  SiReactivex,
  SiBlender,
} from "react-icons/si";
import { MdApi } from "react-icons/md";
import { GiBrain, GiCube, GiJetFighter } from "react-icons/gi";
import Image from "next/image";

import Contact from "./Contact";
import About from "./About";
import Experience from "./Experience";
import Footer from "./Footer";
import CyberParticleBackground from "./CyberParticleBG";
import Hero from "./Hero";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";


export default function Portfolio() {
  const controls = useAnimation();

  // Refs for each section
  const projectsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  // Animation on load
  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <>
      <CyberParticleBackground />
      {/* Hero Section */}
      <Hero />
      {/* About Section */}
      <About />
      {/* Projects Section */}
      <section
        id="projects"
        ref={projectsRef}
        className="py-20 md:py-32 bg-linear-to-b from-gray-900/50 to-gray-950/50"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              My <span className="text-cyan-400">Projects</span>
            </h2>
            <p className="text-gray-400">
              Here are some of my recent projects and startup ventures
            </p>
          </motion.div>
          {/* Featured Project */}
          {projects
            .filter((p) => p.featured)
            .map((project, index) => (
              <motion.div
                key={`featured-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl mx-auto mb-20 bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative h-64 md:h-full">
                    <div className="absolute inset-0 bg-cyan-500/20"></div>
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-8 flex flex-col">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-bold text-white">
                          {project.title}
                        </h3>
                        {project.githubLink && project.githubLink !== "" && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-cyan-400 transition-colors"
                            title="View Source Code"
                          >
                            <FaGithub size={20} />
                          </a>
                        )}
                        {project.githubLink === "" && (
                          <span className="text-xs text-gray-500 italic">
                            Source code coming soon
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 mb-6">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.tech.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-medium px-6 py-2 rounded-full self-start transition-all"
                    >
                      Visit Project
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          {/* Other Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects
              .filter((p) => !p.featured)
              .map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-800 flex flex-col h-full hover:shadow-cyan-500/5 hover:border-cyan-500/30 transition-all"
                >
                  <div className="relative h-48">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-bold text-white">
                        {project.title}
                      </h3>
                      {project.githubLink && project.githubLink !== "" && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-cyan-400 transition-colors"
                          title="View Source Code"
                        >
                          <FaGithub size={18} />
                        </a>
                      )}
                      {project.githubLink === "" && (
                        <span className="text-xs gap-1 text-gray-500 italic">
                          Source code coming soon
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-4 flex-1">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tech.map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-2 transition-colors"
                    >
                      View Project
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </section>
      {/* Skills Section */}
      <section id="skills" ref={skillsRef} className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Technical <span className="text-cyan-400">Skills</span>
            </h2>
            <p className="text-gray-400">
              My expertise across the full stack development spectrum
            </p>
          </motion.div>
          <div className="max-w-5xl mx-auto">
            {/* Frontend */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FaReact />
                </span>
                Frontend Development
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {skills.frontend.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{skill.icon}</span>
                        <span className="font-medium text-white">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-linear-to-r from-cyan-400 to-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            {/* Backend */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FaNode />
                </span>
                Backend Development
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {skills.backend.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{skill.icon}</span>
                        <span className="font-medium text-white">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-linear-to-r from-cyan-400 to-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            {/* Database */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FaDatabase />
                </span>
                Database & Storage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {skills.database.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{skill.icon}</span>
                        <span className="font-medium text-white">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-linear-to-r from-cyan-400 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            {/* Infrastructure */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FaServer />
                </span>
                Infrastructure & Deployment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {skills.infrastructure.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{skill.icon}</span>
                        <span className="font-medium text-white">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-linear-to-r from-cyan-400 to-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Education Section */}
      <section id="education" className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              <span className="text-cyan-400">Education</span>
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-800 p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                Bachelor of Engineering in Computer Science and Engineering
              </h3>
              <p className="text-lg text-cyan-400 mb-4">
                Muffakham Jah College of Engineering & Technology
              </p>
              <div className="flex justify-between items-center">
                <p className="text-gray-300">2024 - 2028</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Experience Section */}
      <Experience />
      {/* Achievements Section */}
      <section
        id="achievements"
        className="py-20 md:py-32 bg-linear-to-b from-gray-900/50 to-gray-950/50"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              <span className="text-cyan-400">Achievements</span>
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-800 p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                TS EAMCET 2024
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Score</p>
                  <p className="text-cyan-400 font-bold">Top 2%</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Rank</p>
                  <p className="text-cyan-400 font-bold">
                    6365 out of 2,40,617
                  </p>
                </div>
              </div>
              <p className="text-gray-400 mt-4 text-sm">May 2024</p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Hobbies Section */}
      <section id="hobbies" className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              <span className="text-cyan-400">Hobbies</span>
            </h2>
          </motion.div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                // { name: "Python Development", icon: <FaPython className="text-[#3776AB] text-3xl" /> },
                {
                  name: "Book Reading",
                  icon: <FaBook className="text-[#795548] text-3xl" />,
                },
                {
                  name: "Jet Engine Design",
                  icon: <GiJetFighter className="text-gray-300 text-3xl" />,
                },
                {
                  name: "Automobile Designing",
                  icon: <FaCar className="text-red-500 text-3xl" />,
                },
                {
                  name: "Blender",
                  icon: <SiBlender className="text-orange-500 text-3xl" />,
                },
                {
                  name: "Video Editing",
                  icon: <FaVideo className="text-purple-500 text-3xl" />,
                },
                {
                  name: "Rubik's Cube",
                  icon: <GiCube className="text-yellow-500 text-3xl" />,
                },
              ].map((hobby, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800 flex flex-col items-center text-center"
                >
                  <div className="mb-3">{hobby.icon}</div>
                  <h3 className="text-white font-medium text-sm">
                    {hobby.name}
                  </h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Career Objective Section */}
      <section
        id="career"
        className="py-20 md:py-32 bg-linear-to-b from-gray-900/50 to-gray-950/50"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Career <span className="text-cyan-400">Objective</span>
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-800 p-8"
            >
              <p className="text-gray-300 leading-relaxed text-lg">
                Seeking a rewarding position within a dynamic organization where
                I can leverage my existing experience to contribute effectively,
                while also cultivating new skills and knowledge through
                collaboration with professionals.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <Contact />
      {/* Footer */}
      <Footer />
    </>
  );
}
