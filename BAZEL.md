# Bazel in MetaRepo

How this monorepo builds — Bazel owns typecheck, tests and the CI gates;
pnpm still runs everything Bazel deliberately does not own. nx is fully
removed (stage 4 of the migration).

---

## Why Bazel

nx was a JS/TS task runner: it could not orchestrate Rust, Python, C++, or C#
targets together. As this monorepo grows into a multi-language project, Bazel
builds every language from **one dependency graph**, hermetically and
reproducibly. The nx → Bazel migration is **complete** (stages 1–6, see below).

---

## Who owns what

| | pnpm / tsc | Bazel |
| --------------- | ------------------------------------------ | ------------------------------------------ |
| **Reads** | source `.ts` + `pnpm-lock.yaml` | source `.ts` + `pnpm-lock.yaml` |
| **Writes** | real tree: `dist/`, `node_modules/`, `.next/` | sandbox: `bazel-out/` (gitignored) |
| **Owns** | emit (`tsc --build`), `next build`, `wrangler deploy`, dev servers, **Biome lint**, Prettier | **typecheck**, **vitest suites**, the npm fetch graph, **CI gates** |
| **Ignores** | `BUILD.bazel`, `MODULE.bazel` | pnpm `node_modules/`, `dist/`, `.next/` |

They share the **same inputs** (lockfile + sources) but write to **different
places**, so they can never overwrite, race on, or corrupt each other's output.
`pnpm test` and `bazel test //...` run the same five real suites
(**5 files / 59 tests**); `vitest.config.ts` excludes `**/bazel-*` so the
Bazel symlink tree can never double-count them.

`.bazelignore` tells Bazel to completely ignore the pnpm-installed
`node_modules/` trees (including the `@repo/*` workspace symlinks) and any
build output, so pnpm's symlinks are never mistaken for Bazel subpackages.

---

## Hermetic by design (security)

Bazel is more locked-down than nx was, not less:

- **No host leakage** — actions run with `--incompatible_strict_action_env`;
  the hermetic Node toolchain (pinned to `22.22.1`) supplies the runtime.
- **Exact pins** — every ruleset and toolchain is pinned in `MODULE.bazel`
  (rules_js 3.5.1, rules_ts 3.10.1, rules_nodejs 6.7.7, TypeScript 6.0.3,
  Bazel 9.3.1 via `.bazelversion`).
- **Install-script allowlist** — install scripts only run for packages you
  approved in `pnpm-workspace.yaml#onlyBuiltDependencies` (mirrored
  automatically by rules_js v3; no duplicate allowlist to keep in sync).
- **Lockfile truth** — npm deps come from `pnpm-lock.yaml`, which stays the
  single source of truth. `MODULE.bazel.lock` is committed and stable.
- **CI supply chain** — third-party actions are SHA-pinned
  (`setup-bazel@104e3eea… # 0.19.1`); GitHub-owned actions use tag pins per
  repo convention; all workflows run with minimal `permissions` blocks.

---

## What Bazel covers

| Target | What it runs |
| ---------------------------- | ------------------------------------------ |
| `//packages/http:typecheck` | `tsc -p tsconfig.json --noEmit` |
| `//packages/auth:typecheck` | `tsc -p tsconfig.json --noEmit` |
| `//packages/api-endpoints:typecheck` | `tsc -p tsconfig.lib.json --noEmit` |
| `//apps/server:typecheck` | `tsc -p tsconfig.json --noEmit` |
| `//apps/web:typecheck` | `tsc -p tsconfig.json --noEmit` (Next.js app) |
| `//...:test` (js_test) | vitest per package |
| `//:node_modules` | links the pnpm graph into the sandbox |

Run everything:

```bash
bazel test //...       # all typechecks + all test suites (what CI runs)
bazel build //...      # typecheck-only pass (no test execution)
```

Typecheck targets use `no_emit` on purpose: Bazel does not own `dist/`
emission, so Bazel and pnpm can never fight over outputs. The package emit
step (`tsc --build …`) runs as a direct pnpm command in CI before
`next build`, because `@repo/api-endpoints` resolves to `dist/`.

### Deliberately not Bazel (yet)

- **`dist/` emission** — `tsc --build` via pnpm (rules_ts JS emit needs
  transpiler selection; out of scope of this migration).
- **`next build` / `wrangler deploy`** — stay pnpm/OpenNext/wrangler.
- **Lint** — Biome (single static binary, `pnpm run lint`), too fast to be
  worth a Bazel wrapper; the lint script is what CI calls.

---

## CI and deploys (since stage 3)

- **`ci.yml`** — pnpm install → `setup-bazel` (SHA-pinned) →
  `bazel test //...` → tsc emit trio → `next build` → wrangler dry-run →
  `pnpm run lint` (Biome) → `pnpm audit --prod --audit-level high`.
- **`deploy.web.yml` / `deploy.server.yml`** — same Bazel gate before
  deploying; the `pnpm run deploy` steps, secrets, triggers and path filters
  are byte-identical to before the migration.
- **`bazel-ci.yml`** — independent, separately named status check (useful as
  a required check in branch protection); hermetic, so it needs no
  `pnpm install`.

---

## Stages

| Stage | Status | What it did |
| ----- | ------ | ------------------------------------------ |
| **1** | ✅ committed | Bazel workspace + typecheck/test targets (additive) |
| **2** | ✅ committed | `bazel-ci.yml` shadow check alongside existing CI |
| **3** | ✅ committed | Switched CI/deploy build-typecheck-test steps to Bazel |
| **4** | ✅ committed | Removed nx (`nx.json`, `project.json`s, `@nx/*`, `scripts/dev.mjs`) |
| **5** | ✅ committed | Replaced ESLint with Biome 2.6.2 (`biome.json`, parity-pinned rules) |
| **6** | ✅ committed | Docs refresh (BAZEL.md, readme, Architecture, SETUP) |

**Future (not started):** taking over `dist/` emission in Bazel; multi-language
targets (Rust/Python) for the AI POC.

---

## Lint (Biome, not ESLint)

`biome.json` pins the parity rule set from the old ESLint config (severity
`error` where ESLint had errors — Biome's defaults are warnings and would not
fail CI), disables the six a11y rules Biome adds beyond ESLint, and leaves
formatting to Prettier (`formatter.enabled: false`). Ignore scope: a
five-extension allowlist in `files.includes`, the generated
`worker-configuration.d.ts` excluded by path, and gitignored hygiene
directories (`bazel-*`, `.next/`, `node_modules/`, …) filtered through
`vcs.useIgnoreFile`.

```bash
pnpm run lint         # biome check .   (~0.1 s; ESLint took ~5 s)
pnpm run lint:fix     # biome check --write .
```

---

## Local commands

```bash
bazel test //...                      # all typechecks + tests (full gate)
bazel build //...                     # typecheck only
pnpm run typecheck                    # same, via the root script
pnpm test                             # vitest directly (same 5 suites)
pnpm run lint                         # Biome
pnpm dev                              # interactive: pick web or server
```

`bazel-*` symlinks in the workspace root are gitignored; the cache lives in
`~/.cache/bazel`.
