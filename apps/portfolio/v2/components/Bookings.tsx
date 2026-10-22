"use client";
import React, { useState, useRef, useEffect } from "react";
import { FiX, FiLoader, FiCheck, FiAlertCircle, FiPhone, FiClock, FiZap, FiPackage, FiLock, FiChevronRight } from "react-icons/fi";

/* ─── Types ──────────────────────────────────────────────── */
export type BookingType =
  | "call-15"
  | "tech-discussion"
  | "build-mvp"
  | "call-now";

interface BookingConfig {
  type: BookingType;
  label: string;
  tagline: string;
  price: number | null; // null = free
  duration: string;
  icon: React.ReactNode;
  accentFrom: string;
  accentTo: string;
  badge?: string;
}

const BOOKING_CONFIGS: Record<BookingType, BookingConfig> = {
  "call-15": {
    type: "call-15",
    label: "Book a 15-min Call",
    tagline: "Quick sync to see if we're a fit",
    price: null,
    duration: "15 minutes",
    icon: <FiClock />,
    accentFrom: "#22d3ee",
    accentTo: "#34d399",
    badge: "Free",
  },
  "tech-discussion": {
    type: "tech-discussion",
    label: "Tech Discussion",
    tagline: "Deep-dive your product architecture & scale strategy",
    price: 15,
    duration: "60 minutes",
    icon: <FiZap />,
    accentFrom: "#a78bfa",
    accentTo: "#22d3ee",
    badge: "$15",
  },
  "build-mvp": {
    type: "build-mvp",
    label: "Build Your MVP",
    tagline: "Scoped session to plan and spec your MVP",
    price: null,
    duration: "45 minutes",
    icon: <FiPackage />,
    accentFrom: "#34d399",
    accentTo: "#22d3ee",
    badge: "Free",
  },
  "call-now": {
    type: "call-now",
    label: "Call Immediately",
    tagline: "Priority direct line — get on a call right now",
    price: 10,
    duration: "On-demand",
    icon: <FiPhone />,
    accentFrom: "#f59e0b",
    accentTo: "#ef4444",
    badge: "$10",
  },
};

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Bangkok", "Asia/Singapore",
  "Asia/Tokyo", "Australia/Sydney",
];

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType?: BookingType;
}

type Step = "type-select" | "form" | "payment" | "success";

