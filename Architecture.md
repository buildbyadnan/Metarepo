# MetaRepo — Architecture

## Tech Stack

| Layer        | Technology              | Purpose                                  |
| ------------ | ----------------------- | ---------------------------------------- |
| **Frontend** | Next.js 16 + React 19   | App Router, SSR, streaming               |
| **Styling**  | Tailwind CSS v4         | Utility-first CSS                        |
| **Backend**  | Hono.js 4               | Lightweight, fast edge framework         |
| **Database** | Cloudflare D1           | Serverless SQLite at the edge            |
| **ORM**      | Drizzle ORM             | Type-safe SQL queries                    |
| **Auth**     | Google OAuth 2.0 + PKCE | Secure, industry-standard authentication |
| **Runtime**  | Cloudflare Workers      | Global edge deployment                   |
| **Build**    | Nx + SWC → Bazel (migrating) | Monorepo orchestration, fast compilation; Bazel joining for multi-language |
| **CI/CD**    | GitHub Actions          | Automated testing and deployment         |
| **Language** | TypeScript 6            | End-to-end type safety                   |

---

## Project Structure

```
metarepo/
├── apps/
│   ├── web/                                  # Next.js 16 Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx                # Root layout + metadata
│   │   │   │   ├── page.tsx                  # Landing page
│   │   │   │   ├── loading.tsx               # Root loading state
│   │   │   │   ├── error.tsx                 # Root error boundary
│   │   │   │   ├── global-error.tsx          # Global error boundary
│   │   │   │   ├── not-found.tsx             # 404 page
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── layout.tsx            # Dashboard layout (noindex)
│   │   │   │   │   ├── page.tsx              # Protected dashboard
│   │   │   │   │   ├── loading.tsx           # Dashboard loading state
│   │   │   │   │   └── error.tsx             # Dashboard error boundary
│   │   │   │   └── documents/
│   │   │   │       ├── layout.tsx            # Documents layout (noindex)
│   │   │   │       └── page.tsx              # Documents page (tabs, filters, dialogs)
│   │   │   ├── components/
│   │   │   │   ├── landing-page.tsx          # Hero + features + pricing
│   │   │   │   ├── signup-modal.tsx          # Auth modal
│   │   │   │   ├── modal.tsx                 # Reusable dialog component
│   │   │   │   ├── google-button.tsx         # Google sign-in button
│   │   │   │   ├── app-nav.tsx               # App top navigation
│   │   │   │   └── documents/
│   │   │   │       ├── shared.tsx            # "Shared with me" list
│   │   │   │       ├── document-view-modal.tsx # PDF iframe / DOCX preview
│   │   │   │       ├── docx-preview.tsx      # Client-side DOCX render (docx-preview)
│   │   │   │       ├── share-dialog.tsx      # Email share dialog
│   │   │   │       ├── category-picker.tsx   # Category select
│   │   │   │       └── manage-categories-dialog.tsx # Create/rename/delete categories
│   │   │   ├── config/
│   │   │   │   ├── landing-page.tsx          # Hero + features + pricing
│   │   │   │   ├── signup-modal.tsx          # Auth modal
│   │   │   │   ├── modal.tsx                 # Reusable dialog component
│   │   │   │   └── google-button.tsx         # Google sign-in button
│   │   │   ├── config/
│   │   │   │   └── branding.ts              # Centralized branding config
│   │   │   ├── contexts/
│   │   │   │   └── auth-context.tsx          # Auth state management
│   │   │   └── lib/
│   │   │       └── api.ts                    # API client with retry logic
│   │   ├── middleware.ts                       # Auth guard for /dashboard
│   │   ├── next.config.ts                    # Security headers + CSP
│   │   └── wrangler.jsonc                    # Cloudflare Worker config
│   │
│   └── server/                               # Hono.js API Server
│       ├── src/
│       │   ├── index.ts                      # App entry + middleware stack
│       │   ├── types.ts                      # TypeScript bindings
│       │   ├── constants.ts                  # Shared constants
│       │   ├── env.ts                        # Environment validation
│       │   ├── routes/
│       │   │   ├── auth.ts                   # Auth endpoints
│       │   │   ├── documents.ts              # Document + share endpoints
│       │   │   ├── categories.ts             # Custom category CRUD
│       │   │   └── health.ts                 # Health check
│       │   ├── db/
│       │   │   ├── index.ts                  # D1 + Drizzle init
│       │   │   ├── schema.ts                 # Schema exports
│       │   │   └── tables/
│       │   │       ├── users.ts              # User profiles
│       │   │       ├── accounts.ts           # OAuth accounts
│       │   │       ├── sessions.ts           # Session tokens
│       │   │       ├── documents.ts          # Document metadata
│       │   │       ├── document_shares.ts    # Email-keyed shares
│       │   │       └── categories.ts         # User-created categories
│       │   └── lib/
│       │       ├── crypto.ts                 # HMAC-SHA256 hashing
│       │       ├── logger.ts                 # Structured JSON logging
│       │       ├── origins.ts                # CORS origin parsing
│       │       ├── validate.ts               # Shared email validation
│       │       ├── shares.ts                 # Share permission/email helpers
│       │       ├── access.ts                 # resolveDocumentAccess (owner/write/read)
│       │       └── documents.ts              # Title/desc/category normalization, sniffer
│       ├── drizzle/                          # Generated migrations
│       ├── .dev.vars                         # Local secrets (gitignored)
│       └── wrangler.jsonc                    # D1 binding config
│
├── packages/
│   ├── auth/                                 # @repo/auth — OAuth helpers
│   │   └── src/
│   │       ├── google.ts                     # PKCE, token exchange, user info
│   │       ├── google.test.ts                # Auth tests
│   │       ├── index.ts                      # Public exports
│   │       └── types.ts                      # GoogleUser, GoogleTokenResponse
│   │
│   ├── http/                                 # @repo/http — Shared utilities
│   │   └── src/
│   │       ├── index.ts                      # fetchWithTimeout, hmacHex, encrypt/decrypt
│   │       └── index.test.ts                 # HTTP utility tests
│   │
│   └── api-endpoints/                        # @repo/api-endpoints — Route constants
│       └── src/
│           ├── index.ts                      # Public exports
│           └── lib/
│               └── api-endpoints.ts          # Endpoint path constants
│
├── .github/workflows/
│   ├── ci.yml                                # Build + typecheck + lint + test
│   ├── deploy.web.yml                        # Auto-deploy web on push
│   └── deploy.server.yml                     # Auto-deploy server on push
│
├── nx.json                                   # Nx orchestrator config
├── tsconfig.base.json                        # Shared TypeScript config
├── vitest.config.ts                          # Test configuration
├── eslint.config.mjs                         # ESLint flat config
├── .prettierrc                               # Prettier config
├── .editorconfig                             # Editor config
└── package.json                              # Workspace root
```

