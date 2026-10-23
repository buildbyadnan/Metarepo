"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { BRANDING } from "@/config/branding";

const NAV_LINKS = [
  { href: "/documents", label: "Documents" },
  { href: "/dashboard", label: "Dashboard" },
];

/**
 * Shared top navigation for the signed-in app pages (documents, dashboard),
 * extracted so every authenticated route stays visually identical by
 * construction instead of by copy-paste.
 */
export function AppNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <nav className="border-b border-slate-900 bg-[#07090a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3 cursor-pointer group"
          aria-label="Home"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-600/35">
            <span className="font-extrabold text-sm text-white">
              {BRANDING.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {BRANDING.name}
          </span>
        </button>

        <div className="flex items-center gap-4">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  active ? "text-emerald-400" : "text-slate-400 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </button>
            );
          })}
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
