"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AppNav } from "@/components/app-nav";

const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

function formatJoined(iso?: string): string {
  if (!iso) return "Recently";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Step({
  index,
  label,
  state,
}: {
  index: number;
  label: string;
  state: "done" | "active" | "todo";
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
          state === "done"
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
            : state === "active"
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/50 animate-pulse"
              : "bg-slate-900 text-slate-500 border border-slate-800"
        }`}
        style={{ fontFamily: MONO }}
      >
        {state === "done" ? "✓" : index}
      </span>
      <span
        className={`text-xs font-semibold whitespace-nowrap ${
          state === "todo" ? "text-slate-500" : "text-slate-200"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function WaitlistPage() {
  const { user, loading, waitlisted, waitlistStatus, refreshUser } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
    } else if (!waitlisted) {
      // Approved while the tab was open — straight in.
      router.replace("/dashboard");
    }
  }, [loading, user, waitlisted, router]);

  const checkStatus = async () => {
    setChecking(true);
    setNotice(null);
    const snapshot = await refreshUser();
    setChecking(false);
    if (!snapshot) {
      setNotice({
        tone: "bad",
        text: "Couldn't reach the auth server — try again in a moment.",
      });
    } else if (!snapshot.waitlisted) {
      // The effect above sees waitlisted flip to false and redirects to /dashboard.
      setNotice({ tone: "ok", text: "Approved — taking you in…" });
    } else {
      setNotice({
        tone: "ok",
        text: `Still ${snapshot.waitlistStatus ?? "pending"} — checked just now.`,
      });
    }
  };

  if (loading || !user || !waitlisted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#07090a",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          className="animate-pulse"
          style={{ fontFamily: MONO, color: "#3dff7a", fontSize: "0.85rem" }}
        >
          loading…
        </span>
      </div>
    );
  }

  const status = waitlistStatus ?? "pending";
  const firstName = user.name.split(" ")[0] || user.name;
  const joined = formatJoined(user.createdAt);

  return (
    <div className="relative min-h-screen bg-[#07090a] text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Glow effects — mirrors the dashboard */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-700/10 rounded-full blur-[128px] pointer-events-none" />

      <AppNav />

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <span
            className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-400"
            style={{ fontFamily: MONO }}
          >
            Access — {status}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mt-2">
            You&apos;re on the waitlist
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Good to see you,{" "}
            <span className="text-slate-200 font-semibold">{firstName}</span>. Access opens
            in waves — when your spot comes up, signing in with Google takes you straight to
            the dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile card — same family as the dashboard profile card */}
          <div className="relative group rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-sm overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <div className="relative mb-6">
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-emerald-500 to-green-700 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="relative w-24 h-24 rounded-full object-cover border-2 border-slate-950"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="relative w-24 h-24 rounded-full bg-slate-800 items-center justify-center text-2xl font-bold border-2 border-slate-950 text-white"
                style={{ display: user.picture ? "none" : "flex" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white leading-tight">{user.name}</h3>
            <p className="text-sm text-slate-400 mt-1 break-all">{user.email}</p>

            <div className="w-full border-t border-slate-800 my-6" />

            <div className="w-full space-y-4 text-left">
              <div>
                <span className="text-xs text-slate-500 block uppercase font-semibold tracking-wider">
                  Sign-in method
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.886H12.24z" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-200">Google OAuth</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 block uppercase font-semibold tracking-wider">
                  Member since
                </span>
                <span className="text-sm font-medium text-slate-200 mt-1 block">
                  {joined}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block uppercase font-semibold tracking-wider">
                  Account ID
                </span>
                <span
                  className="text-sm font-mono text-slate-300 block truncate mt-1 select-all"
                  title={user.id}
                >
                  {user.id}
                </span>
              </div>
            </div>
          </div>

          {/* Waitlist status card */}
          <div className="md:col-span-2 relative rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-600/50 to-transparent" />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Waitlist status
              </h3>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {status.toUpperCase()}
              </span>
            </div>

            {/* Progress steps */}
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Step index={1} label="Signed in with Google" state="done" />
              <span className="h-px w-8 bg-slate-800 hidden sm:block" />
              <Step index={2} label="Approval" state="active" />
              <span className="h-px w-8 bg-slate-800 hidden sm:block" />
              <Step index={3} label="Dashboard" state="todo" />
            </div>

            <p className="text-slate-400 mt-7 leading-relaxed text-sm max-w-xl">
              Your Google account is linked and your spot is reserved — there&apos;s nothing
              else you need to do. Access is granted in waves, and once you&apos;re approved,
              this same sign-in drops you straight into the dashboard.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={checkStatus}
                disabled={checking}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-[#04130a] hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
                style={{ fontFamily: MONO }}
              >
                {checking ? "Checking…" : "Check status"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                style={{ fontFamily: MONO }}
              >
                Back to home
              </button>
            </div>

            <div className="mt-3 min-h-5">
              {notice ? (
                <p
                  className={`text-xs ${
                    notice.tone === "ok" ? "text-emerald-400" : "text-[#ff6b85]"
                  }`}
                  style={{ fontFamily: MONO }}
                >
                  {notice.text}
                </p>
              ) : (
                <p className="text-xs text-slate-500" style={{ fontFamily: MONO }}>
                  Approved already? Hit check status to jump in.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