---

## Authentication Flow

The auth system implements **Google OAuth 2.0 with PKCE** — the industry standard for public clients.

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Browser  │────▶│  Server  │────▶│  Google  │────▶│  Server  │
│           │     │          │     │          │     │          │
│ 1. Click  │     │          │     │          │     │          │
│ "Sign In" │     │          │     │          │     │          │
│──────┐    │     │          │     │          │     │          │
│      │    │     │ 2. Generate     │          │     │          │
│      │    │     │ state + PKCE    │          │     │          │
│      │    │◀────│ 3. Set cookies   │          │     │          │
│      │    │     │    + redirect ──│──────────│────▶│          │
│      │    │     │          │     │          │     │          │
│      │    │     │          │     │ 4. User  │     │          │
│      │    │     │          │     │ authenticates    │          │
│      │    │     │          │     │          │     │          │
│      │    │     │          │◀────│──────────│─────│ 5. Code  │
│      │    │     │ 6. Validate     │          │     │ + state  │
│      │    │     │ state (CSRF)    │          │     │          │
│      │    │     │ 7. Exchange     │          │     │          │
│      │    │     │ code (PKCE) ───│──────────│────▶│          │
│      │    │     │          │     │          │     │          │
│      │    │     │          │◀────│──────────│─────│ 8. Tokens│
│      │    │     │ 9. Fetch user   │          │     │          │
│      │    │     │    profile ────│──────────│────▶│          │
│      │    │     │          │     │          │     │          │
│      │    │     │          │◀────│──────────│─────│ 10. User │
│      │    │     │ 11. Upsert user + account in D1    │ data   │
│      │    │     │ 12. Create session (HMAC-SHA256)    │          │
│      │    │◀────│ 13. Set session cookie     │          │
│      │    │     │ 14. Redirect to app        │          │
│◀─────┘    │     │          │     │          │     │          │
│ 15. Fetch │     │          │     │          │     │          │
│ /auth/me  │────▶│ 16. Validate session       │          │
│◀──────    │◀────│ 17. Return user data       │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

