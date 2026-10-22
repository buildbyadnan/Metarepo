"use client";

import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Bookings from "@/components/Bookings";
import { useMemo, useState } from "react";
import availabilityData from "@/data/availability.json";

/* ─── Skill Card ─────────────────────────────────────────── */
const SKILLS = [
  {
    label: "Distributed Systems",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
        <path d="M12 7v4M12 11l-5 6M12 11l5 6"/>
      </svg>
    ),
    desc: "Fault-tolerant at scale",
  },
  {
    label: "Microservices",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/>
        <rect x="9" y="15" width="6" height="6" rx="1"/>
        <path d="M5 9v3h14V9M12 15v-3"/>
      </svg>
    ),
    desc: "Independently deployable",
  },
  {
    label: "Event-Driven Design",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    desc: "Async-first architecture",
  },
  {
    label: "Kubernetes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12"/>
      </svg>
    ),
    desc: "Orchestrated with precision",
  },
  {
    label: "Observability",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    desc: "Full-stack visibility",
  },
  {
    label: "API Design",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 9l3 3-3 3M13 15h3"/>
        <rect x="3" y="3" width="18" height="18" rx="2"/>
      </svg>
    ),
    desc: "Contracts that last",
  },
];

/* ─── Stat ───────────────────────────────────────────────── */
function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-5 border-r border-white/[0.05] last:border-r-0 group">
      <span className={`font-mono text-[1.9rem] font-black leading-none tracking-tight transition-colors duration-200 ${
        accent ? "text-amber-400 group-hover:text-amber-300" : "text-white group-hover:text-cyan-300"
      }`}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-semibold">
        {label}
      </span>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function AboutSection() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const yearsExp = useMemo(() => {
    const start = new Date("2021-01-01");
    const now = new Date();
    let y = now.getFullYear() - start.getFullYear();
    if (now.getMonth() - start.getMonth() < 0) y--;
    return y;
  }, []);

  const availability = useMemo(() => {
    try {
      const groups = Object.values(availabilityData).flat();
      if (!groups.length) return "1 Slot Open";
      const w = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
      return groups[w % groups.length] as string;
    } catch {
      return "1 Slot Open";
    }
  }, []);

  return (
    <>
      <Bookings
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        bookingType="call-15"
      />
      <Section id="about" title="">
      <div className="relative px-4 sm:px-6 lg:px-10 py-14 sm:py-20 overflow-hidden">

        {/* Subtle grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.025) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Glow left */}
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />
        {/* Glow right */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full bg-emerald-500/[0.04] blur-[90px]" />
        {/* Vignette */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 90% 80% at 50% 40%, transparent 30%, #09090b 100%)" }}
        />

        <div className="relative max-w-5xl mx-auto flex flex-col gap-10 sm:gap-14">

          {/* ── STATUS PILL ── */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              Taking on select projects
            </span>
            <span className="ml-1 font-mono text-[11px] text-amber-400/80 border border-amber-500/20 bg-amber-500/[0.06] rounded-[2px] px-2 py-0.5">
              {availability}
            </span>
          </div>

          {/* ── HEADLINE BLOCK ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 lg:gap-12 items-start">

            {/* Left: Headline + bio + CTAs */}
            <div className="flex flex-col gap-6">
              {/* Title — interwoven design */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/25 font-semibold">
                  Backend Architecture · Systems Design
                </span>
                <h2 className="text-[2rem] sm:text-[2.6rem] lg:text-[3rem] font-black tracking-[-0.03em] text-white leading-[1.05]">
                  The backend that{" "}
                  <span
                    className="text-transparent bg-clip-text"
                    style={{ backgroundImage: "linear-gradient(135deg, #22d3ee 0%, #34d399 60%, #22d3ee 100%)", backgroundSize: "200% 200%", animation: "shimmer 4s linear infinite" }}
                  >
                    holds when everything else breaks.
                  </span>
                </h2>
                <p className="mt-3 text-[0.92rem] sm:text-[0.97rem] text-white/40 leading-[1.85] max-w-[52ch]">
                  I build production-grade infrastructure for founders and engineering leads who{" "}
                  <em className="not-italic text-white/60 font-medium">can't afford downtime</em> — 
                  systems that adapt to the problem, not the other way around.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-[3px] px-5 py-2.5 text-sm font-bold text-slate-900"
                  style={{ background: "linear-gradient(135deg,#22d3ee,#34d399)" }}
                >
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg,#67e8f9,#6ee7b7)" }} />
                  <span className="relative">Book a 15-min call</span>
                  <svg className="relative w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </button>
                <a
                  href="https://drive.google.com/file/d/1nT-Mx3MItOSyhvikndWF25WGlMPlHP5V/view?usp=drivesdk"
                  className="inline-flex items-center gap-2 rounded-[3px] border border-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white/45 hover:border-white/[0.16] hover:text-white/70 transition-all duration-200"
                >
                  View Resume
                  <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Profile card */}
            <div className="flex flex-col gap-0 rounded-[4px] overflow-hidden border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="h-[1.5px] w-full" style={{ background: "linear-gradient(to right,#22d3ee,#34d399)" }} />
              <div className="p-4 flex flex-col divide-y divide-white/[0.04]">
                {[
                  { label: "Location", value: "Remote · Worldwide" },
                  { label: "Status", value: "Available Now", hi: true },
                  { label: "Experience", value: `${yearsExp}+ Years` },
                  { label: "Focus", value: "Scalable Infrastructure" },
                  { label: "Timezone", value: "Overlap with US & EU" },
                ].map(({ label, value, hi }) => (
                  <div key={label} className="flex items-center justify-between py-2.5">
                    <span className="text-[9px] uppercase tracking-[0.18em] text-white/22 font-semibold">{label}</span>
                    <span className={`text-[11px] font-bold ${hi ? "text-emerald-400" : "text-white/55"}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SKILL CARDS ── */}
          {/* <div>
            <p className="text-[9px] uppercase tracking-[0.22em] text-white/20 font-semibold mb-4">
              Core Disciplines
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {SKILLS.map((skill) => (
                <div
                  key={skill.label}
                  className="group relative flex flex-col gap-2.5 rounded-[3px] border border-white/[0.055] bg-white/[0.018] p-4 cursor-default overflow-hidden transition-all duration-300 hover:border-cyan-500/25 hover:bg-white/[0.035]"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 80% 80% at 20% 20%, rgba(34,211,238,0.06) 0%, transparent 70%)" }} />

                  <span className="text-white/30 group-hover:text-cyan-400/70 transition-colors duration-200">
                    {skill.icon}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-bold text-white/75 group-hover:text-white/95 transition-colors duration-200 leading-tight">
                      {skill.label}
                    </span>
                    <span className="text-[10px] text-white/28 group-hover:text-white/40 transition-colors duration-200 font-medium">
                      {skill.desc}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 h-[1.5px] w-0 group-hover:w-full transition-all duration-500 ease-out"
                    style={{ background: "linear-gradient(to right,#22d3ee,#34d399)" }} />
                </div>
              ))}
            </div>
          </div> */}

          {/* ── STATS BAR ── */}
          <div className="rounded-[3px] border border-white/[0.05] bg-white/[0.012] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="grid grid-cols-2 sm:grid-cols-4">
              <Stat value={`${yearsExp}+`} label="Years Experience" />
              <Stat value="30+" label="Services Deployed" accent />
              <Stat value="99.9%" label="Uptime SLA" />
              <Stat value="8+" label="Clients served" accent />
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </Section>
    </>
  );
}