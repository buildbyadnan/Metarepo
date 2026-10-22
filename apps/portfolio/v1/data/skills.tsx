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
  SiApachekafka,
  SiGithub,
} from "react-icons/si";
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
  FaDocker,
} from "react-icons/fa";
import { MdApi } from "react-icons/md";
import { GiBrain, GiCube, GiJetFighter } from "react-icons/gi";
import { BiGitBranch } from "react-icons/bi";

export const skills = {
  frontend: [
    { name: "React", icon: <FaReact className="text-[#61DAFB]" />, level: 93 },
    {
      name: "Next.js",
      icon: <SiNextdotjs className="text-white" />,
      level: 94,
    },
    {
      name: "TypeScript",
      icon: <SiTypescript className="text-[#3178C6]" />,
      level: 78,
    },
    {
      name: "JavaScript",
      icon: <SiJavascript className="text-[#F7DF1E]" />,
      level: 87,
    },
    {
      name: "HTML/CSS",
      icon: <FaCode className="text-orange-400" />,
      level: 80,
    },
    {
      name: "TailwindCSS",
      icon: <SiTailwindcss className="text-[#38B2AC]" />,
      level: 90,
    },
  ],
  backend: [
    { name: "Node.js", icon: <FaNode className="text-[#68A063]" />, level: 70 },
    { name: "BunJS", icon: "🧄", level: 95 },
    { name: "HonoJS", icon: "🔥", level: 87 },
    { name: "Elysia", icon: "🏝️", level: 60 },
    { name: "Java", icon: <FaJava className="text-[#007396]" />, level: 24 },
    {
      name: "Python",
      icon: <FaPython className="text-[#3776AB]" />,
      level: 90,
    },
    { name: "C", icon: <SiC className="text-[#A8B9CC]" />, level: 85 },
  ],
  database: [
    {
      name: "MongoDB",
      icon: <SiMongodb className="text-[#47A248]" />,
      level: 75,
    },
    {
      name: "D1 Database",
      icon: <SiCloudflare className="text-orange-500" />,
      level: 95,
    },
    {
      name: "Supabase",
      icon: <SiSupabase className="text-[#3ECF8E]" />,
      level: 85,
    },
    {
      name: "NeonDB",
      icon: <FaDatabase className="text-[#00E699]" />,
      level: 60,
    },
    {
      name: "Drizzle ORM",
      icon: <SiReactivex className="text-[#B7178C]" />,
      level: 95,
    },
    {
      name: "Prisma ORM",
      icon: <SiPrisma className="text-[#B7178C]" />,
      level: 55,
    },
  ],
  infrastructure: [
    {
      name: "Cloudflare",
      icon: <SiCloudflare className="text-[#F6821F]" />,
      level: 90,
    },
    { name: "Docker", icon: <FaDocker className="text-[#2496ED]" />, level: 82 },
    { name: "Redis", icon: <FaDatabase className="text-[#D82C2C]" />, level: 75 },
    { name: "GitHub Actions", icon: <SiGithub className="text-white" />, level: 86 },
    { name: "CI/CD Pipelines", icon: <BiGitBranch className="text-[#F05032]" />, level: 74 },
    { name: "Apache Kafka", icon: <SiApachekafka className="text-[#231F20]" />, level: 58 },
    {
      name: "Google Cloud",
      icon: <SiGooglecloud className="text-[#4285F4]" />,
      level: 40,
    },
    {
      name: "API Development",
      icon: <MdApi className="text-[#00C853]" />,
      level: 95,
    },
    {
      name: "Blockchain",
      icon: <SiBlockchaindotcom className="text-[#121D33]" />,
      level: 40,
    },
    {
      name: "AI Integration",
      icon: <GiBrain className="text-[#FF6B6B]" />,
      level: 75,
    },
    {
      name: "Web Hosting",
      icon: <FaServer className="text-[#FD5750]" />,
      level: 90,
    },
  ],
};