### Step-by-Step Breakdown

| Step  | Description                                                                           |
| ----- | ------------------------------------------------------------------------------------- |
| 1     | User clicks "Sign In" on the frontend                                                 |
| 2     | Server generates cryptographic `state` (CSRF) + `codeVerifier` (PKCE)                 |
| 3     | State and verifier stored in HttpOnly Secure cookies (10min TTL)                      |
| 4     | Browser redirects to Google's authorization endpoint                                  |
| 5     | User authenticates with Google and grants permissions                                 |
| 6     | Google redirects back with authorization `code` + `state`                             |
| 7     | Server validates `state` using **constant-time comparison** (prevents timing attacks) |
| 8     | Server exchanges `code` for tokens using PKCE `codeVerifier`                          |
| 9-10  | Server fetches user profile from Google's userinfo API                                |
| 11    | User and account records upserted in D1 (idempotent)                                  |
| 12    | Session token generated, hashed with **HMAC-SHA256**, stored in D1                    |
| 13    | Raw session token set as HttpOnly Secure cookie (7-day TTL)                           |
| 14    | User redirected to the application                                                    |
| 15-17 | Frontend calls `/auth/me` to validate session and fetch user data                     |

---

## API Reference

### Endpoints

| Method | Path                    | Auth | Description                                                 |
| ------ | ----------------------- | ---- | ----------------------------------------------------------- |
| `GET`  | `/health`               | No   | Health check — returns `{"status":"ok","db":"connected","latency":<ms>}` |
| `GET`  | `/auth/google`          | No   | Initiates Google OAuth flow — redirects to Google           |
| `GET`  | `/auth/google/callback` | No   | OAuth callback — exchanges code, creates session, redirects |
| `GET`  | `/auth/me`              | Yes  | Returns current user profile                                |
| `PATCH` | `/auth/me`             | Yes  | Updates profile fields (currently: notifyUpdates boolean)   |
| `POST` | `/auth/logout`          | Yes  | Destroys session and clears cookie                          |
| `POST` | `/auth/refresh`         | Yes  | Refreshes expired Google tokens using stored refresh token  |
| `GET`  | `/documents`            | Yes  | Lists the signed-in user's documents + storage usage        |
| `POST` | `/documents`            | Yes  | Upload (multipart file + title/description/category); 10 MB/file, 30 MB/user, 50 files |
| `GET`  | `/documents/shared`     | Yes  | Lists documents other users shared with the caller (permission + owner badge) |
| `GET`  | `/documents/:id/content` | Yes | Streams the file from private R2 (inline; ?download=1 → attachment) |
| `PATCH` | `/documents/:id`       | Yes  | Updates title / description (owner or write share); `category` is owner-only (403 for write share) |
| `DELETE` | `/documents/:id`      | Yes  | Deletes metadata + R2 object, owner-only (204 No Content)   |
| `POST` | `/documents/:id/shares` | Yes  | Shares with an email — `read` or `write`; owner-only; activates on recipient's first login |
| `GET`  | `/documents/:id/shares` | Yes  | Lists a document's shares (owner-only) with resolved recipient name |
| `DELETE` | `/documents/:id/shares/:shareId` | Yes | Revokes one share (owner-only) (204 No Content)   |
| `GET`  | `/categories`           | Yes  | Builtin categories + the caller's custom categories         |
| `POST` | `/categories`           | Yes  | Creates a custom category (1–40 chars, max 50/user)         |
| `PATCH` | `/categories/:id`      | Yes  | Renames a category and cascades onto the owner's documents   |
| `DELETE` | `/categories/:id`     | Yes  | Removes the category; documents keep their label (204)      |

### Request/Response Examples

#### `GET /auth/me`

```bash
curl -H "Authorization: Bearer <session-token>" http://localhost:8787/auth/me
```

