#!/usr/bin/env node
/**
 * Interactive dev launcher for the monorepo.
 *
 *   pnpm dev            -> asks which app to run, then starts it via pnpm --filter
 *   pnpm dev server     -> skips the prompt (web | server)
 */
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const APPS = [
  { key: "web", project: "@repo/web", label: "MetaRepo web (Next.js frontend)" },
  { key: "server", project: "@repo/server", label: "API server (Hono - Cloudflare Workers)" },
];

function runApp(app) {
  console.log(`\nStarting ${app.label}  (pnpm --filter ${app.project} dev)`);
  console.log("Press Ctrl+C to stop.\n");

  const child = spawn("pnpm", ["--filter", app.project, "dev"], { stdio: "inherit" });

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
    const answer = (await rl.question("Select an option (1-2, or a key like web): "))
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
    console.log("Invalid choice - type 1-2 or a key like web.");
  }
}

main();
