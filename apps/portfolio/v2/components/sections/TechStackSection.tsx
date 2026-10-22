"use client";

import { useState } from "react";
import Section from "@/components/ui/Section";
import stackData from "@/data/tech-stack.json";
import {
  SiTypescript, SiJavascript, SiPython, SiC,
  SiHtml5, SiCss3, SiReact, SiNextdotjs, SiVuedotjs, SiTailwindcss,
  SiNodedotjs, SiExpress, SiFastapi, SiDjango, SiBun,
  SiPostgresql, SiMysql, SiMongodb, SiRedis, SiSupabase, SiFirebase, SiPrisma,
  SiAmazonwebservices, SiGooglecloud, SiCloudflare, SiVercel, SiNetlify,
  SiDocker, SiKubernetes, SiApachekafka, SiGithub, SiTerraform, SiGit, SiLinux, SiGnubash,
  SiPostman, SiFigma, SiNotion, SiArduino
} from "react-icons/si";
import { VscAzure, VscCode } from "react-icons/vsc";
import { FaJava, FaCode, FaServer, FaDatabase, FaCloud, FaPalette, FaWrench, FaToolbox, FaBolt, FaCog } from "react-icons/fa";
import { DiRust } from "react-icons/di";

type TechItem = { name: string; level: number; iconKey: string; color: string };
type Category = { name: string; icon: string; items: TechItem[] };

// Icon mapping with proper colors
const iconMap: Record<string, { icon: React.ReactNode; gradient: string }> = {
  typescript: { icon: <SiTypescript />, gradient: "from-blue-400 to-blue-600" },
  javascript: { icon: <SiJavascript />, gradient: "from-yellow-400 to-yellow-500" },
  python: { icon: <SiPython />, gradient: "from-blue-400 to-yellow-400" },
  java: { icon: <FaJava />, gradient: "from-orange-500 to-red-500" },
  rust: { icon: <DiRust />, gradient: "from-orange-400 to-orange-600" },
  c: { icon: <SiC />, gradient: "from-blue-500 to-blue-700" },
  html: { icon: <SiHtml5 />, gradient: "from-orange-500 to-orange-600" },
  css: { icon: <SiCss3 />, gradient: "from-blue-400 to-blue-600" },
  react: { icon: <SiReact />, gradient: "from-cyan-400 to-cyan-500" },
  reactnative: { icon: <SiReact />, gradient: "from-cyan-400 to-purple-500" },
  nextjs: { icon: <SiNextdotjs />, gradient: "from-slate-200 to-slate-400" },
  vue: { icon: <SiVuedotjs />, gradient: "from-green-400 to-green-600" },
  tailwind: { icon: <SiTailwindcss />, gradient: "from-cyan-400 to-cyan-500" },
  qt: { icon: <FaCode />, gradient: "from-green-400 to-green-600" },
  nodejs: { icon: <SiNodedotjs />, gradient: "from-green-500 to-green-600" },
  express: { icon: <SiExpress />, gradient: "from-slate-300 to-slate-500" },
  fastapi: { icon: <SiFastapi />, gradient: "from-teal-400 to-teal-600" },
  django: { icon: <SiDjango />, gradient: "from-green-600 to-green-800" },
  bun: { icon: <SiBun />, gradient: "from-pink-300 to-pink-500" },
  hono: { icon: <FaBolt />, gradient: "from-orange-400 to-orange-600" },
  elysia: { icon: <FaServer />, gradient: "from-purple-400 to-purple-600" },
  fastify: { icon: <FaBolt />, gradient: "from-slate-200 to-slate-400" },
  postgres: { icon: <SiPostgresql />, gradient: "from-blue-400 to-blue-600" },
  mysql: { icon: <SiMysql />, gradient: "from-blue-500 to-orange-500" },
  mongodb: { icon: <SiMongodb />, gradient: "from-green-400 to-green-600" },
  redis: { icon: <SiRedis />, gradient: "from-red-400 to-red-600" },
  supabase: { icon: <SiSupabase />, gradient: "from-emerald-400 to-emerald-600" },
  firebase: { icon: <SiFirebase />, gradient: "from-yellow-400 to-orange-500" },
  neon: { icon: <FaDatabase />, gradient: "from-green-400 to-cyan-400" },
  cloudflare: { icon: <SiCloudflare />, gradient: "from-orange-400 to-orange-500" },
  aws: { icon: <SiAmazonwebservices />, gradient: "from-orange-400 to-orange-600" },
  prisma: { icon: <SiPrisma />, gradient: "from-slate-200 to-slate-400" },
  drizzle: { icon: <FaDatabase />, gradient: "from-green-400 to-lime-400" },
  gcp: { icon: <SiGooglecloud />, gradient: "from-blue-400 via-green-400 to-yellow-400" },
  azure: { icon: <VscAzure />, gradient: "from-blue-400 to-blue-600" },
  vercel: { icon: <SiVercel />, gradient: "from-slate-200 to-slate-400" },
  netlify: { icon: <SiNetlify />, gradient: "from-teal-400 to-teal-600" },
  render: { icon: <FaCloud />, gradient: "from-teal-400 to-cyan-400" },
  docker: { icon: <SiDocker />, gradient: "from-blue-400 to-blue-600" },
  kubernetes: { icon: <SiKubernetes />, gradient: "from-blue-400 to-blue-600" },
  kafka: { icon: <SiApachekafka />, gradient: "from-slate-300 to-slate-500" },
  github: { icon: <SiGithub />, gradient: "from-slate-200 to-slate-400" },
  terraform: { icon: <SiTerraform />, gradient: "from-purple-400 to-purple-600" },
  git: { icon: <SiGit />, gradient: "from-orange-500 to-orange-600" },
  linux: { icon: <SiLinux />, gradient: "from-yellow-400 to-yellow-500" },
  bash: { icon: <SiGnubash />, gradient: "from-green-400 to-green-600" },
  vscode: { icon: <VscCode />, gradient: "from-blue-400 to-blue-600" },
  postman: { icon: <SiPostman />, gradient: "from-orange-400 to-orange-600" },
  figma: { icon: <SiFigma />, gradient: "from-purple-400 via-pink-400 to-orange-400" },
  notion: { icon: <SiNotion />, gradient: "from-slate-200 to-slate-400" },
  arduino: { icon: <SiArduino />, gradient: "from-teal-400 to-teal-600" },
};

