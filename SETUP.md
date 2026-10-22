# Setup Guide

Complete step-by-step instructions to get SaaS LaunchKit Pro running locally.

---

## Prerequisites

| Tool         | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| **Node.js**  | 24+     | Runtime (`cat .node-version`)   |
| **npm**      | 10+     | Package manager                 |
| **Wrangler** | 4+      | Cloudflare Workers CLI (npx)    |

You also need accounts for:

- **Cloudflare** — Workers + D1 database (free tier works)
- **Google Cloud Console** — OAuth 2.0 credentials
- **Razorpay** — Payment gateway (test mode for development)

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
RAZORPAY_KEY_ID=rzp_test_your-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
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

## 4. Razorpay Setup

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in
3. Go to **Settings > API Keys**
4. Generate **Test Mode** keys
5. Copy **Key ID** and **Key Secret** into `.dev.vars`
6. For webhooks (optional for local dev):
   - Go to **Settings > Webhooks**
   - Add webhook URL: `https://your-production-domain.com/payments/webhook`
   - Select events: `payment.captured`, `payment.failed`
   - Copy the **Webhook Secret** into `.dev.vars`

---

## 5. Database Setup

### Create D1 Database

```bash
cd apps/server
npx wrangler d1 create repo-db
```

Copy the `database_id` from the output into `apps/server/wrangler.jsonc`.

### Run Migrations

```bash
cd apps/server
npm run migrate
```

When prompted:
1. Select migration **`0`** (the initial schema)
2. Choose **`local`** for local development

Or run directly without the interactive prompt:

```bash
# Local development
npx wrangler d1 execute repo-db --local --file=./drizzle/0000_greedy_maria_hill.sql

# Production (remote)
npx wrangler d1 execute repo-db --remote --file=./drizzle/0000_greedy_maria_hill.sql
```

---

## 6. Rate Limiting (Optional)

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

## 7. Start Development

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

## 8. Production Deployment

### Set Cloudflare Secrets

```bash
cd apps/server
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put ALLOWED_ORIGINS
npx wrangler secret put WEB_APP_URL
npx wrangler secret put SESSION_SECRET
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
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

### Products & Pricing

Edit `packages/products/src/index.ts` to configure your product catalog, pricing, and features.

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
| `Payment gateway not configured`     | Add Razorpay keys to `.dev.vars` or Cloudflare secrets         |
| Google sign-in fails                 | Verify redirect URIs match exactly in Google Cloud Console     |
| D1 database error                    | Run migrations: `npm run migrate` (in apps/server)            |
| CORS error                           | Update `ALLOWED_ORIGINS` in `.dev.vars`                        |
| Port conflict                        | Change port in wrangler.jsonc (server) or next.config.ts (web) |
| Rate limiting not working            | Set up KV namespace (see Rate Limiting section)                |
