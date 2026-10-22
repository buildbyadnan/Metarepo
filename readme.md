<div align="center" style="margin-bottom: 1.5rem;">
  <img src="apps/portfolio/v2/public/metarepo_image-removebg-preview.png" alt="MetaRepo Logo" width="220" style="margin-bottom: 0.5rem;" />
  <h1 style="font-size:2.5rem; font-weight:900; margin:0.5rem 0; letter-spacing:1px; color:#06b6d4;">MetaRepo</h1>
  <p style="font-size:1.2rem; color:#333; margin-bottom:0.5rem;">
    <b>The Development Universe</b>
  </p>
  <p style="font-size:1rem; color:#444; max-width:600px; margin:0 auto;">
    A unified monorepo containing all my work — my portfolio UIs (v1 & v2) and the
    SaaS LaunchKit Pro foundation — orchestrated with Nx, built on Next.js 16 and
    deployed to Cloudflare.
  </p>
  <p>
    <a href="https://adnanthecoder.com" style="font-size:1.1rem; font-weight:700; color:#06b6d4;">adnanthecoder.com</a>
  </p>
</div>

---

## 📂 Repository Structure

```
Metarepo/
├── apps/
│   ├── web/                    # SaaS LaunchKit Pro frontend (Next.js 16 + Tailwind v4)
│   ├── server/                 # Hono API on Cloudflare Workers + D1 + Drizzle
│   └── portfolio/
│       ├── v1/                 # Portfolio v1 — cyberpunk edition (Next.js 16)
│       └── v2/                 # Portfolio v2 — flagship site (Next.js 16)
├── packages/
│   ├── api-endpoints/          # @repo/api-endpoints — API route constants
│   ├── http/                   # @repo/http — shared HTTP/crypto utilities
│   ├── products/               # @repo/products — product catalog config
│   └── types/                  # @repo/types — shared TypeScript types
├── .github/workflows/          # CI + per-app Cloudflare deploy pipelines
├── Architecture.md             # SaaS LaunchKit Pro architecture reference
└── SETUP.md                    # SaaS LaunchKit Pro setup reference
```

> The portfolio apps (`apps/portfolio/*`) are **UI-only backups** — their booking and
> contact forms are front-end flows with no backend wired in this repo.
>
> `Architecture.md` and `SETUP.md` document the full SaaS LaunchKit Pro kit;
> this repo intentionally does not vendor the kit's `auth` and `payments` packages.

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js 16 + React 19, Tailwind CSS v4 |
| **Backend** | Hono.js 4 on Cloudflare Workers |
| **Database** | Cloudflare D1 + Drizzle ORM |
| **Build** | Nx + SWC, pnpm workspaces, TypeScript |
| **Testing** | Vitest |
| **CI/CD** | GitHub Actions → OpenNext → Cloudflare Workers |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (24 recommended — see `.node-version`)
- pnpm 10 (via corepack: `corepack enable`)

### Install

```bash
git clone https://github.com/Adnan-The-Coder/Metarepo.git
cd Metarepo
pnpm install
```

### Run

```bash
# Portfolio v2 (flagship site)
pnpm exec nx dev @repo/portfolio-v2

# Portfolio v1 (cyberpunk edition)
pnpm exec nx dev @repo/portfolio-v1

# LaunchKit frontend
pnpm exec nx dev @repo/web

# API server (port 8787)
pnpm exec nx dev @repo/server
```

### Common Tasks

```bash
pnpm exec nx run-many -t build      # Build everything
pnpm exec nx run-many -t typecheck  # Typecheck everything
pnpm exec nx run-many -t lint       # Lint
pnpm exec vitest run                # Run tests
pnpm run format                     # Prettier format
```

---

## 📡 Deployment

Each deployable app has its own GitHub Actions workflow, triggered by path-filtered
pushes to `main`:

| Workflow | Deploys |
| --- | --- |
| `deploy.web.yml` | `apps/web` → Cloudflare Workers |
| `deploy.server.yml` | `apps/server` → Cloudflare Workers |
| `deploy.portfolio-v1.yml` | `apps/portfolio/v1` → Cloudflare Workers |
| `deploy.portfolio-v2.yml` | `apps/portfolio/v2` → Cloudflare Workers |
| `ci.yml` | build + typecheck + lint + test on every push/PR |

Required repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

---

<p align="center">
  <i>"Building the future, one commit at a time."</i><br>
  <b>Adnan • <a href="https://adnanthecoder.com">adnanthecoder.com</a></b>
</p>