```json
{
  "user": {
    "id": "1234567890",
    "email": "user@gmail.com",
    "name": "John Doe",
    "picture": "https://lh3.googleusercontent.com/...",
    "notifyUpdates": false,
    "createdAt": "2026-07-01T12:00:00.000Z"
  }
}
```

#### `POST /auth/logout`

```bash
curl -X POST -H "Cookie: session=<token>" http://localhost:8787/auth/logout
```

```json
{
  "ok": true
}
```

#### `POST /documents` (upload)

Returns **201 Created** with the stored document metadata.

```bash
curl -X POST https://metarepo-api.adnanbuilds-online/documents \
  -H "Content-Type: multipart/form-data" \
  --cookie "session=..." \
  -F "file=@report.pdf" \
  -F "title=Q4 Report" \
  -F "category=report"
```

```json
{
  "id": "3f1c9a2e-6b7d-4e8f-9a0b-1c2d3e4f5a6b",
  "title": "Q4 Report",
  "category": "report",
  "kind": "pdf",
  "originalName": "report.pdf",
  "size": 1048576,
  "createdAt": "2026-10-01T12:00:00.000Z"
}
```

---

## Database Schema

### Entity Relationship

```
┌─────────────────────┐       ┌─────────────────────────┐
│       users          │       │        accounts          │
├─────────────────────┤       ├─────────────────────────┤
│ id          TEXT PK  │◀──┐   │ id          INTEGER PK   │
│ email       TEXT UQ  │   │   │ user_id     TEXT FK ─────│──┐
│ name        TEXT     │   │   │ provider    TEXT         │  │
│ picture     TEXT     │   │   │ provider_account_id TEXT │  │
│ created_at  TEXT     │   │   │ refresh_token TEXT      │  │
│ updated_at  TEXT     │   │   │ expires_at   INTEGER    │  │
│ notify_updates INTEGER│   │   │ created_at   TEXT        │  │
└─────────────────────┘   │   │ created_at   TEXT        │  │
                          │   └─────────────────────────┘  │
                          │                                 │
                          │   ┌─────────────────────────┐  │
                          │   │       sessions           │  │
                          │   ├─────────────────────────┤  │
                          │   │ id          TEXT PK      │  │
                          └───│ user_id     TEXT FK ─────│──┘
                              │ expires_at  INTEGER      │
                              │ created_at  TEXT         │
                              └─────────────────────────┘

┌─────────────────────┐
│      documents       │
├─────────────────────┤
│ id          TEXT PK  │
│ user_id     TEXT FK ─│──▶ users.id
│ title       TEXT     │
│ description TEXT     │
│ category    TEXT     │  ← label (builtin key or owner's custom name),
│ kind        TEXT     │    no FK — see `categories`
│ original_name TEXT   │
│ r2_key      TEXT UQ  │
│ size        INTEGER  │
│ created_at  TEXT     │
└─────────────────────┘

┌──────────────────────────┐        ┌──────────────────────────┐
│      document_shares      │        │        categories         │
├──────────────────────────┤        ├──────────────────────────┤
│ id              TEXT PK   │        │ id             TEXT PK    │
│ document_id     TEXT FK ──│──▶ documents.id
│ recipient_email TEXT      │        │ user_id        TEXT FK ───│──▶ users.id
│ permission      TEXT      │        │ name           TEXT       │
│ created_at      TEXT      │        │ created_at     TEXT       │
└──────────────────────────┘        └──────────────────────────┘
  UNIQUE(document_id, recipient_email)    UNIQUE(user_id, name)
  INDEX(recipient_email)
  CHECK(permission IN ('read','write'))
```

### Table Details

#### `users`

| Column       | Type | Constraints                           | Description           |
| ------------ | ---- | ------------------------------------- | --------------------- |
| `id`         | TEXT | PRIMARY KEY                           | Google user ID        |
| `email`      | TEXT | NOT NULL, UNIQUE                      | User email address    |
| `name`       | TEXT | NOT NULL                              | Display name          |
| `picture`    | TEXT | Nullable                              | Profile picture URL   |
| `created_at` | TEXT | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Account creation time |
| `updated_at` | TEXT | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Last profile update   |
| `notify_updates` | INTEGER | Nullable, DEFAULT `1`           | "Notify me about product updates" preference (1 = on) |

#### `accounts`

