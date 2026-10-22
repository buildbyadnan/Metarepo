"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { SignupModal } from "./signup-modal";
import { RazorpayButton } from "./razorpay-button";
import { PRODUCTS } from "@repo/products";
import { BRANDING } from "@/config/branding";

const FEATURES = [
  {
    title: "Google OAuth",
    description:
      "Production-grade authentication with PKCE, session rotation, and HTTP-only cookies.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
        />
      </svg>
    ),
  },
  {
    title: "Razorpay Payments",
    description:
      "Idempotent payment links, webhook verification, and encrypted refresh token storage.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
    ),
  },
  {
    title: "Edge-Ready Backend",
    description: "Hono on Cloudflare Workers with D1 database, CSP headers, and request IDs.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
        />
      </svg>
    ),
  },
  {
    title: "Type-Safe Shared Packages",
    description: "Monorepo with @repo/types, @repo/http, @repo/products — zero runtime overhead.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
  },
];

const STEPS = [
  {
    step: "1",
    title: "Clone the repo",
    description: "Get instant access to the full codebase after purchase.",
  },
  {
    step: "2",
    title: "Configure your env",
    description: "Set your Google OAuth, Razorpay keys, and database URL.",
  },
  {
    step: "3",
    title: "Deploy",
    description: "Push to Cloudflare Workers or your platform of choice.",
  },
];

