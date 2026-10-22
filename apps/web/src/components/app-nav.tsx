"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { BRANDING } from "@/config/branding";

/**
 * Shared top navigation for the signed-in app pages (dashboard, waitlist),
 * extracted so every authenticated route stays visually identical by
 * construction instead of by copy-paste.
 */
export function AppNav() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <nav className="border-b border-slate-900 bg-[#07090a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-600/35">
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
  );
}