| Column                | Type    | Constraints                                 | Description                   |
| --------------------- | ------- | ------------------------------------------- | ----------------------------- |
| `id`                  | INTEGER | PRIMARY KEY, AUTOINCREMENT                  | Internal ID                   |
| `user_id`             | TEXT    | NOT NULL, FK → `users.id` ON DELETE CASCADE | Owner reference               |
| `provider`            | TEXT    | NOT NULL                                    | OAuth provider (`google`)     |
| `provider_account_id` | TEXT    | NOT NULL                                    | Provider's user ID            |
| `refresh_token`       | TEXT    | Nullable                                    | Encrypted refresh token       |
| `expires_at`          | INTEGER | Nullable                                    | Token expiry (Unix timestamp) |
| `created_at`          | TEXT    | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`       | Link creation time            |

**Indexes:** `UNIQUE(provider, provider_account_id)`, `INDEX(user_id)`

#### `sessions`

| Column       | Type    | Constraints                                 | Description                       |
| ------------ | ------- | ------------------------------------------- | --------------------------------- |
| `id`         | TEXT    | PRIMARY KEY                                 | HMAC-SHA256 hash of session token |
| `user_id`    | TEXT    | NOT NULL, FK → `users.id` ON DELETE CASCADE | Owner reference                   |
| `expires_at` | INTEGER | NOT NULL                                    | Expiry (Unix timestamp)           |
| `created_at` | TEXT    | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`       | Session creation time             |

**Indexes:** `INDEX(user_id)`, `INDEX(expires_at)`

#### `documents`

| Column         | Type    | Constraints                                 | Description                              |
| -------------- | ------- | ------------------------------------------- | ---------------------------------------- |
| `id`           | TEXT    | PRIMARY KEY                                 | Document ID (UUID)                       |
| `user_id`      | TEXT    | NOT NULL, FK → `users.id` ON DELETE CASCADE | Owner reference                          |
| `title`        | TEXT    | NOT NULL                                    | User-provided title                      |
| `description`  | TEXT    | Nullable                                    | Optional description                     |
| `category`     | TEXT    | Nullable                                    | Optional category                        |
| `kind`         | TEXT    | NOT NULL                                    | File kind (`pdf` / `docx`, magic-byte validated) |
| `original_name`| TEXT    | NOT NULL                                    | Original filename as uploaded            |
| `r2_key`       | TEXT    | NOT NULL, UNIQUE                            | R2 object key                            |
| `size`         | INTEGER | NOT NULL                                    | File size in bytes (10 MB/file max)      |
| `created_at`   | TEXT    | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`       | Upload time                              |

**Indexes:** `UNIQUE(r2_key)`, `INDEX(user_id)`

File bytes live in R2 under `docs/{userId}/{uuid}.{ext}` — the key is never exposed publicly; content is only served through the authenticated `GET /documents/:id/content` endpoint. Every query is scoped by `user_id` (30 MB / 50 files per user).

#### `document_shares`

| Column            | Type | Constraints                                          | Description                                     |
| ----------------- | ---- | ---------------------------------------------------- | ----------------------------------------------- |
| `id`              | TEXT | PRIMARY KEY                                          | Share ID (UUID)                                 |
| `document_id`     | TEXT | NOT NULL, FK → `documents.id` ON DELETE CASCADE      | Shared document (deleting the doc removes shares) |
| `recipient_email` | TEXT | NOT NULL                                              | Lowercased exact recipient email (resolved at access time) |
| `permission`      | TEXT | NOT NULL, CHECK `IN ('read','write')`                 | `read` = view+download; `write` = also edit title/description |
| `created_at`      | TEXT | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`                 | Share creation time                             |

**Indexes:** `UNIQUE(document_id, recipient_email)`, `INDEX(recipient_email)`

Shares are keyed by email rather than a recipient user ID on purpose: a share created before the recipient ever signed up activates when that address first logs in. Access resolves through `resolveDocumentAccess()` (owner > write > read > null); delete, share management, and `category` stay owner-only, and a revoked or never-existent share returns the same 404 as a document that doesn't exist.

#### `categories`

| Column       | Type | Constraints                                          | Description                            |
| ------------ | ---- | ---------------------------------------------------- | -------------------------------------- |
| `id`         | TEXT | PRIMARY KEY                                          | Category ID (UUID)                     |
| `user_id`    | TEXT | NOT NULL, FK → `users.id` ON DELETE CASCADE          | Creator (owner-only)                   |
| `name`       | TEXT | NOT NULL                                              | Custom name (1–40 chars, max 50/user)  |
| `created_at` | TEXT | NOT NULL, DEFAULT `CURRENT_TIMESTAMP`                 | Creation time                          |

