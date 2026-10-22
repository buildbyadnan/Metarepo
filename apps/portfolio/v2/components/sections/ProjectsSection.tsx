"use client";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import projects from "@/data/projects.json";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  year: number;
  description: string;
  tech: string[];
  links: { site: string | null; repo: string | null };
};

export default function ProjectsSection() {
  return (
    <Section id="projects" title="Projects" subtitle="Selected work and experiments">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes border-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .projects-grid {
          display: grid;
          gap: 1.75rem;
          grid-template-columns: 1fr;
          animation: fade-in-up 0.8s ease-out;
        }

        @media (min-width: 640px) {
          .projects-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .projects-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .projects-grid > :nth-child(1) { animation-delay: 0.1s; }
        .projects-grid > :nth-child(2) { animation-delay: 0.2s; }
        .projects-grid > :nth-child(3) { animation-delay: 0.3s; }
        .projects-grid > :nth-child(4) { animation-delay: 0.4s; }
        .projects-grid > :nth-child(5) { animation-delay: 0.5s; }
        .projects-grid > :nth-child(6) { animation-delay: 0.6s; }

        .project-card {
          position: relative;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
          border-radius: 1rem;
          padding: 1.75rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          animation: fade-in-up 0.6s ease-out backwards;
        }

        .project-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          padding: 2px;
          background: linear-gradient(
            45deg,
            rgba(6, 182, 212, 0.4),
            rgba(168, 85, 247, 0.4),
            rgba(236, 72, 153, 0.4),
            rgba(251, 146, 60, 0.4),
            rgba(6, 182, 212, 0.4)
          );
          background-size: 300% 300%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: border-flow 4s ease infinite;
          opacity: 0.6;
          transition: opacity 0.4s ease;
        }

        .project-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(6, 182, 212, 0.08) 0%,
            transparent 50%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .project-card:hover {
          transform: translateY(-8px);
          box-shadow: 
            0 20px 50px -12px rgba(6, 182, 212, 0.25),
            0 0 0 1px rgba(6, 182, 212, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .project-card:hover::before {
          opacity: 1;
          animation: border-flow 2s ease infinite;
        }

        .project-card:hover::after {
          opacity: 1;
        }

        .card-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: 
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.05) 10px,
              rgba(255, 255, 255, 0.05) 20px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.05) 10px,
              rgba(255, 255, 255, 0.05) 20px
            );
          pointer-events: none;
        }

        .card-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(6, 182, 212, 0.8),
            transparent
          );
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .project-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
          margin-bottom: 1rem;
        }

        .project-title {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.025em;
        }

        .project-year {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
          padding: 0.25rem 0.625rem;
          background: rgba(100, 116, 139, 0.1);
          border-radius: 0.375rem;
          border: 1px solid rgba(100, 116, 139, 0.2);
        }

        .project-description {
          color: #94a3b8;
          font-size: 0.9375rem;
          line-height: 1.6;
          position: relative;
          z-index: 1;
          margin-bottom: 1rem;
        }

        .tech-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
          position: relative;
          z-index: 1;
        }

        .tech-tag {
          font-size: 0.75rem;
          padding: 0.375rem 0.75rem;
          background: rgba(6, 182, 212, 0.1);
          color: #67e8f9;
          border-radius: 0.375rem;
          border: 1px solid rgba(6, 182, 212, 0.3);
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .tech-tag::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s ease;
        }

        .project-card:hover .tech-tag::before {
          left: 100%;
        }

        .tech-tag:hover {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }

        .project-links {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .project-link {
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          text-decoration: none;
        }

        .project-link.primary {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2));
          color: #67e8f9;
          border: 1px solid rgba(6, 182, 212, 0.4);
        }

        .project-link.secondary {
          background: rgba(148, 163, 184, 0.1);
          color: #cbd5e1;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .project-link::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .project-link:hover::after {
          opacity: 1;
        }

        .project-link.primary:hover {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(168, 85, 247, 0.3));
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 
            0 8px 20px rgba(6, 182, 212, 0.3),
            0 0 20px rgba(6, 182, 212, 0.2);
          transform: translateY(-2px);
        }

        .project-link.secondary:hover {
          background: rgba(148, 163, 184, 0.2);
          border-color: rgba(148, 163, 184, 0.5);
          transform: translateY(-2px);
        }

        .corner-accent {
          position: absolute;
          width: 40px;
          height: 40px;
          opacity: 0.3;
          transition: opacity 0.4s ease;
        }

        .corner-accent.top-right {
          top: 0;
          right: 0;
          background: linear-gradient(
            to bottom left,
            rgba(168, 85, 247, 0.4),
            transparent
          );
          border-top-right-radius: 1rem;
        }

        .corner-accent.bottom-left {
          bottom: 0;
          left: 0;
          background: linear-gradient(
            to top right,
            rgba(6, 182, 212, 0.4),
            transparent
          );
          border-bottom-left-radius: 1rem;
        }

        .project-card:hover .corner-accent {
          opacity: 0.6;
        }
      `}</style>

      <div className="projects-grid">
        {(projects as Project[]).map((p) => (
          <div key={p.id} className="project-card">
            <div className="card-pattern"></div>
            <div className="card-glow"></div>
            <div className="corner-accent top-right"></div>
            <div className="corner-accent bottom-left"></div>
            
            <div className="project-header">
              <h3 className="project-title">{p.name}</h3>
              <span className="project-year">{p.year}</span>
            </div>
            
            <p className="project-description">{p.description}</p>
            
            <div className="tech-stack">
              {p.tech.map((t) => (
                <span key={t} className="tech-tag">{t}</span>
              ))}
            </div>
            
            <div className="project-links">
              {p.links.site && (
                <Link 
                  className="project-link primary" 
                  href={p.links.site} 
                  target="_blank"
                >
                  Visit Site
                </Link>
              )}
              {p.links.repo && (
                <Link 
                  className="project-link secondary" 
                  href={p.links.repo} 
                  target="_blank"
                >
                  View Code
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}