<div align="center" style="margin-bottom: 1.5rem;">
  <img src="apps/web/public/metarepo-logo.png" alt="MetaRepo Logo" width="220" style="margin-bottom: 0.5rem;" />
  <h1 style="font-size:2.5rem; font-weight:900; margin:0.5rem 0; letter-spacing:1px; color:#3dff7a;">MetaRepo</h1>
  <p style="font-size:1.2rem; color:#333; margin-bottom:0.5rem;">
    <b>The Development Universe</b>
  </p>
  <p style="font-size:1rem; color:#444; max-width:600px; margin:0 auto;">
    One open monorepo for everything I build — a dark, green, mono-styled web app
    where every visitor signs in with Google and lands on the waitlist until
    approved. Next.js 16 + Hono on Cloudflare Workers, orchestrated with Nx.
  </p>
  <p>
    <a href="https://metarepo.adnanbuilds.online" style="font-size:1.1rem; font-weight:700; color:#3dff7a;">metarepo.adnanbuilds.online</a>
  </p>
</div>

---

## 📂 Repository Structure

```
Metarepo/
├── apps/
│   ├── web/                    # MetaRepo web — landing, waitlist, dashboard (Next.js 16 + Tailwind v4)
│   └── server/                 # Hono API — Google OAuth, sessions, waitlist (Cloudflare Workers + D1 + Drizzle)
├── packages/
│   ├── api-endpoints/          # @repo/api-endpoints — typed API route constants
│   ├── auth/                   # @repo/auth — Google OAuth (PKCE, state checks, token exchange/refresh)
│   └── http/                   # @repo/http — shared HTTP/crypto utilities (fetch, HMAC, AES-GCM)
├── .github/workflows/          # CI + deploy pipelines
├── Architecture.md             # SaaS LaunchKit Pro architecture reference
└── SETUP.md                    # SaaS LaunchKit Pro setup reference
```

> `Architecture.md` and `SETUP.md` document the SaaS LaunchKit Pro kit this repo
> is built on. The kit's **auth** package is vendored here (`packages/auth`);
> its **payments** package intentionally is not.

---

## 🔐 Auth & Waitlist Flow

1. A visitor clicks **Sign in with Google** on the landing page → `GET /auth/google`
   (PKCE + state cookies) → Google consent screen.
2. The callback upserts the identity (`users` / `accounts`), creates a session
   cookie, and **adds the email to the `waitlist` table with `status = 'pending'`**.
3. Waitlisted users are routed to **`/waitlist`** — the dashboard is gated until
   approval. Approved users go straight to **`/dashboard`**.
4. You approve people manually (before/during production):

   ```bash
   # via wrangler (D1)
   npx wrangler d1 execute repo-db --remote \
     --command="UPDATE waitlist SET status='approved' WHERE email='someone@example.com'"

   # or via drizzle studio
   cd apps/server && pnpm studio
   ```

   `GET /auth/me` reports `{ user, waitlisted, waitlistStatus }` so the web app
   can gate routes client-side (middleware handles the session-cookie check).

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js 16 + React 19, Tailwind CSS v4 |
| **Backend** | Hono.js 4 on Cloudflare Workers |
| **Auth** | Google OAuth 2.0 (PKCE) — `packages/auth` |
| **Database** | Cloudflare D1 + Drizzle ORM |
| **Build** | Nx + SWC, pnpm workspaces, TypeScript |
| **Testing** | Vitest |
| **CI/CD** | GitHub Actions → OpenNext → Cloudflare Workers |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (24 recommended — see `.node-version`)
- pnpm (via corepack: `corepack enable`)

> **Note on pnpm versions:** this repo pins pnpm through the `packageManager`
> field in `package.json` (`pnpm@10.12.1`). pnpm automatically switches to the
> pinned version inside the repo, so seeing `10.12.1` from `pnpm --version`
> here while your global pnpm is newer is expected, not a bug. CI follows the
> same pin automatically.

### Install

```bash
git clone https://github.com/buildbyadnan/Metarepo.git
cd Metarepo
pnpm install
```

### Configure

```bash
# Web app — where the API lives
cp apps/web/.env.local.example apps/web/.env.local

# API server — Google OAuth credentials + session secret
cp apps/server/.dev.vars.example apps/server/.dev.vars
```

Create an OAuth client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
(type: **Web application**) with:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:8787/auth/google/callback`

and put the client id/secret into `apps/server/.dev.vars`.

### Run

```bash
# Interactive: asks which app you want to run
pnpm dev

# Or jump straight to one app
pnpm dev web
pnpm dev server   # API on port 8787
```

### Database (server)

```bash
cd apps/server
pnpm generate     # drizzle-kit generate — create/refresh SQL migrations
pnpm migrate      # apply a migration to local or remote D1
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

Each app has its own GitHub Actions workflow. Both are **manual-only**
(`workflow_dispatch`) until the `wrangler.jsonc` placeholders are configured —
fill in the real worker names and D1 database id, then either trigger from the
Actions tab or restore the `push` triggers in the workflow files:

| Workflow | Deploys | Trigger |
| --- | --- | --- |
| `deploy.web.yml` | `apps/web` → Cloudflare Workers | manual (worker name placeholder pending) |
| `deploy.server.yml` | `apps/server` → Cloudflare Workers | manual (D1 + worker placeholders pending) |
| `ci.yml` | build + typecheck + lint + test on every push/PR | push/PR |

Required repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

For the server's first real deploy you also need worker vars:
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` (32+ chars),
`WEB_APP_URL`, `ALLOWED_ORIGINS`.

---

<p align="center">
  <i>"Building the future, one commit at a time."</i><br>
  <b>Adnan • <a href="https://metarepo.adnanbuilds.online">metarepo.adnanbuilds.online</a></b>
</p>