**Indexes:** `UNIQUE(user_id, name)`

This table powers the creator's picker only — `documents.category` stays a plain TEXT label (builtin key or custom name) with deliberately no foreign key, so deleting a category never rewrites documents and they keep the label they were given. Renaming cascades onto the owner's documents that carry the old name; the routes add a case-insensitive uniqueness check on top of the index.

---

## Security Features

This codebase has been **audited for production use**. Every security decision is intentional.

### Authentication Security

| Feature                        | Implementation                                                |
| ------------------------------ | ------------------------------------------------------------- |
| **PKCE (S256)**                | Prevents authorization code interception attacks              |
| **State Parameter**            | CSRF protection with cryptographic random values              |
| **Constant-Time Validation**   | XOR-based comparison prevents timing attacks on state         |
| **Session Hashing**            | HMAC-SHA256 with server-side secret — raw tokens never stored |
| **Sliding Window Renewal**     | Sessions auto-extend when <50% lifetime remaining             |
| **Session Rotation**           | New token + hash issued on renewal, old one invalidated       |
| **Single-Session Enforcement** | Old sessions deleted on new login                             |
| **Encrypted Refresh Tokens**   | AES-256-GCM with PBKDF2 key derivation (100K iterations)     |

### Cookie Security

| Attribute  | Value  | Purpose                                     |
| ---------- | ------ | ------------------------------------------- |
| `HttpOnly` | `true` | Prevents JavaScript access (XSS protection) |
| `Secure`   | `true` | HTTPS only (prevents MITM)                  |
| `SameSite` | `Lax`  | CSRF protection on cross-origin requests    |
| `Path`     | `/`    | Available on all routes                     |
| `Max-Age`  | 7 days | Automatic expiry                            |

### HTTP Security Headers

| Header                      | Value                                       | Purpose                   |
| --------------------------- | ------------------------------------------- | ------------------------- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains`       | Force HTTPS               |
| `X-Frame-Options`           | `DENY`                                      | Prevent clickjacking      |
| `X-Content-Type-Options`    | `nosniff`                                   | Prevent MIME sniffing     |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`           | Control referrer leakage  |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()`  | Restrict browser features |
| `Content-Security-Policy`   | Restrictive policy with allowlisted sources | Prevent XSS               |
| `X-Request-Id`              | UUID per request                            | Distributed tracing       |

### Infrastructure Security

| Feature                | Implementation                                                       |
| ---------------------- | -------------------------------------------------------------------- |
| **Rate Limiting**      | KV-backed (opt-in): OAuth 10/min, session 30/min, uploads 10/min, share/category writes 30/min per IP |
| **CORS**               | Configurable allowed origins, credentials enabled                    |
| **Body Size Limit**    | 1MB maximum request body via Hono bodyLimit middleware               |
| **Input Validation**   | Email format, name sanitization, picture URL validation              |
| **Error Sanitization** | Generic error messages to clients, detailed logs server-side         |
| **CSRF on Logout**     | Origin header validation on state-changing endpoints                 |
| **Foreign Keys**       | `PRAGMA foreign_keys = ON` — cascading deletes enforced              |
| **Secret Validation**  | SESSION_SECRET must be ≥32 characters — fails closed if missing      |

---

## Configuration

### Environment Variables

#### Server (`apps/server/.dev.vars`)

| Variable                | Required | Description                                                                         |
| ----------------------- | -------- | ----------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`      | Yes      | Google OAuth client ID from Google Cloud Console                                    |
| `GOOGLE_CLIENT_SECRET`  | Yes      | Google OAuth client secret                                                          |
| `ALLOWED_ORIGINS`       | Yes      | Comma-separated allowed origins (e.g., `http://localhost:3000,https://yourapp.com`) |
| `WEB_APP_URL`           | Yes      | Frontend URL for post-auth redirect (e.g., `http://localhost:3000`)                 |
| `SESSION_SECRET`        | Yes      | Cryptographic secret for HMAC-SHA256 (min 32 chars)                                 |

