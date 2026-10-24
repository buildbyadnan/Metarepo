# Bazel in MetaRepo

How Bazel coexists with the existing pnpm/nx toolchain — and why there are no
conflicts between them.

---

## Why Bazel

nx is a JS/TS task runner: it cannot orchestrate Rust, Python, C++, or C#
targets together. As this monorepo grows into a multi-language project, Bazel
is the only build system that builds every language from **one dependency
graph**, hermetically and reproducibly. This is a staged **nx → Bazel**
migration; the end state is Bazel alone. Until the final stage, both run side
by side as a deliberate safety harness.

---

## The two systems cannot touch each other

This is the core guarantee, and it is enforced by `.bazelignore`, not by
convention:

| | nx / pnpm | Bazel |
| --------------- | -------------------------------------- | -------------------------------- |
| **Reads** | source `.ts` + `pnpm-lock.yaml` | source `.ts` + `pnpm-lock.yaml` |
| **Writes** | real tree: `dist/`, `node_modules/`, `.next/` | sandbox: `bazel-out/` (gitignored) |
| **Ignores** | `BUILD.bazel`, `MODULE.bazel` | pnpm `node_modules/`, `dist/`, `.next/` |

They share the **same inputs** but write to **different places**, so they can
never overwrite, race on, or corrupt each other's output. After all Bazel
work, `pnpm test` still passes **520/520** and the nx workflow is byte-for-byte
unchanged.

`.bazelignore` tells Bazel to completely ignore the pnpm-installed
`node_modules/` trees (including the `@repo/*` workspace symlinks) and any nx
build output, so pnpm's symlinks are never mistaken for Bazel subpackages.

---

## Hermetic by design (security)

Bazel is more locked-down than nx, not less:

- **No host leakage** — actions run with `--incompatible_strict_action_env`;
  the hermetic Node toolchain (pinned to `22.22.1`) supplies the runtime.
- **Exact pins** — every ruleset and toolchain is pinned in `MODULE.bazel`.
- **Install-script allowlist** — install scripts only run for packages you
  approved in `pnpm-workspace.yaml#onlyBuiltDependencies` (mirrored
  automatically by rules_js v3; no duplicate allowlist to keep in sync).
- **Lockfile truth** — npm deps come from `pnpm-lock.yaml`, which stays the
  single source of truth. `MODULE.bazel.lock` is committed and stable.

---

## What Bazel covers today

| Target | What it runs | nx equivalent |
| ---------------------------- | ------------------------------------------ | ---------------------------- |
| `//packages/http:typecheck` | `tsc -p tsconfig.json --noEmit` | `@repo/http:typecheck` |
| `//packages/auth:typecheck` | `tsc -p tsconfig.json --noEmit` | `@repo/auth:typecheck` |
| `//packages/api-endpoints:typecheck` | `tsc -p tsconfig.lib.json --noEmit` | `@repo/api-endpoints:typecheck` |
| `//apps/server:typecheck` | `tsc -p tsconfig.json --noEmit` | `@repo/server:typecheck` |
| `//...:test` (js_test) | vitest per package | `vitest run` |

Run everything:

```bash
bazel test //...
```

Typecheck targets use `no_emit` on purpose: Bazel does not own `dist/`
emission yet, so the two systems can never fight over outputs.

### Not yet covered by Bazel

- **`apps/web`** — its typecheck and `next build` (OpenNext for Cloudflare)
  still run on nx. This is the largest app and needs its own migration step.
- **`dist/` emission** — package `build` targets still emit via nx/tsc.

This is the single reason CI is **not** switched to Bazel yet (see below).

---

## CI: shadow first, switch later

- **`bazel-ci.yml`** (new) runs `bazel test //...` on every push to `main`
  and every PR, **alongside** the existing `ci.yml`. It is additive,
  `contents: read` only, and uses no `concurrency` group, so it cannot cancel
  or race the `deploy-*` workflows.
- **`ci.yml` and both `deploy.*.yml` are unchanged** — still on nx. Your merge
  gate and Cloudflare deploys are untouched.

The switch to Bazel in CI happens only after `apps/web` is covered, so no
check is ever silently dropped.

---

## Stages

| Stage | Status | What it does |
| ----- | ------ | ------------------------------------------ |
| **1** | ✅ committed | Bazel workspace + typecheck/test targets (additive) |
| **2** | ✅ committed | `bazel-ci.yml` shadow check alongside existing CI |
| **3** | ⏳ future | Switch CI build/typecheck/test steps to Bazel |
| **4** | ⏳ future | Remove nx (`nx.json`, `@nx/*`, `scripts/dev.mjs`) |
| **5** | ⏳ future | Migrate `apps/web` `next build`; multi-language targets |

---

## Local commands

```bash
bazel test //...                      # run all Bazel tests + typechecks
bazel build //:node_modules           # link npm deps into bazel-out
bazel test //packages/http:test       # one package's vitest suite
pnpm test                             # unchanged — still the nx/pnpm path
```

`bazel-*` symlinks in the workspace root are gitignored; the cache lives in
`~/.cache/bazel`.
