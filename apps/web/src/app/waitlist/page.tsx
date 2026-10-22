"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

export default function WaitlistPage() {
  const { user, loading, waitlisted, waitlistStatus, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
    } else if (!waitlisted) {
      // Approved while the tab was open — straight in.
      router.replace("/dashboard");
    }
  }, [loading, user, waitlisted, router]);

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07090a",
        color: "#e8f1ec",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        fontFamily: "Sora, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "#0e1311",
          border: "1px solid #1d2a24",
          borderRadius: "22px",
          padding: "clamp(24px, 5vw, 44px)",
          boxShadow: "0 0 70px rgba(61, 255, 122, 0.12)",
        }}
      >
        <img
          src="/metarepo-logo.png"
          alt="MetaRepo"
          width={170}
          style={{ marginBottom: "22px", height: "auto" }}
        />
        <h1
          style={{
            margin: 0,
            fontFamily: MONO,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "#3dff7a",
            fontSize: "clamp(1.4rem, 4vw, 2.1rem)",
            textShadow: "0 0 30px rgba(61, 255, 122, 0.4)",
          }}
        >
          You&apos;re on the waitlist
        </h1>
        <p style={{ color: "#8a9a92", lineHeight: 1.6, marginTop: "14px" }}>
          Good to see you, <strong style={{ color: "#e8f1ec" }}>{user.name}</strong>.
          Access opens in waves — when your spot comes up, signing in with Google will
          take you straight to the dashboard.
        </p>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.75rem",
            color: "#1fa84f",
            marginTop: "18px",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 18px",
          }}
        >
          <span>
            status:{" "}
            <b style={{ color: "#3dff7a" }}>{waitlistStatus ?? "pending"}</b>
          </span>
          <span>
            email: <b style={{ color: "#e8f1ec" }}>{user.email}</b>
          </span>
        </div>
        <div style={{ marginTop: "28px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              padding: "13px 24px",
              borderRadius: "14px",
              background: "#3dff7a",
              color: "#04130a",
              border: "none",
              cursor: "pointer",
              font: '700 0.85rem "JetBrains Mono", monospace',
            }}
          >
            Back to home
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace("/");
            }}
            style={{
              padding: "13px 24px",
              borderRadius: "14px",
              background: "transparent",
              color: "#8a9a92",
              border: "1px solid #1d2a24",
              cursor: "pointer",
              font: '700 0.85rem "JetBrains Mono", monospace',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
