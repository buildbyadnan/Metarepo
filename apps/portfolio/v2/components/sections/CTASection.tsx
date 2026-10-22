"use client";
import { useState } from "react";
import Section from "@/components/ui/Section";
import Link from "next/link";
import Bookings from "@/components/Bookings";
import { FiMail, FiArrowRight, FiCalendar, FiClock, FiZap, FiLinkedin } from "react-icons/fi";

/* ─── Stat pill ──────────────────────────────────────────── */
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="group flex flex-col items-center gap-0.5 px-5 py-4 border-r border-white/[0.05] last:border-r-0">
      <span className="font-mono text-[1.35rem] font-black text-white leading-none group-hover:text-cyan-300 transition-colors duration-200">
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-[0.18em] text-white/24 font-semibold">{label}</span>
    </div>
  );
}

/* ─── Quick option card ──────────────────────────────────── */
function QuickOption({
  icon, label, sub, badge,
  accentFrom, accentTo,
  onClick, href, external,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  badge?: string;
  accentFrom: string;
  accentTo: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
}) {
  const cls =
    "group relative flex items-center gap-3.5 rounded-[3px] border border-white/[0.055] bg-white/[0.015] px-4 py-3.5 text-left overflow-hidden transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.03] w-full";

  const inner = (
    <>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
        style={{ background: `radial-gradient(ellipse 80% 80% at 0% 50%, ${accentFrom}0d, transparent 65%)` }} />
      <div className="absolute bottom-0 left-0 h-[1.5px] w-0 group-hover:w-full transition-all duration-500"
        style={{ background: `linear-gradient(to right,${accentFrom},${accentTo})` }} />

      <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-[3px] border text-sm transition-colors duration-200"
        style={{ borderColor: `${accentFrom}28`, background: `${accentFrom}10`, color: accentFrom }}>
        {icon}
      </span>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[12px] font-bold text-white/72 group-hover:text-white/93 transition-colors leading-tight">{label}</span>
        <span className="text-[10px] text-white/27 group-hover:text-white/42 transition-colors">{sub}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className="rounded-[2px] border px-2 py-0.5 text-[9px] font-black tracking-[0.12em] uppercase"
            style={{ borderColor: `${accentFrom}30`, background: `${accentFrom}0d`, color: accentFrom }}>
            {badge}
          </span>
        )}
        <FiArrowRight size={12}
          className="text-white/18 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </>
  );

  if (href) {
    return <Link href={href} target={external ? "_blank" : undefined} className={cls}>{inner}</Link>;
  }
  return <button onClick={onClick} className={cls}>{inner}</button>;
}

