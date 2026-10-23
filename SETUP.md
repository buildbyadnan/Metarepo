# Setup Guide

Complete step-by-step instructions to get MetaRepo running locally.

---

## Prerequisites

| Tool         | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| **Node.js**  | 24+     | Runtime (`cat .node-version`)   |
| **npm**      | 10+     | Package manager                 |
| **Wrangler** | 4+      | Cloudflare Workers CLI (npx)    |

You also need accounts for:

- **Cloudflare** — Workers + D1 + R2 database (free tier works)
- **Google Cloud Console** — OAuth 2.0 credentials

---

## 1. Download & Install

Download your product from [adnanbuilds.online/dashboard](https://adnanbuilds.online/dashboard).

```bash
unzip saas-launchkit-pro.zip
cd saas-launchkit-pro
npm install
```

---

## 2. Environment Setup

### Server (API)

```bash
cp apps/server/.dev.vars.example apps/server/.dev.vars
```

Edit `apps/server/.dev.vars` with your credentials:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ALLOWED_ORIGINS=http://localhost:3000
WEB_APP_URL=http://localhost:3000
SESSION_SECRET=your-session-secret-min-32-chars
```

Generate a secure session secret:

```bash
openssl rand -base64 32
```

### Web (Frontend)

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

The default values work for local development. To customize the app name, add:

```env
NEXT_PUBLIC_APP_NAME=YourBrandName
```

---

## 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Set **Application type** to "Web application"
6. Add **Authorized redirect URIs**:
   - `http://localhost:8787/auth/google/callback` (local dev)
   - `https://your-production-domain.com/auth/google/callback` (production)
7. Copy the **Client ID** and **Client Secret** into `.dev.vars`

---

## 4. Database Setup

### Create D1 Database

```bash
cd apps/server
npx wrangler d1 create metarepo-db-adnanbuilds-online
```

Copy the `database_id` from the output into `apps/server/wrangler.jsonc`.

### Run Migrations

```bash
cd apps/server
npm run migrate
```

When prompted:
1. Select migration **`0`** (the full schema)
2. Choose **`local`** for local development

Or run directly without the interactive prompt:

```bash
# Local development
npx wrangler d1 execute metarepo-db-adnanbuilds-online --local --file=./drizzle/0000_small_sauron.sql

# Production (remote)
npx wrangler d1 execute metarepo-db-adnanbuilds-online --remote --file=./drizzle/0000_small_sauron.sql
```

The whole schema lives in a single `0000` migration (base tables + document shares + custom categories). It assumes an **empty** database: on a database that already has these tables, either reset it first or apply the changes manually — re-running the file will fail on existing tables. If you edit the schema later, `npx drizzle-kit generate` appends a new numbered migration.

### Create the R2 Bucket (document storage)

Uploaded documents live in a private Cloudflare R2 bucket:

```bash
cd apps/server
npx wrangler r2 bucket create metarepo-cloud-storage
```

The `DOCS_BUCKET` binding in `apps/server/wrangler.jsonc` already points at this bucket — files are only served through the authenticated API, never publicly.

---

## 5. Rate Limiting (Optional)

Rate limiting uses Cloudflare KV. To enable:

```bash
cd apps/server
npx wrangler kv namespace create RATE_LIMIT_KV
```

Add the output to `apps/server/wrangler.jsonc` under `kv_namespaces`:

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "RATE_LIMIT_KV",
      "id": "your-kv-namespace-id"
    }
  ]
}
```

Without KV, rate limiting is disabled (the server logs a warning on startup).

---

## 6. Start Development

Open two terminals:

```bash
# Terminal 1 — API Server (port 8787)
npx nx dev @repo/server

# Terminal 2 — Frontend (port 3000)
npx nx dev @repo/web
```

> You can also use `npm run dev --workspace=@repo/server` / `npm run dev --workspace=@repo/web`.

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

---

## 7. Production Deployment

### Set Cloudflare Secrets

```bash
cd apps/server
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put ALLOWED_ORIGINS
npx wrangler secret put WEB_APP_URL
npx wrangler secret put SESSION_SECRET
```

### Update CORS

Update `ALLOWED_ORIGINS` to include your production domain:

```
https://your-domain.com,http://localhost:3000
```

### Deploy

```bash
# Push to main — GitHub Actions handles deployment
git push origin main
```

Or deploy manually:

```bash
npx nx deploy @repo/server
npx nx deploy @repo/web
```

---

## Customization

### Branding

Edit `apps/web/src/config/branding.ts` to change the app name, tagline, and URL:

```ts
export const BRANDING = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "YourApp",
  tagline: "Your tagline here",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;
```

Or set the `NEXT_PUBLIC_APP_NAME` environment variable in `apps/web/.env.local`.

### Dashboard

The dashboard is at `apps/web/src/app/dashboard/page.tsx`. Customize the UI, add settings pages, or extend the security overview.

### Database Schema

The database schema lives in `apps/server/src/db/tables/`. After modifying:

```bash
cd apps/server
npx drizzle-kit generate
npm run migrate
```

---

## Troubleshooting

| Issue                                | Solution                                                       |
| ------------------------------------ | -------------------------------------------------------------- |
| Google sign-in fails                 | Verify redirect URIs match exactly in Google Cloud Console     |
| D1 database error                    | Run migrations: `npm run migrate` (in apps/server)            |
| CORS error                           | Update `ALLOWED_ORIGINS` in `.dev.vars`                        |
| Port conflict                        | Change port in wrangler.jsonc (server) or next.config.ts (web) |
| Rate limiting not working            | Set up KV namespace (see Rate Limiting section)                |