function DashboardPreview() {
  return (
    <div className="relative w-full max-w-3xl mx-auto mt-16 glow-pulse">
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl" />
      <div className="relative rounded-2xl border border-[#1e1e2a] bg-[#12121a] overflow-hidden shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e2a]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#1e1e2a]" />
            <div className="w-3 h-3 rounded-full bg-[#1e1e2a]" />
            <div className="w-3 h-3 rounded-full bg-[#1e1e2a]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-[#0a0a0f] text-xs text-[#64748b] font-mono">
              yourapp.com/dashboard
            </div>
          </div>
        </div>
        {/* Dashboard content */}
        <div className="p-6 space-y-4">
          {/* Nav mock */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600" />
              <div className="h-3 w-24 rounded bg-[#1e1e2a]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-12 rounded bg-[#1e1e2a]" />
              <div className="h-8 w-20 rounded-lg bg-[#1e1e2a]" />
            </div>
          </div>
          {/* Content grid */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="col-span-1 rounded-xl border border-[#1e1e2a] bg-[#0a0a0f] p-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#1e1e2a] mx-auto" />
              <div className="h-3 w-20 rounded bg-[#1e1e2a] mx-auto" />
              <div className="h-2 w-28 rounded bg-[#1e1e2a] mx-auto" />
              <div className="border-t border-[#1e1e2a] pt-3 space-y-2">
                <div className="h-2 w-full rounded bg-[#1e1e2a]" />
                <div className="h-2 w-3/4 rounded bg-[#1e1e2a]" />
              </div>
            </div>
            <div className="col-span-2 rounded-xl border border-[#1e1e2a] bg-[#0a0a0f] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500/20" />
                <div className="h-3 w-32 rounded bg-[#1e1e2a]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 rounded-lg bg-[#1e1e2a]" />
                <div className="h-16 rounded-lg bg-[#1e1e2a]" />
                <div className="h-16 rounded-lg bg-[#1e1e2a]" />
                <div className="h-16 rounded-lg bg-[#1e1e2a]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPageInner() {
  const [modalOpen, setModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("auth_error")) {
      setAuthError("Sign-in failed. Please try again.");
      const url = new URL(window.location.href);
      url.searchParams.delete("auth_error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const handleAction = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      setModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-[#e2e8f0]">
      {authError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 px-6 py-3 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm"
        >
          <span>{authError}</span>
          <button
            onClick={() => setAuthError(null)}
            className="font-semibold hover:text-red-300 transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      {paymentSuccess && (
        <div className="flex items-center justify-between gap-4 px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-sm">
          <span>Payment successful! Thank you for your purchase.</span>
          <button
            onClick={() => setPaymentSuccess(false)}
            className="font-semibold hover:text-emerald-300 transition-colors cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2a]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <span className="font-extrabold text-xs text-white tracking-tight">
              {BRANDING.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            {BRANDING.name}
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-[#64748b] hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-[#64748b] hover:text-white transition-colors"
          >
            Pricing
          </a>
        </nav>
        <button
          onClick={handleAction}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
        >
          {user ? "Dashboard" : "Get Started"}
        </button>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center text-center px-6 pt-24 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1e1e2a] bg-[#12121a] text-xs text-[#64748b] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Production-ready
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
            Ship your SaaS
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              in days, not months
            </span>
          </h1>
          <p className="text-lg text-[#64748b] max-w-lg mb-10 leading-relaxed">
            {BRANDING.tagline}
          </p>
          <button
            onClick={handleAction}
            className="px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all cursor-pointer shadow-xl shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
          >
            {user ? "Go to Dashboard" : "Get Started — $59"}
          </button>
          <DashboardPreview />
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-4 tracking-tight">
              Everything you need
            </h2>
            <p className="text-[#64748b] text-center mb-14 max-w-md mx-auto leading-relaxed">
              Authentication, payments, and infrastructure — wired up and ready to go.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-[#1e1e2a] bg-[#12121a] p-6 hover:border-indigo-600/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#64748b] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 py-24 border-t border-[#1e1e2a]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-14 tracking-tight">
              Up and running in minutes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((s, i) => (
                <div key={s.step} className="text-center relative">
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#1e1e2a] to-transparent" />
                  )}
                  <div className="w-10 h-10 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 font-bold text-sm flex items-center justify-center mx-auto mb-4">
                    {s.step}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{s.title}</h3>
                  <p className="text-sm text-[#64748b] leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-6 py-24 border-t border-[#1e1e2a]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-4 tracking-tight">
              Simple pricing
            </h2>
            <p className="text-[#64748b] text-center mb-14">
              One-time payment. Lifetime access. No subscriptions.
            </p>

            <div
              className={`grid gap-6 ${
                PRODUCTS.length === 1
                  ? "max-w-md mx-auto"
                  : PRODUCTS.length === 2
                    ? "max-w-3xl mx-auto md:grid-cols-2"
                    : "md:grid-cols-3"
              }`}
            >
              {PRODUCTS.map((plan) => (
                <div
                  key={plan.id}
                  className="relative rounded-2xl gradient-border bg-[#12121a] p-8"
                >
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-600/10 via-purple-600/5 to-transparent pointer-events-none" />

                  <div className="relative">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-[#64748b] mt-1">{plan.description}</p>

                    <div className="mt-6 mb-8 flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold text-white tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-sm text-[#64748b]">{plan.period}</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-[#94a3b8]">
                          <svg
                            className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <RazorpayButton
                      productId={plan.id}
                      productName={plan.name}
                      amount={plan.amount}
                      currency={plan.currency}
                      onSuccess={() => setPaymentSuccess(true)}
                      onError={(msg) => setPaymentError(msg)}
                      className="w-full py-3 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30"
                    >
                      Buy Now
                    </RazorpayButton>
                  </div>
                </div>
              ))}
            </div>

            {paymentError && (
              <p className="mt-6 text-sm text-red-400 text-center">{paymentError}</p>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#64748b]">
            Product by{" "}
            <a
              href="https://adnanbuilds.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94a3b8] hover:text-white transition-colors"
            >
              AdnanBuilds
            </a>
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-[#64748b] hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-[#64748b] hover:text-white transition-colors"
            >
              Pricing
            </a>
          </div>
        </div>
      </footer>

      <SignupModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export function LandingPage() {
  return (
    <Suspense>
      <LandingPageInner />
    </Suspense>
  );
}
