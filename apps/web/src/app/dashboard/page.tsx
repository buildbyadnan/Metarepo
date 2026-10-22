"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { BRANDING } from "@/config/branding";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-full max-w-4xl space-y-8 animate-pulse">
          <div className="h-12 bg-slate-800 rounded-lg w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-800 rounded-2xl md:col-span-1"></div>
            <div className="h-64 bg-slate-800 rounded-2xl md:col-span-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Format joined date
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently Joined";

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/35">
              <span className="font-extrabold text-sm text-white">
                {BRANDING.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {BRANDING.name}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="h-4 w-px bg-slate-800" />
            <button
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Payment Success Banner */}
        {paymentSuccess && (
          <div className="mb-8 flex items-center justify-between gap-4 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
            <span>Payment successful! Thank you for your purchase.</span>
            <button
              onClick={() => setPaymentSuccess(false)}
              className="font-semibold hover:underline cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-slate-400 mt-2">Here is your account security and profile overview.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="relative group rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-sm overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <div className="relative mb-6">
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
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
            <p className="text-sm text-slate-400 mt-1">{user.email}</p>

            <div className="w-full border-t border-slate-800 my-6" />

            <div className="w-full space-y-4 text-left">
              <div>
                <span className="text-xs text-slate-500 block uppercase font-semibold tracking-wider">
                  Provider
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.886H12.24z" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-200">Google OAuth</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 block uppercase font-semibold tracking-wider">
                  Joined Date
                </span>
                <span className="text-sm font-medium text-slate-200 mt-1 block">{joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Account Details & Security Posture Card */}
          <div className="md:col-span-2 relative rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Security Overview
            </h3>

            <div className="space-y-6">
              {/* Security Health status */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div>
                  <span className="text-sm font-bold text-emerald-400 block">
                    Security Status: Active & Secured
                  </span>
                  <span className="text-xs text-slate-400">
                    All authentication layers are configured with modern safety standards (PKCE
                    S256, State validation).
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">
                  Robust
                </span>
              </div>

              {/* Technical Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">
                    User ID
                  </span>
                  <span
                    className="text-sm font-mono text-slate-300 block truncate mt-1 select-all"
                    title={user.id}
                  >
                    {user.id}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">
                    Session Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-slate-300">HTTP-Only SSL Cookie</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">
                    Token Entropy
                  </span>
                  <span className="text-sm text-slate-300 block mt-1">
                    256-bit Cryptographic Random
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">
                    CSP Protection
                  </span>
                  <span className="text-sm text-slate-300 block mt-1">
                    Strict Host Filtering Enabled
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-6">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">
                  Connected OAuth Accounts
                </h4>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-slate-800 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-200 block">Google</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                    Primary
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