#### Frontend (`apps/web/.env.local`)

| Variable                 | Required | Description                                    |
| ------------------------ | -------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SERVER_URL` | Yes      | API server URL (e.g., `http://localhost:8787`) |
| `NEXT_PUBLIC_SITE_URL`   | No       | Site URL for metadata (defaults to `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_NAME`   | No       | App name for branding (defaults to `YourApp`)  |

### Wrangler Configuration

The server's `wrangler.jsonc` defines the D1 database and R2 bucket bindings:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "metarepo-db-adnanbuilds-online",
      "database_id": "<your-database-id>",
    },
  ],
  "r2_buckets": [
    {
      "binding": "DOCS_BUCKET",
      "bucket_name": "metarepo-cloud-storage",
    },
  ],
}
```

---

## Development

### Available Commands

```bash
# Install dependencies
npm install

# Start development servers
npx nx dev @repo/web         # Frontend on :3000
npx nx dev @repo/server      # API on :8787

# Build for production
npx nx build @repo/web

# Run tests
npx vitest run

# Lint
npx nx run-many -t lint

# Typecheck
npx nx run-many -t typecheck

# Generate Drizzle migrations
cd apps/server && npx drizzle-kit generate

# Run database migrations
cd apps/server && npm run migrate

# Deploy to Cloudflare
npx nx deploy @repo/web
npx nx deploy @repo/server
```

### Shared Packages

| Package              | Purpose                              | Key Exports                                                    |
| -------------------- | ------------------------------------ | -------------------------------------------------------------- |
| `@repo/auth`         | Google OAuth helpers                 | `generateState`, `validateState`, `getGoogleAuthUrl`, `exchangeCodeForTokens` |
| `@repo/http`         | Shared HTTP utilities                | `fetchWithTimeout`, `hmacHex`, `constantTimeCompare`, `encrypt`, `decrypt` |
| `@repo/api-endpoints`| API route constants                  | `API_ENDPOINTS`                                                |

### Extending the Auth System

#### Adding a New OAuth Provider

1. Add provider functions to `packages/auth/src/` (e.g., `github.ts`)
2. Export from `packages/auth/src/index.ts`
3. Add routes in `apps/server/src/routes/auth.ts`
4. Add endpoint constants to `packages/api-endpoints/`

#### Adding New Database Tables

1. Create table definition in `apps/server/src/db/tables/`
2. Export from `apps/server/src/db/schema.ts`
3. Run `npx drizzle-kit generate` to create migration
4. Run migration against D1

---

## Deployment

### Prerequisites

- Cloudflare account with Workers + D1 enabled
- Google Cloud Console project with OAuth credentials
- GitHub repository with Actions enabled

### GitHub Secrets

| Secret                  | Description                             |
| ----------------------- | --------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | API token with Workers + D1 permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID              |

### First Deployment

```bash
# 1. Create D1 database
cd apps/server
npx wrangler d1 create metarepo-db-adnanbuilds-online

# 2. Update database_id in wrangler.jsonc

# 3. Set Cloudflare secrets
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put ALLOWED_ORIGINS
npx wrangler secret put WEB_APP_URL
npx wrangler secret put SESSION_SECRET

# 4. Run initial migration (select 0, then remote)
npm run migrate

# 5. Push to main — GitHub Actions handles the rest
git push origin main
```

### How CI/CD Works

| Trigger                         | Action                                            |
| ------------------------------- | ------------------------------------------------- |
| Push to `main` (web changes)    | Builds and deploys frontend to Cloudflare Workers |
| Push to `main` (server changes) | Builds and deploys API to Cloudflare Workers      |
| Pull request                    | Runs build + typecheck (no deployment)            |

---

## Built With

- [Next.js](https://nextjs.org/) — The React framework for production
- [Hono](https://hono.dev/) — Ultrafast web framework for the edge
- [Drizzle ORM](https://orm.drizzle.team/) — TypeScript ORM that feels like writing SQL
- [Cloudflare Workers](https://workers.cloudflare.com/) — Serverless edge computing
- [Cloudflare D1](https://developers.cloudflare.com/d1/) — Serverless SQLite database
- [OpenNext](https://opennext.js.org/cloudflare) — Open-source Next.js deployment for Cloudflare
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Nx](https://nx.dev/) — Smart monorepo tooling