const categoryIcons: Record<string, React.ReactNode> = {
  code: <FaCode />,
  palette: <FaPalette />,
  server: <FaServer />,
  database: <FaDatabase />,
  cloud: <FaCloud />,
  wrench: <FaWrench />,
  toolbox: <FaToolbox />,
  tools: <FaCog />,
};

function TechCard({ item, index }: { item: TechItem; index: number }) {
  const iconData = iconMap[item.iconKey] || { icon: <FaCode />, gradient: "from-slate-400 to-slate-600" };
  const pct = Math.max(10, Math.min(100, item.level));

  return (
    <div
      className="group relative"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative flex flex-col items-center p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-800/50 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-cyan-500/0 to-purple-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        
        {/* Icon with gradient background */}
        <div className={`relative flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${iconData.gradient} p-0.5 mb-3`}>
          <div className="flex items-center justify-center w-full h-full rounded-[10px] bg-slate-900 text-2xl text-white">
            {iconData.icon}
          </div>
        </div>

        {/* Name */}
        <span className="text-sm font-medium text-slate-200 text-center mb-2 group-hover:text-white transition-colors">
          {item.name}
        </span>

        {/* Skill level bar */}
        <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${iconData.gradient} transition-all duration-500 group-hover:shadow-sm`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Level percentage on hover */}
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className={`text-xs font-mono font-bold bg-gradient-to-r ${iconData.gradient} bg-clip-text text-transparent`}>
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category, isActive, onToggle }: { category: Category; isActive: boolean; onToggle: () => void }) {
  const categoryIcon = categoryIcons[category.icon] || <FaCode />;

  return (
    <div className="mb-8">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 mb-4 group cursor-pointer"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
          {categoryIcon}
        </div>
        <h3 className="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors">
          {category.name}
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent" />
        <span className="text-xs text-slate-500 font-mono">
          {category.items.length} skills
        </span>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isActive ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Tech Grid */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 overflow-hidden transition-all duration-500 ${
          isActive ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {category.items.map((item, index) => (
          <TechCard key={item.name} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

export default function TechStackSection() {
  const categories = stackData.categories as Category[];
  const [activeCategories, setActiveCategories] = useState<Set<number>>(
    new Set(categories.map((_, i) => i))
  );

  const toggleCategory = (index: number) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () => setActiveCategories(new Set(categories.map((_, i) => i)));
  const collapseAll = () => setActiveCategories(new Set());

  return (
    <Section
      id="skills"
      title="Tech Stack"
      subtitle="A comprehensive toolkit spanning full-stack development, cloud infrastructure, and DevOps"
    >
      {/* Expand/Collapse Controls */}
      <div className="flex justify-end gap-2 mb-6">
        <button
          onClick={expandAll}
          className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
        >
          Collapse All
        </button>
      </div>

      {/* Category Sections */}
      <div className="space-y-2">
        {categories.map((category, index) => (
          <CategorySection
            key={category.name}
            category={category}
            isActive={activeCategories.has(index)}
            onToggle={() => toggleCategory(index)}
          />
        ))}
      </div>
    </Section>
  );
}
