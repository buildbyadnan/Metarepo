"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

/**
 * MetaRepo landing — ported from the "MetaRepo: The Development Universe"
 * design reference (dark/green mono, horizontally scrolling panels).
 * The CSS ships with the component so it only applies while this page is
 * mounted; everything is scoped to this route's lifecycle.
 */
const LANDING_CSS = `
:root{
  color-scheme:dark;
  --bg:#07090a; --card:#0e1311; --line:#1d2a24; --text:#e8f1ec; --mute:#8a9a92;
  --g1:#3dff7a; --g2:#1fa84f; --g3:#0b3d1f;
  --mx:50%; --my:50%;
  box-sizing:border-box;
  padding-top:env(safe-area-inset-top,0px); padding-bottom:env(safe-area-inset-bottom,0px);
}
:root:not([data-theme="light"]){--bg:#07090a}
:root[data-theme="dark"]{--bg:#07090a}
*,*::before,*::after{box-sizing:inherit}
html,body{height:100%;margin:0;background:var(--bg);color:var(--text);font-family:Sora,system-ui,sans-serif;overflow:hidden}
.mono{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace}
#glow{position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(520px circle at var(--gx,70%) var(--gy,60%),rgba(61,255,122,.16),transparent 60%)}
#track{position:relative;z-index:1;display:flex;height:100%;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior:contain}
#track::-webkit-scrollbar{display:none}
.panel{flex:0 0 100vw;width:100vw;height:100%;padding:clamp(20px,5vw,72px);padding-bottom:84px;display:flex;flex-direction:column;justify-content:center;gap:28px;overflow-y:auto;scrollbar-width:none}
.panel::-webkit-scrollbar{display:none}
h1,h2{margin:0;font-family:"JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.04em}
h1{font-size:clamp(2.6rem,9vw,8rem);line-height:.95;color:var(--g1);text-shadow:0 0 40px rgba(61,255,122,.45)}
h2{font-size:clamp(1.4rem,3.4vw,2.6rem)}
p{margin:0;color:var(--mute);line-height:1.6;max-width:56ch}
a{color:var(--g1);text-decoration:none}
a:focus-visible,button:focus-visible{outline:2px solid var(--g1);outline-offset:3px}

/* hero */
.hero{flex-direction:row;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap}
.hero .copy{display:flex;flex-direction:column;gap:20px;flex:1 1 380px}
.sub{font-size:clamp(1rem,2vw,1.4rem);color:var(--text);font-weight:300}
.badges{display:flex;flex-wrap:wrap;gap:8px;max-width:620px}
.badges span{font-size:.72rem;padding:6px 12px;border:1px solid var(--line);border-radius:99px;color:var(--mute);background:rgba(14,19,17,.7);transition:.25s}
.badges span:hover{color:var(--g1);border-color:var(--g1);box-shadow:0 0 18px rgba(61,255,122,.5)}
.hint{font-size:.75rem;color:var(--g1);display:flex;align-items:center;gap:10px}
.hint i{display:inline-block;width:36px;height:1px;background:var(--g1);animation:nudge 1.8s ease-in-out infinite}
@keyframes nudge{50%{transform:translateX(14px)}}
.orb{position:relative;width:clamp(200px,32vw,420px);aspect-ratio:1;border-radius:50%;flex:0 0 auto;margin:auto;
  background:radial-gradient(circle at 50% 40%,rgba(61,255,122,.5),var(--g3) 55%,#05140a);
  box-shadow:0 0 90px rgba(61,255,122,.35),inset 0 0 60px rgba(61,255,122,.25);display:grid;place-items:center;transition:box-shadow .4s,transform .4s}
.orb:hover{box-shadow:0 0 140px rgba(61,255,122,.6),inset 0 0 80px rgba(61,255,122,.4);transform:scale(1.03)}
.orb .core{width:38%;aspect-ratio:1;border-radius:22%;background:linear-gradient(145deg,#2fe06a,#0f6a30);border:1px solid rgba(255,255,255,.25);display:grid;place-items:center;font-size:clamp(1.4rem,4vw,3rem);box-shadow:0 0 40px rgba(61,255,122,.7)}
.orb .tag{position:absolute;bottom:14%;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase}

/* cards */
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));width:100%;max-width:1200px}
.card{position:relative;padding:24px;border-radius:22px;background:var(--card);border:1px solid var(--line);display:flex;flex-direction:column;gap:10px;overflow:hidden;transition:transform .35s,border-color .35s,box-shadow .35s;min-height:170px}
.card::before{content:"";position:absolute;inset:0;background:radial-gradient(260px circle at var(--mx) var(--my),rgba(61,255,122,.22),transparent 65%);opacity:0;transition:opacity .3s;pointer-events:none}
.card:hover{transform:translateY(-6px);border-color:rgba(61,255,122,.7);box-shadow:0 0 34px rgba(61,255,122,.28),0 20px 50px rgba(0,0,0,.5)}
.card:hover::before{opacity:1}
.card h3{margin:0;font:700 .85rem "JetBrains Mono",monospace;letter-spacing:.08em;text-transform:uppercase;position:relative}
.card p{font-size:.88rem;position:relative}
.card .ic{font-size:1.5rem;width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(145deg,#1d6b3a,#0b3d1f);box-shadow:0 0 16px rgba(61,255,122,.35);position:relative}
.card.hot{background:linear-gradient(160deg,#145a30,#0b2f19);border-color:rgba(61,255,122,.5);border-style:dashed}
.card.hot p{color:#b6e6c6}
.card .path{font-size:.7rem;color:var(--g2);position:relative}

pre{margin:0;padding:22px;border-radius:18px;background:#050807;border:1px solid var(--line);color:#b6e6c6;font-size:clamp(.72rem,1.6vw,.9rem);line-height:1.8;overflow-x:auto;max-width:720px;width:100%;transition:.3s}
pre:hover{border-color:var(--g1);box-shadow:0 0 36px rgba(61,255,122,.3)}
pre b{color:var(--g1);font-weight:400}
.cta{display:inline-block;align-self:flex-start;padding:14px 26px;border-radius:14px;background:var(--g1);color:#04130a;font:700 .85rem "JetBrains Mono",monospace;transition:.3s;border:none;cursor:pointer;text-transform:none}
.cta:hover{box-shadow:0 0 40px rgba(61,255,122,.8);transform:translateY(-3px)}
.quote{font-style:italic;color:var(--text)}

/* nav */
#bar{position:fixed;left:0;top:0;height:3px;width:0;background:var(--g1);box-shadow:0 0 14px var(--g1);z-index:5}
#nav{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:5;display:flex;gap:6px;padding:8px;border-radius:99px;background:rgba(14,19,17,.8);border:1px solid var(--line);backdrop-filter:blur(10px);max-width:96vw}
#nav button{all:unset;cursor:pointer;font:.68rem "JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.06em;padding:8px 12px;border-radius:99px;color:var(--mute);transition:.25s;white-space:nowrap}
#nav button:hover{color:var(--g1);box-shadow:0 0 16px rgba(61,255,122,.45)}
#nav button.on{background:var(--g1);color:#04130a}
@media (max-width:560px){#nav button{padding:8px 9px;font-size:.6rem}.hero{flex-direction:column-reverse}.orb{width:56vw}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

const NAV_NAMES = ["Home", "Mission", "Projects", "Stack", "Start"];

const BADGES = [
  "AWS",
  "GCP",
  "Azure",
  "Cloudflare",
  "Kubernetes",
  "Docker",
  "Kafka",
  "Go",
  "Rust",
  "NestJS",
];

type CardData = {
  ic?: string;
  title: string;
  body: string;
  path?: string;
  hot?: boolean;
};

const MISSION_CARDS: CardData[] = [
  {
    hot: true,
    ic: "☁",
    title: "Every cloud",
    body: "Real deployment configs for AWS, GCP, Azure, Cloudflare, Heroku, and edge providers.",
  },
  {
    ic: "⚙",
    title: "DevOps & MLOps",
    body: "End-to-end blueprints: CI/CD pipelines, monitoring, observability, and infrastructure-as-code.",
  },
  {
    ic: "▣",
    title: "Production templates",
    body: "Boilerplates for Kubernetes, Kafka, Prometheus, Docker, and more.",
  },
  {
    ic: "{ }",
    title: "Many languages",
    body: "Node.js, NestJS, Go, Rust, Java/Spring Boot, and every stack I explore.",
  },
];

const HIGHLIGHT_CARDS: CardData[] = [
  {
    hot: true,
    ic: "🌐",
    title: "MetaRepo Web",
    body: "The product front door — landing, dashboard, and your documents, auth-aware on every render.",
    path: "apps/web",
  },
  {
    ic: "⚙",
    title: "API Server",
    body: "Hono on Cloudflare Workers: Google OAuth, sessions, and the documents API on D1 + R2.",
    path: "apps/server",
  },
  {
    ic: "🔐",
    title: "Auth Kit",
    body: "Google OAuth with PKCE, constant-time state checks, and refresh tokens — shared everywhere.",
    path: "packages/auth",
  },
  {
    ic: "🔗",
    title: "HTTP utils",
    body: "Timeout-aware fetch, HMAC session hashing, AES-GCM encryption for refresh tokens.",
    path: "packages/http",
  },
  {
    ic: "🎯",
    title: "API contracts",
    body: "Typed route constants — one source of truth for the web app and the server.",
    path: "packages/api-endpoints",
  },
  {
    ic: "📊",
    title: "CI & CD",
    body: "GitHub Actions builds, tests, and ships both apps to Cloudflare with OpenNext.",
    path: ".github/workflows",
  },
];

const STACK_CARDS: CardData[] = [
  { title: "Frameworks", body: "Next.js 16, React 19" },
  { title: "Logic & types", body: "TypeScript, Nx, pnpm" },
  { title: "Database & storage", body: "Cloudflare D1, Drizzle, R2" },
  { hot: true, title: "Infrastructure", body: "Cloudflare Workers via OpenNext" },
];

function GoogleGIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * The one CTA used in the hero and the start panel:
 *   not signed in  -> Sign in with Google
 *   signed in      -> Open your documents
 */
function CtaButton() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <button className="cta" type="button" disabled style={{ opacity: 0.6, cursor: "default" }}>
        Checking session…
      </button>
    );
  }

  if (user) {
    return (
      <button className="cta" type="button" onClick={() => router.push("/documents")}>
        Open your documents →
      </button>
    );
  }

  return (
    <button className="cta" type="button" onClick={login}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
        <GoogleGIcon />
        Sign in with Google
      </span>
    </button>
  );
}

function renderCard(card: CardData) {
  return (
    <div key={card.title} className={card.hot ? "card hot" : "card"}>
      {card.ic ? <div className="ic">{card.ic}</div> : null}
      <h3>{card.title}</h3>
      <p>{card.body}</p>
      {card.path ? <span className="path mono">{card.path}</span> : null}
    </div>
  );
}

// Human copy for the OAuth failure codes the callback can append as
// ?auth_error=… — users should never have to decode raw codes.
const AUTH_ERROR_COPY: Record<string, string> = {
  callback_failed: "something went wrong completing your sign-in. Please try again.",
  invalid_state: "your sign-in session expired. Please try again.",
  missing_params: "Google did not finish handing back the sign-in. Please try again.",
  invalid_user: "Google did not return a valid account. Please try again.",
  invalid_email: "that Google account has no usable email address.",
};

export function MetarepoLanding() {
  const [authError, setAuthError] = useState<string | null>(null);

  const trackRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const goRef = useRef<((i: number) => void) | null>(null);

  // Surface OAuth failures (?auth_error=...) and clean the URL afterwards.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("auth_error");
    if (err) {
      setAuthError(err);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Horizontal scroll controller (wheel -> animated scroll, arrow keys,
  // progress bar, nav highlight, pointer glow) — ported from the reference.
  useEffect(() => {
    const t = trackRef.current;
    const bar = barRef.current;
    const nav = navRef.current;
    if (!t || !bar || !nav) return;

    let target = t.scrollLeft;
    let raf: number | null = null;

    const max = () => t.scrollWidth - t.clientWidth;

    const tick = () => {
      const d = target - t.scrollLeft;
      if (Math.abs(d) < 0.5) {
        t.scrollLeft = target;
        raf = null;
        return;
      }
      t.scrollLeft += d * 0.12;
      raf = requestAnimationFrame(tick);
    };

    const go = (i: number) => {
      target = Math.max(0, Math.min(max(), i * t.clientWidth));
      if (raf === null) raf = requestAnimationFrame(tick);
    };
    goRef.current = go;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (raf === null) target = t.scrollLeft;
      target = Math.max(0, Math.min(max(), target + e.deltaY * 1.4));
      if (raf === null) raf = requestAnimationFrame(tick);
    };

    const onKey = (e: KeyboardEvent) => {
      const i = Math.round(t.scrollLeft / t.clientWidth);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(i + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(i - 1);
      }
    };

    const onScroll = () => {
      const m = max();
      bar.style.width = (m ? (t.scrollLeft / m) * 100 : 0) + "%";
      const i = Math.round(t.scrollLeft / t.clientWidth);
      const btns = nav.children;
      for (let k = 0; k < btns.length; k++) {
        btns[k].classList.toggle("on", k === i);
      }
    };

    const onResize = () => {
      target = t.scrollLeft;
    };

    const onPointer = (e: PointerEvent) => {
      document.documentElement.style.setProperty("--gx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--gy", `${e.clientY}px`);
      const c = e.target instanceof Element ? e.target.closest<HTMLElement>(".card") : null;
      if (c) {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", `${e.clientX - r.left}px`);
        c.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    };

    t.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    t.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    t.dispatchEvent(new Event("scroll"));

    return () => {
      t.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      t.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      if (raf !== null) cancelAnimationFrame(raf);
      goRef.current = null;
    };
  }, []);

  return (
    <>
      <style>{LANDING_CSS}</style>
      <div id="glow" />
      <div id="bar" ref={barRef} />
      <main id="track" ref={trackRef}>
        {/* ── Home ─────────────────────────────────────────────── */}
        <section className="panel hero" id="p0">
          <div className="copy">
            <h1>
              Meta
              <br />
              Repo
            </h1>
            <div className="sub">The Development Universe</div>
            <p>
              A unified monorepo containing all my work, from personal projects and
              open-source libraries to my portfolio and coding experiments. A single place
              to track my development journey, share ideas, and build in the open.
            </p>
            <p className="mono" style={{ color: "var(--text)", fontSize: "0.85rem" }}>
              Major things coming soon here from private repos 😅
            </p>
            <div className="badges mono">
              {BADGES.map((b) => (
                <span key={b}>{b}</span>
              ))}
            </div>
            <CtaButton />
            {authError ? (
              <p className="mono" style={{ color: "#ff6b85", fontSize: "0.75rem" }}>
                Google sign-in failed —{" "}
                {AUTH_ERROR_COPY[authError] ?? `please try again (code: ${authError}).`}
              </p>
            ) : null}
            <a
              className="mono hint"
              href="#p1"
              onClick={(e) => {
                e.preventDefault();
                goRef.current?.(1);
              }}
            >
              <i />
              Scroll to explore
            </a>
          </div>
          <div className="orb">
            <div className="core">⌘</div>
            <span className="tag mono">Open monorepo</span>
          </div>
        </section>

        {/* ── Mission ──────────────────────────────────────────── */}
        <section className="panel" id="p1">
          <h2>The mission</h2>
          <p>A living showcase of best practices in DevOps, MLOps, and cloud-native engineering.</p>
          <div className="grid">{MISSION_CARDS.map(renderCard)}</div>
        </section>

        {/* ── Projects ─────────────────────────────────────────── */}
        <section className="panel" id="p2">
          <h2>Repository highlights</h2>
          <p>
            Everything lives in one repo on GitHub — open, typed, tested, and deployable
            from a single push.
          </p>
          <div className="grid">{HIGHLIGHT_CARDS.map(renderCard)}</div>
        </section>

        {/* ── Stack ────────────────────────────────────────────── */}
        <section className="panel" id="p3">
          <h2>The tech stack</h2>
          <p>Industrial-strength, scalable, type-safe, and ready for the edge.</p>
          <div className="grid">{STACK_CARDS.map(renderCard)}</div>
        </section>

        {/* ── Start ────────────────────────────────────────────── */}
        <section className="panel" id="p4">
          <h2>Get started</h2>
          <pre className="mono">
            <b>$</b> git clone https://github.com/buildbyadnan/Metarepo.git{"\n"}
            <b>$</b> cd Metarepo{"\n"}
            <b>$</b> pnpm install{"\n"}
            <b>$</b> pnpm dev
          </pre>
          <p>
            Nx keeps every app and package typed and fast. The web app deploys through
            OpenNext straight onto Cloudflare Workers — one push to main and it&apos;s
            live. Signing in with Google takes you straight to your personal documents
            cloud — PDFs and DOCX, private to your account.
          </p>
          <CtaButton />
          <p className="quote">“Building the future, one commit at a time.” Adnan</p>
        </section>
      </main>

      <nav id="nav" className="mono" ref={navRef}>
        {NAV_NAMES.map((n, i) => (
          <button key={n} type="button" onClick={() => goRef.current?.(i)}>
            {n}
          </button>
        ))}
      </nav>
    </>
  );
}