/* ─── Small helpers ──────────────────────────────────────── */
function GradientText({ from, to, children }: { from: string; to: string; children: React.ReactNode }) {
  return (
    <span style={{ backgroundImage: `linear-gradient(135deg,${from},${to})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
      {children}
    </span>
  );
}

function InputField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-[0.16em] text-white/30 font-semibold">
        {label} {required && <span className="text-cyan-400/70">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-[3px] border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-white/80 placeholder-white/20 outline-none transition-all duration-200 focus:border-cyan-500/40 focus:bg-white/[0.055] focus:ring-1 focus:ring-cyan-500/20";

/* ─── Step: Type selector ────────────────────────────────── */
function TypeSelector({ onSelect }: { onSelect: (t: BookingType) => void }) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:p-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-semibold mb-1">
        Choose a session type
      </p>
      {(Object.values(BOOKING_CONFIGS) as BookingConfig[]).map((cfg) => (
        <button
          key={cfg.type}
          onClick={() => onSelect(cfg.type)}
          className="group relative flex items-center gap-4 rounded-[3px] border border-white/[0.06] bg-white/[0.018] p-4 sm:p-5 text-left overflow-hidden transition-all duration-200 hover:border-white/[0.13] hover:bg-white/[0.035]"
        >
          {/* Hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
            style={{ background: `radial-gradient(ellipse 70% 80% at 0% 50%, ${cfg.accentFrom}0d, transparent 70%)` }} />

          {/* Icon */}
          <span
            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-[3px] border text-base transition-all duration-200"
            style={{
              borderColor: `${cfg.accentFrom}30`,
              background: `${cfg.accentFrom}12`,
              color: cfg.accentFrom,
            }}
          >
            {cfg.icon}
          </span>

          {/* Text */}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-[13px] font-bold text-white/80 group-hover:text-white/95 transition-colors">{cfg.label}</span>
            <span className="text-[11px] text-white/30 group-hover:text-white/45 transition-colors leading-snug">{cfg.tagline}</span>
            <span className="mt-1 text-[10px] text-white/22 font-medium">{cfg.duration}</span>
          </div>

          {/* Badge + arrow */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="rounded-[2px] px-2.5 py-1 text-[10px] font-black tracking-wide border"
              style={{
                borderColor: `${cfg.accentFrom}35`,
                background: `${cfg.accentFrom}12`,
                color: cfg.accentFrom,
              }}
            >
              {cfg.badge}
            </span>
            <FiChevronRight className="text-white/20 group-hover:text-white/50 transition-colors" size={14} />
          </div>

          {/* Bottom slide bar */}
          <div className="absolute bottom-0 left-0 h-[1.5px] w-0 group-hover:w-full transition-all duration-500"
            style={{ background: `linear-gradient(to right,${cfg.accentFrom},${cfg.accentTo})` }} />
        </button>
      ))}
    </div>
  );
}

/* ─── Step: Form ─────────────────────────────────────────── */
function BookingForm({
  cfg,
  onBack,
  onNext,
}: {
  cfg: BookingConfig;
  onBack: () => void;
  onNext: (data: Record<string, string | boolean>) => void;
}) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", role: "",
    about: "", goals: "", preferredDateTime: "",
    timezone: "Asia/Kolkata", subscribed: true,
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ ...form });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 p-5 sm:p-6">
      {/* Session info bar */}
      <div
        className="flex items-center justify-between rounded-[3px] border px-4 py-3"
        style={{ borderColor: `${cfg.accentFrom}25`, background: `${cfg.accentFrom}0a` }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: cfg.accentFrom }} className="text-sm">{cfg.icon}</span>
          <span className="text-[12px] font-bold text-white/70">{cfg.label}</span>
          <span className="text-[10px] text-white/25">· {cfg.duration}</span>
        </div>
        <span
          className="text-[11px] font-black px-2.5 py-0.5 rounded-[2px] border"
          style={{ color: cfg.accentFrom, borderColor: `${cfg.accentFrom}30`, background: `${cfg.accentFrom}12` }}
        >
          {cfg.price === null ? "FREE" : `$${cfg.price}`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField label="Full Name" required>
          <input type="text" name="name" value={form.name} onChange={handle} required placeholder="Jane Smith" className={inputCls} />
        </InputField>
        <InputField label="Email" required>
          <input type="email" name="email" value={form.email} onChange={handle} required placeholder="jane@company.com" className={inputCls} />
        </InputField>
        <InputField label="Phone" required>
          <input type="tel" name="phone" value={form.phone} onChange={handle} required placeholder="+1-234-567-8900" className={inputCls} />
        </InputField>
        <InputField label="Company" required>
          <input type="text" name="company" value={form.company} onChange={handle} required placeholder="Acme Corp" className={inputCls} />
        </InputField>
        <InputField label="Your Role" required>
          <input type="text" name="role" value={form.role} onChange={handle} required placeholder="CTO / Founder" className={inputCls} />
        </InputField>
        <InputField label="Preferred Date & Time" required>
          <input type="datetime-local" name="preferredDateTime" value={form.preferredDateTime} onChange={handle} required className={inputCls} />
        </InputField>
      </div>

      <InputField label="Timezone" required>
        <select name="timezone" value={form.timezone} onChange={handle} className={inputCls}>
          {TIMEZONES.map((tz) => <option key={tz} value={tz} className="bg-[#0a0f1a]">{tz}</option>)}
        </select>
      </InputField>

      <InputField label="About Your Project" required>
        <textarea name="about" value={form.about} onChange={handle} required rows={2} placeholder="Briefly describe your project..." className={`${inputCls} resize-none`} />
      </InputField>

      <InputField label="Goals & Challenges" required>
        <textarea name="goals" value={form.goals} onChange={handle} required rows={2} placeholder="What are you trying to achieve or solve?" className={`${inputCls} resize-none`} />
      </InputField>

      <label className="flex items-start gap-2.5 cursor-pointer group p-3 rounded-[3px] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
        <input type="checkbox" name="subscribed" checked={form.subscribed} onChange={handle} className="w-4 h-4 mt-0.5 cursor-pointer accent-cyan-500 rounded shrink-0" />
        <span className="text-[11px] text-white/30 group-hover:text-white/45 transition-colors leading-relaxed">
          Keep me updated with architectural insights, case studies, and optimization tips
        </span>
      </label>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onBack}
          className="flex-1 py-2.5 rounded-[3px] border border-white/[0.07] text-[12px] font-bold text-white/40 hover:border-white/[0.14] hover:text-white/60 transition-all">
          Back
        </button>
        <button type="submit"
          className="flex-[2] py-2.5 rounded-[3px] text-[12px] font-black text-slate-900 transition-all hover:opacity-90 active:scale-[0.99]"
          style={{ background: `linear-gradient(135deg,${cfg.accentFrom},${cfg.accentTo})` }}>
          {cfg.price === null ? "Confirm Booking →" : `Continue to Payment →`}
        </button>
      </div>
    </form>
  );
}

/* ─── Step: Payment ──────────────────────────────────────── */
function PaymentStep({
  cfg,
  onBack,
  onPay,
  paying,
}: {
  cfg: BookingConfig;
  onBack: () => void;
  onPay: () => void;
  paying: boolean;
}) {
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });

  const fmt = (name: string, val: string) => {
    if (name === "number") return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    if (name === "expiry") {
      const d = val.replace(/\D/g, "").slice(0, 4);
      return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
    }
    if (name === "cvc") return val.replace(/\D/g, "").slice(0, 4);
    return val;
  };

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCard((p) => ({ ...p, [name]: fmt(name, value) }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onPay();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 p-5 sm:p-6">
      {/* Amount summary */}
      <div
        className="flex items-center justify-between rounded-[3px] border px-4 py-4"
        style={{ borderColor: `${cfg.accentFrom}25`, background: `${cfg.accentFrom}08` }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.16em] text-white/25 font-semibold">Session</span>
          <span className="text-[13px] font-bold text-white/75">{cfg.label}</span>
          <span className="text-[10px] text-white/25">{cfg.duration}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.14em] text-white/25 font-semibold">Total</span>
          <span
            className="text-[1.6rem] font-black leading-none"
            style={{ backgroundImage: `linear-gradient(135deg,${cfg.accentFrom},${cfg.accentTo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
          >
            ${cfg.price}
          </span>
        </div>
      </div>

      {/* Secure badge */}
      <div className="flex items-center gap-2 text-white/20">
        <FiLock size={11} />
        <span className="text-[10px] font-medium uppercase tracking-[0.14em]">Demo payment — no real charge</span>
      </div>

      {/* Card fields */}
      <InputField label="Cardholder Name" required>
        <input type="text" name="name" value={card.name} onChange={handle} required placeholder="Jane Smith" className={inputCls} />
      </InputField>

      <InputField label="Card Number" required>
        <input type="text" name="number" value={card.number} onChange={handle} required placeholder="4242 4242 4242 4242" maxLength={19} className={inputCls} />
      </InputField>

      <div className="grid grid-cols-2 gap-3">
        <InputField label="Expiry" required>
          <input type="text" name="expiry" value={card.expiry} onChange={handle} required placeholder="MM / YY" maxLength={7} className={inputCls} />
        </InputField>
        <InputField label="CVC" required>
          <input type="text" name="cvc" value={card.cvc} onChange={handle} required placeholder="•••" maxLength={4} className={inputCls} />
        </InputField>
      </div>

      {/* Card brand hints */}
      <div className="flex items-center gap-2">
        {["VISA", "MC", "AMEX", "DISC"].map((b) => (
          <span key={b} className="rounded-[2px] border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[9px] font-bold text-white/25 tracking-wider">{b}</span>
        ))}
        <FiLock size={10} className="ml-auto text-white/15" />
        <span className="text-[9px] text-white/15 font-medium">SSL Encrypted</span>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onBack}
          className="flex-1 py-2.5 rounded-[3px] border border-white/[0.07] text-[12px] font-bold text-white/40 hover:border-white/[0.14] hover:text-white/60 transition-all">
          Back
        </button>
        <button type="submit" disabled={paying}
          className="flex-[2] py-2.5 rounded-[3px] text-[12px] font-black text-slate-900 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg,${cfg.accentFrom},${cfg.accentTo})` }}>
          {paying ? <><FiLoader className="animate-spin" size={13} /> Processing…</> : `Pay $${cfg.price} & Confirm`}
        </button>
      </div>
    </form>
  );
}

/* ─── Step: Success ──────────────────────────────────────── */
function SuccessStep({ cfg, successData, countdown, onClose }: {
  cfg: BookingConfig;
  successData: Record<string, string> | null;
  countdown: number;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-10 text-center">
      {/* Animated check */}
      <div className="relative">
        <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(34,211,238,0.12)" strokeWidth="4" />
          <circle cx="50" cy="50" r="45" fill="none"
            stroke={`url(#sg-${cfg.type})`} strokeWidth="4"
            strokeDasharray="283" strokeDashoffset="0"
            style={{ animation: `cdrain ${countdown}s linear forwards` }}
          />
          <defs>
            <linearGradient id={`sg-${cfg.type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={cfg.accentFrom} />
              <stop offset="100%" stopColor={cfg.accentTo} />
            </linearGradient>
          </defs>
        </svg>
        <div className="w-20 h-20 rounded-full flex items-center justify-center border"
          style={{ borderColor: `${cfg.accentFrom}40`, background: `${cfg.accentFrom}12` }}>
          <FiCheck size={32} style={{ color: cfg.accentFrom }} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[1.35rem] font-black text-white/90">
          <GradientText from={cfg.accentFrom} to={cfg.accentTo}>Booking Confirmed!</GradientText>
        </h3>
        <p className="text-[0.85rem] text-white/40 max-w-[36ch] mx-auto leading-relaxed">
          You're all set. Check your inbox for a confirmation and calendar invite.
        </p>
      </div>

      {successData && (
        <div className="w-full rounded-[3px] border border-white/[0.06] bg-white/[0.018] divide-y divide-white/[0.04] text-left">
          {[
            { label: "Session", value: cfg.label },
            { label: "Request ID", value: successData.id ? `#${successData.id}` : "—" },
            { label: "Email", value: successData.email || "—" },
            { label: "Status", value: "Confirmed", hi: true },
          ].map(({ label, value, hi }) => (
            <div key={label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[10px] uppercase tracking-[0.14em] text-white/22 font-semibold">{label}</span>
              <span className={`text-[11px] font-bold ${hi ? "text-emerald-400" : "text-white/55"}`}>{value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-white/22">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.accentFrom }} />
        <span className="text-[11px] font-medium">
          Closing in <span className="font-mono" style={{ color: cfg.accentFrom }}>{countdown}s</span>
        </span>
      </div>

      <button onClick={onClose}
        className="w-full py-2.5 rounded-[3px] border border-white/[0.07] text-[12px] font-bold text-white/40 hover:border-white/[0.14] hover:text-white/60 transition-all">
        Close
      </button>
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────── */
export default function BookingModal({ isOpen, onClose, bookingType }: ConsultationModalProps) {
  const [step, setStep] = useState<Step>(bookingType ? "form" : "type-select");
  const [selectedType, setSelectedType] = useState<BookingType>(bookingType ?? "call-15");
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<Record<string, string> | null>(null);
  const [countdown, setCountdown] = useState(30);
  const modalRef = useRef<HTMLDivElement>(null);

  const cfg = BOOKING_CONFIGS[selectedType];

  /* Reset when modal opens */
  useEffect(() => {
    if (isOpen) {
      setStep(bookingType ? "form" : "type-select");
      setSelectedType(bookingType ?? "call-15");
      setStatus("idle");
      setErrorMsg("");
      setSuccessData(null);
    }
  }, [isOpen, bookingType]);

  /* Escape key */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  /* Body scroll lock */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* Countdown */
  useEffect(() => {
    if (status !== "success") return;
    setCountdown(30);
    const t = setInterval(() => setCountdown((n) => {
      if (n <= 1) { clearInterval(t); onClose(); setStatus("idle"); return 0; }
      return n - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [status, onClose]);

  /* Submit — UI-only build: no backend is wired in this repo */
  const submitBooking = async (data: Record<string, string | boolean>) => {
    setSuccessData({ email: (data.email as string) || "" });
    setStatus("success");
    setStep("success");
  };

  const handleFormNext = (data: Record<string, string | boolean>) => {
    setFormData(data);
    if (cfg.price === null) {
      submitBooking(data);
      setStep("success");
    } else {
      setStep("payment");
    }
  };

  const handlePay = async () => {
    setPaying(true);
    /* Demo: simulate payment delay then confirm */
    await new Promise((r) => setTimeout(r, 1800));
    setPaying(false);
    await submitBooking(formData);
  };

  if (!isOpen) return null;

  const STEP_LABELS: Partial<Record<Step, string>> = {
    "type-select": "Choose Session",
    form: cfg.label,
    payment: "Secure Payment",
    success: "Confirmed",
  };

  const stepIdx = (["type-select", "form", "payment", "success"] as Step[]).indexOf(step);
  const totalSteps = cfg.price === null ? 3 : 4;
  
  return (
    <>
      <style>{`
        @keyframes modal-in { from { opacity:0; transform:translateY(18px) scale(0.96); } to { opacity:1; transform:none; } }
        @keyframes cdrain { from { stroke-dashoffset:0; } to { stroke-dashoffset:283; } }
        .cm-scroll::-webkit-scrollbar { width:4px; }
        .cm-scroll::-webkit-scrollbar-track { background:transparent; }
        .cm-scroll::-webkit-scrollbar-thumb { background:rgba(34,211,238,0.25); border-radius:4px; }
        .cm-scroll { scrollbar-width:thin; scrollbar-color:rgba(34,211,238,0.2) transparent; }
      `}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-[6px]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-none overflow-y-auto">
        <div
          ref={modalRef}
          className="pointer-events-auto w-full max-w-[420px] sm:max-w-[480px] my-auto rounded-[4px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
          style={{ animation: "modal-in 0.35s cubic-bezier(0.4,0,0.2,1)" }}
        >
          {/* Glass bg */}
          <div className="relative border border-white/[0.07]" style={{ background: "linear-gradient(160deg,rgba(10,16,30,0.99),rgba(14,22,42,0.97))" }}>

            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full blur-[60px] opacity-30 transition-all duration-500"
              style={{ background: `radial-gradient(ellipse,${cfg.accentFrom},transparent 70%)` }} />

            {/* Top accent bar */}
            <div className="h-[1.5px] w-full" style={{ background: `linear-gradient(to right,${cfg.accentFrom},${cfg.accentTo})` }} />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 border-b border-white/[0.05]">
              <div className="flex flex-col gap-1 min-w-0">
                {/* Step breadcrumb */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  {(["type-select", "form", ...(cfg.price !== null ? ["payment"] : []), "success"] as Step[]).map((s, i) => (
                    <React.Fragment key={s}>
                      <span className={`text-[9px] uppercase tracking-[0.14em] font-semibold transition-colors ${step === s ? "text-white/50" : i < stepIdx ? "text-white/22" : "text-white/14"}`}>
                        {STEP_LABELS[s]}
                      </span>
                      {i < (cfg.price !== null ? 3 : 2) && <span className="text-white/12 text-[9px]">›</span>}
                    </React.Fragment>
                  ))}
                </div>
                <h2 className="text-[1.05rem] sm:text-[1.15rem] font-black text-white/90 leading-tight">
                  {step === "type-select" && "Book a Session"}
                  {step === "form" && <GradientText from={cfg.accentFrom} to={cfg.accentTo}>{cfg.label}</GradientText>}
                  {step === "payment" && "Complete Payment"}
                  {step === "success" && "You're Confirmed 🎉"}
                </h2>
                {step !== "success" && (
                  <p className="text-[11px] text-white/28 mt-0.5">
                    {step === "type-select" && "Select the right session for your needs"}
                    {step === "form" && cfg.tagline}
                    {step === "payment" && `One-time payment of $${cfg.price} to secure your slot`}
                  </p>
                )}
              </div>
              <button onClick={onClose}
                className="shrink-0 p-2 rounded-[3px] border border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/[0.12] transition-all duration-200 hover:rotate-90 mt-0.5">
                <FiX size={14} />
              </button>
            </div>

            {/* Error banner */}
            {status === "error" && (
              <div className="mx-5 sm:mx-6 mt-4 flex items-start gap-2.5 rounded-[3px] border border-red-500/20 bg-red-500/[0.06] px-3.5 py-3">
                <FiAlertCircle className="text-red-400 shrink-0 mt-0.5" size={14} />
                <p className="text-[11px] text-red-300/80 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Scrollable content */}
            <div className="max-h-[70vh] overflow-y-auto cm-scroll">
              {step === "type-select" && (
                <TypeSelector onSelect={(t) => { setSelectedType(t); setStep("form"); }} />
              )}
              {step === "form" && (
                <BookingForm
                  cfg={cfg}
                  onBack={() => bookingType ? onClose() : setStep("type-select")}
                  onNext={handleFormNext}
                />
              )}
              {step === "payment" && (
                <PaymentStep cfg={cfg} onBack={() => setStep("form")} onPay={handlePay} paying={paying} />
              )}
              {step === "success" && (
                <SuccessStep cfg={cfg} successData={successData} countdown={countdown} onClose={onClose} />
              )}
            </div>

            {/* Footer */}
            {step !== "success" && (
              <div className="flex items-center justify-center gap-1.5 px-5 py-3 border-t border-white/[0.04]">
                <FiLock size={9} className="text-white/15" />
                <span className="text-[9px] text-white/18 font-medium uppercase tracking-[0.14em]">
                  Your information is encrypted and never shared
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}