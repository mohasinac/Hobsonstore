/**
 * sync-env.ts
 *
 * Syncs .env.local <-> env.json
 *
 * Usage:
 *   npx tsx scripts/sync-env.ts export          # .env.local -> env.json
 *   npx tsx scripts/sync-env.ts import          # env.json   -> .env.local
 *   npx tsx scripts/sync-env.ts set KEY value   # add / update a key in both files
 *   npx tsx scripts/sync-env.ts delete KEY      # remove a key from both files
 *   npx tsx scripts/sync-env.ts list            # print all keys (values masked)
 */

import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const ENV_FILE = path.join(ROOT, ".env.local");
const JSON_FILE = path.join(ROOT, "env.json");

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    const value = line.slice(eqIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

function serializeEnv(vars: Record<string, string>): string {
  return (
    Object.entries(vars)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n") + "\n"
  );
}

// ─── File helpers ─────────────────────────────────────────────────────────────

function readEnvFile(): Record<string, string> {
  if (!fs.existsSync(ENV_FILE)) return {};
  return parseEnv(fs.readFileSync(ENV_FILE, "utf8"));
}

function writeEnvFile(vars: Record<string, string>) {
  // Preserve comments / blank lines from existing file, just update values
  let content = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, "utf8") : "";
  const written = new Set<string>();

  // Update existing lines
  content = content
    .split("\n")
    .map((raw) => {
      const line = raw.trim();
      if (!line || line.startsWith("#")) return raw;
      const eqIdx = line.indexOf("=");
      if (eqIdx === -1) return raw;
      const key = line.slice(0, eqIdx).trim();
      if (key in vars) {
        written.add(key);
        return `${key}=${vars[key]}`;
      }
      // key was deleted — remove the line
      return null;
    })
    .filter((l) => l !== null)
    .join("\n");

  // Append new keys that weren't already in the file
  const newKeys = Object.keys(vars).filter((k) => !written.has(k));
  if (newKeys.length) {
    content = content.trimEnd() + "\n\n# Added by sync-env\n";
    for (const k of newKeys) content += `${k}=${vars[k]}\n`;
  }

  fs.writeFileSync(ENV_FILE, content, "utf8");
}

function readJsonFile(): Record<string, string> {
  if (!fs.existsSync(JSON_FILE)) return {};
  return JSON.parse(fs.readFileSync(JSON_FILE, "utf8")) as Record<string, string>;
}

function writeJsonFile(vars: Record<string, string>) {
  fs.writeFileSync(JSON_FILE, JSON.stringify(vars, null, 2) + "\n", "utf8");
}

// ─── Commands ─────────────────────────────────────────────────────────────────

function cmdExport() {
  const vars = readEnvFile();
  writeJsonFile(vars);
  console.log(`✅  Exported ${Object.keys(vars).length} keys → ${JSON_FILE}`);
}

function cmdImport() {
  const vars = readJsonFile();
  writeEnvFile(vars);
  console.log(`✅  Imported ${Object.keys(vars).length} keys → ${ENV_FILE}`);
}

function cmdSet(key: string, value: string) {
  // Update .env.local
  const envVars = readEnvFile();
  envVars[key] = value;
  writeEnvFile(envVars);

  // Update env.json
  const jsonVars = readJsonFile();
  jsonVars[key] = value;
  writeJsonFile(jsonVars);

  console.log(`✅  Set ${key} in both files`);
}

function cmdDelete(key: string) {
  // Update .env.local
  const envVars = readEnvFile();
  const hadEnv = key in envVars;
  delete envVars[key];
  writeEnvFile(envVars);

  // Update env.json
  const jsonVars = readJsonFile();
  const hadJson = key in jsonVars;
  delete jsonVars[key];
  writeJsonFile(jsonVars);

  if (hadEnv || hadJson) {
    console.log(`🗑️   Deleted ${key} from ${[hadEnv && ".env.local", hadJson && "env.json"].filter(Boolean).join(" and ")}`);
  } else {
    console.log(`⚠️   Key "${key}" not found in either file`);
  }
}

function cmdList() {
  const vars = readEnvFile();
  const keys = Object.keys(vars);
  if (!keys.length) { console.log("No keys found in .env.local"); return; }
  console.log(`\n${"KEY".padEnd(48)} VALUE`);
  console.log("─".repeat(72));
  for (const k of keys) {
    const v = vars[k] ? "***" + vars[k].slice(-4) : "(empty)";
    console.log(`${k.padEnd(48)} ${v}`);
  }
  console.log(`\n${keys.length} key(s)\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const [,, cmd, ...args] = process.argv;

switch (cmd) {
  case "export":  cmdExport(); break;
  case "import":  cmdImport(); break;
  case "set":
    if (!args[0] || args[1] === undefined) {
      console.error("Usage: sync-env set KEY value");
      process.exit(1);
    }
    cmdSet(args[0], args[1]);
    break;
  case "delete":
    if (!args[0]) { console.error("Usage: sync-env delete KEY"); process.exit(1); }
    cmdDelete(args[0]);
    break;
  case "list":    cmdList(); break;
  default:
    console.log(`
Usage:
  npx tsx scripts/sync-env.ts export          # .env.local → env.json
  npx tsx scripts/sync-env.ts import          # env.json   → .env.local
  npx tsx scripts/sync-env.ts set KEY value   # add / update a key
  npx tsx scripts/sync-env.ts delete KEY      # remove a key
  npx tsx scripts/sync-env.ts list            # list all keys (masked)
    `);
}
