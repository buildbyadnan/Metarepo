import { readdir } from "fs/promises";
import readline from "readline/promises";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const MIGRATION_DIR = "./drizzle";
const DB_NAME = "repo-db";

const files = (await readdir(MIGRATION_DIR)).filter((f) => f.endsWith(".sql"));

if (!files.length) {
  console.error("❌ No SQL files found.");
  process.exit(1);
}

console.log("\n📄 Available Migrations:\n");
files.forEach((f, i) => console.log(`[${i}] ${f}`));

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const idx = await rl.question("\n📌 Select migration number: ");
const mode = await rl.question("🌐 Run remotely or locally? (remote/local): ");
rl.close();

const selected = files[parseInt(idx)];
if (!selected || !["remote", "local"].includes(mode.trim().toLowerCase())) {
  console.error("❌ Invalid input. Please select a valid migration and mode.");
  process.exit(1);
}

const modeFlag = `--${mode.trim().toLowerCase()}`;
const args = ["d1", "execute", DB_NAME, modeFlag, `--file=${MIGRATION_DIR}/${selected}`];

console.log(`\n🚀 Executing: wrangler ${args.join(" ")}\n`);

try {
  const { stdout } = await execFileAsync("wrangler", args);
  console.log(stdout);
  console.log("✅ Migration executed successfully.");
} catch (e) {
  console.error("❌ Migration failed:", e.message);
  process.exit(1);
}