/* ─── Main ───────────────────────────────────────────────── */
export default function CTASection() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  return (
    <>
      <Bookings
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        bookingType="tech-discussion"
      />

      <Section id="contact" title="">
        <div className="relative px-4 sm:px-6 lg:px-10 py-14 sm:py-20 overflow-hidden">

          {/* Ambient glows */}
          <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] rounded-full bg-cyan-500/[0.05] blur-[120px]" />
          <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-[280px] h-[280px] rounded-full bg-emerald-500/[0.03] blur-[80px]" />
          <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-[240px] h-[240px] rounded-full bg-violet-500/[0.025] blur-[80px]" />

          {/* Subtle grid */}
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.02) 1px,transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          {/* Vignette */}
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 30%, #09090b 100%)" }} />

          <div className="relative max-w-5xl mx-auto flex flex-col gap-10 sm:gap-14">

            {/* ── Section label ── */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-[0.24em] text-white/22 font-semibold">Get in Touch</span>
              <h2 className="text-[1.7rem] sm:text-[2.2rem] font-black tracking-[-0.025em] text-white leading-[1.06]">
                Your idea deserves{" "}
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg,#22d3ee 0%,#34d399 100%)" }}>
                  infrastructure that ships.
                </span>
              </h2>
            </div>

            {/* ── Main card ── */}
            <div
              className="relative rounded-[4px] border border-white/[0.06] overflow-hidden shadow-[0_20px_64px_rgba(0,0,0,0.5)]"
              style={{ background: "linear-gradient(160deg,rgba(10,16,30,0.98),rgba(14,22,40,0.96))" }}
            >
              {/* Top accent bar */}
              <div className="h-[1.5px] w-full"
                style={{ background: "linear-gradient(to right,#22d3ee,#34d399)" }} />

              {/* Inner top glow */}
              <div aria-hidden className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 w-[380px] h-[160px] rounded-full bg-cyan-500/[0.06] blur-[56px]" />

              <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_300px] lg:divide-x lg:divide-white/[0.05]">

                {/* ── Left: headline + body + CTA ── */}
                <div className="flex flex-col gap-6 px-7 sm:px-10 py-9 sm:py-11">

                  {/* Live status */}
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-400 font-bold">
                      Available · Remote-first
                    </span>
                  </div>

                  {/* Body copy */}
                  <p className="text-[0.9rem] text-white/40 leading-[1.9] max-w-[50ch]">
                    I help founders validate ideas quickly with production-ready serverless stacks and
                    clean backend architecture —{" "}
                    <em className="not-italic text-white/58 font-medium">scoped tightly, delivered fast</em>,
                    without the usual chaos.
                  </p>

                  {/* Short SEO/GEO/AEO-optimized description */}
                  <p className="text-[0.9rem] text-white/36 leading-[1.6] max-w-[60ch] font-semibold">
                    Schedule Architect is a 45‑minute priority planning call to kickstart your product
                    build — startup-focused, remote-friendly, and delivery-first serverless architecture.
                  </p>

                  {/* Trust chips */}
                  <div className="flex flex-wrap gap-2">
                    {["No bloat", "Week-one delivery", "99.9% uptime SLA", "Timezone-flexible"].map((t) => (
                      <span key={t}
                        className="inline-flex items-center gap-1.5 rounded-[2px] border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] font-semibold text-white/34 tracking-wide">
                        <span className="w-1 h-1 rounded-full bg-emerald-400/55" />
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Primary CTA */}
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="group relative self-start inline-flex items-center gap-2 overflow-hidden rounded-[3px] px-6 py-3 text-[13px] font-black text-slate-900 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg,#22d3ee,#34d399)" }}
                  >
                    <FiCalendar size={13} />
                    Schedule 45‑min Architect Call
                    <FiArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <p className="text-[10px] text-white/20 font-medium -mt-2">
                    45‑minute priority call · No retainers required · Pay per project · Cancel anytime
                  </p>
                </div>

                {/* ── Right: quick options ── */}
                <div className="flex flex-col border-t border-white/[0.05] lg:border-t-0">
                  <div className="px-5 pt-6 pb-2.5">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold">
                      Other ways to connect
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 px-4 pb-5 flex-1">
                    <QuickOption
                      icon={<FiClock size={13} />}
                      label="Book a 15-min Call"
                      sub="Quick fit check — no commitment"
                      badge="Free"
                      accentFrom="#60a5fa"
                      accentTo="#22d3ee"
                      onClick={() => setBookingModalOpen(true)}
                    />
                    {/* <QuickOption
                      icon={<FiZap size={13} />}
                      label="Call Immediately"
                      sub="Priority direct line right now"
                      badge="$10"
                      accentFrom="#f59e0b"
                      accentTo="#ef4444"
                      onClick={() => setBookingModalOpen(true)}
                    /> */}
                    <QuickOption
                      icon={<FiMail size={13} />}
                      label="Send an Email"
                      sub="contact@adnanthecoder.com"
                      accentFrom="#a78bfa"
                      accentTo="#22d3ee"
                      href="mailto:contact@adnanthecoder.com"
                    />
                    <QuickOption
                      icon={<FiLinkedin size={13} />}
                      label="Connect on LinkedIn"
                      sub="syedadnanali99"
                      accentFrom="#34d399"
                      accentTo="#22d3ee"
                      href="https://www.linkedin.com/in/syedadnanali99"
                      external
                    />
                  </div>

                  {/* Response time note */}
                  <div className="mt-auto px-5 py-3.5 border-t border-white/[0.04]">
                    <p className="text-[9px] text-white/20 leading-relaxed">
                      Responds within{" "}
                      <span className="text-white/38 font-bold">4 hours</span> on weekdays.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom shimmer line */}
              <div className="h-[1px] w-full"
                style={{ background: "linear-gradient(to right,transparent,rgba(34,211,238,0.12),transparent)" }} />
            </div>

          </div>
        </div>
      </Section>
    </>
  );
}