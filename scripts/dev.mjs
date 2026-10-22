#!/usr/bin/env node
/**
 * Interactive dev launcher for the monorepo.
 *
 *   pnpm dev            -> asks which app to run, then starts it via Nx
 *   pnpm dev v2         -> skips the prompt (v1 | v2 | web | server)
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const require = createRequire(import.meta.url);
const NX_BIN = path.join(path.dirname(require.resolve("nx/package.json")), "dist/bin/nx.js");

const APPS = [
  { key: "v2", project: "@repo/portfolio-v2", label: "Portfolio v2 (flagship site)" },
  { key: "v1", project: "@repo/portfolio-v1", label: "Portfolio v1 (cyberpunk edition)" },
  { key: "web", project: "@repo/web", label: "Web (SaaS LaunchKit Pro frontend)" },
  { key: "server", project: "@repo/server", label: "Server (Hono API - Cloudflare Workers)" },
];

function runApp(app) {
  console.log(`\nStarting ${app.label}  (nx dev ${app.project})`);
  console.log("Press Ctrl+C to stop.\n");

  const child = spawn(process.execPath, [NX_BIN, "dev", app.project], { stdio: "inherit" });

  // Forward termination signals so Ctrl+C cleanly stops the dev server.
  const forward = (signal) => () => child.kill(signal);
  process.on("SIGINT", forward("SIGINT"));
  process.on("SIGTERM", forward("SIGTERM"));

  child.on("exit", (code, signal) => {
    process.exit(signal ? 130 : (code ?? 0));
  });
}

async function main() {
  const arg = (process.argv[2] ?? "").toLowerCase();

  if (arg) {
    const app =
      APPS.find((a) => a.key === arg || a.project.toLowerCase() === arg) ??
      APPS.find((a) => a.key.startsWith(arg) && arg.length >= 2);
    if (!app) {
      console.error(
        `Unknown app "${arg}". Available options: ${APPS.map((a) => a.key).join(", ")}`,
      );
      process.exit(1);
    }
    return runApp(app);
  }

  console.log("\nWhich app do you want to run?\n");
  APPS.forEach((a, i) => console.log(`  ${i + 1}) ${a.label.padEnd(36)} pnpm dev ${a.key}`));
  console.log("");

  const rl = createInterface({ input, output });
  let selected = false;
  rl.on("close", () => {
    if (!selected) {
      console.log("\nCancelled.");
      process.exit(1);
    }
  });

  for (;;) {
    const answer = (await rl.question("Select an option (1-4, or a key like v2): "))
      .trim()
      .toLowerCase();
    const byNumber = /^\d+$/.test(answer) ? APPS[Number(answer) - 1] : undefined;
    const app = byNumber ?? APPS.find((a) => a.key === answer);
    if (app) {
      selected = true;
      rl.close();
      return runApp(app);
    }
    if (answer === "q" || answer === "quit" || answer === "exit") {
      rl.close();
      return;
    }
    console.log("Invalid choice - type 1-4 or a key like v2.");
  }
}

main();
