#!/usr/bin/env node

import { constants } from "node:fs";
import {
  access,
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
} from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_NAME = "write-agora-marketing";
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(SCRIPT_DIR, "..");
const SOURCE_DIR = join(PACKAGE_ROOT, SKILL_NAME);

const TARGETS = {
  shared: {
    description: "Shared Agent Skills path for Codex, Cursor, Gemini CLI, GitHub Copilot, and Windsurf",
    user: [".agents", "skills"],
    project: [".agents", "skills"],
  },
  codex: {
    description: "Codex CLI, IDE, and desktop app",
    user: [".agents", "skills"],
    project: [".agents", "skills"],
  },
  claude: {
    description: "Claude Code",
    user: [".claude", "skills"],
    project: [".claude", "skills"],
  },
  cursor: {
    description: "Cursor",
    user: [".cursor", "skills"],
    project: [".cursor", "skills"],
  },
  gemini: {
    description: "Gemini CLI",
    user: [".gemini", "skills"],
    project: [".gemini", "skills"],
  },
  copilot: {
    description: "GitHub Copilot CLI, coding agent, and VS Code agent mode",
    user: [".copilot", "skills"],
    project: [".github", "skills"],
  },
  windsurf: {
    description: "Windsurf Cascade",
    user: [".codeium", "windsurf", "skills"],
    project: [".windsurf", "skills"],
  },
};

const UNIVERSAL_TARGETS = ["shared", "claude"];

function usage() {
  return `Install ${SKILL_NAME} into documented Agent Skills locations.

Usage:
  write-agora-marketing [options]

Options:
  --target <name>    universal (default), shared, codex, claude, cursor,
                     gemini, copilot, or windsurf. Accepts comma-separated names.
  --scope <scope>    user (default) or project.
  --project <path>   Project root for project scope. Defaults to the current directory.
  --home <path>      Home directory override. Useful for CI and isolated installs.
  --force            Replace a different existing copy at the exact skill destination.
  --dry-run          Print destinations without changing files.
  --list-targets     Show native target paths.
  -h, --help         Show this help.

Examples:
  write-agora-marketing --target universal
  write-agora-marketing --target universal --scope project --project .
  write-agora-marketing --target claude,cursor --force`;
}

function fail(message) {
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
}

function takeValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    force: false,
    help: false,
    home: homedir(),
    listTargets: false,
    project: process.cwd(),
    scope: "user",
    targets: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") {
      continue;
    } else if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--list-targets") {
      options.listTargets = true;
    } else if (arg === "--target") {
      options.targets.push(...takeValue(argv, index, arg).split(","));
      index += 1;
    } else if (arg.startsWith("--target=")) {
      options.targets.push(...arg.slice("--target=".length).split(","));
    } else if (arg === "--scope") {
      options.scope = takeValue(argv, index, arg);
      index += 1;
    } else if (arg.startsWith("--scope=")) {
      options.scope = arg.slice("--scope=".length);
    } else if (arg === "--project") {
      options.project = takeValue(argv, index, arg);
      index += 1;
    } else if (arg.startsWith("--project=")) {
      options.project = arg.slice("--project=".length);
    } else if (arg === "--home") {
      options.home = takeValue(argv, index, arg);
      index += 1;
    } else if (arg.startsWith("--home=")) {
      options.home = arg.slice("--home=".length);
    } else {
      throw new Error(`unknown option: ${arg}`);
    }
  }

  options.targets = options.targets
    .map((target) => target.trim().toLowerCase())
    .filter(Boolean);
  if (options.targets.length === 0) options.targets = ["universal"];
  if (!new Set(["user", "project"]).has(options.scope)) {
    throw new Error("--scope must be user or project");
  }

  const knownTargets = new Set(["universal", ...Object.keys(TARGETS)]);
  for (const target of options.targets) {
    if (!knownTargets.has(target)) {
      throw new Error(`unknown target '${target}'`);
    }
  }

  options.home = resolve(options.home);
  options.project = resolve(options.project);
  return options;
}

function printTargets() {
  process.stdout.write("Target     User path                         Project path\n");
  process.stdout.write("---------  --------------------------------  -----------------------\n");
  process.stdout.write("universal  ~/.agents/skills + ~/.claude/skills  .agents/skills + .claude/skills\n");
  for (const [name, target] of Object.entries(TARGETS)) {
    process.stdout.write(
      `${name.padEnd(9)}  ~/${target.user.join("/").padEnd(31)}  ${target.project.join("/")}\n`,
    );
  }
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(root, base = root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path, base)));
    } else if (entry.isFile()) {
      files.push(relative(base, path).replaceAll("\\", "/"));
    } else {
      throw new Error(`unsupported filesystem entry in skill: ${path}`);
    }
  }
  return files;
}

async function sameTree(left, right) {
  if (!(await exists(left)) || !(await exists(right))) return false;
  const [leftStat, rightStat] = await Promise.all([stat(left), stat(right)]);
  if (!leftStat.isDirectory() || !rightStat.isDirectory()) return false;

  const [leftFiles, rightFiles] = await Promise.all([listFiles(left), listFiles(right)]);
  if (leftFiles.length !== rightFiles.length) return false;
  if (leftFiles.some((file, index) => file !== rightFiles[index])) return false;

  for (const file of leftFiles) {
    const [leftContent, rightContent] = await Promise.all([
      readFile(join(left, file)),
      readFile(join(right, file)),
    ]);
    if (!leftContent.equals(rightContent)) return false;
  }
  return true;
}

function expandedTargets(targets) {
  const expanded = targets.flatMap((target) =>
    target === "universal" ? UNIVERSAL_TARGETS : [target],
  );
  return [...new Set(expanded)];
}

function destinations(options) {
  const base = options.scope === "user" ? options.home : options.project;
  const seen = new Set();
  const output = [];

  for (const targetName of expandedTargets(options.targets)) {
    const target = TARGETS[targetName];
    const destination = join(base, ...target[options.scope], SKILL_NAME);
    const key = destination.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({ destination, targetName });
  }
  return output;
}

async function verifySource() {
  const required = [
    "SKILL.md",
    "agents/openai.yaml",
    "references/agora-marketing.md",
  ];
  for (const file of required) {
    if (!(await exists(join(SOURCE_DIR, file)))) {
      throw new Error(`package is missing ${SKILL_NAME}/${file}`);
    }
  }
}

async function buildPlan(requestedDestinations, options) {
  const plan = [];
  for (const requested of requestedDestinations) {
    const current = await sameTree(SOURCE_DIR, requested.destination);
    const destinationExists = await exists(requested.destination);
    plan.push({ ...requested, current, destinationExists });
  }

  const conflicts = plan.filter((item) => item.destinationExists && !item.current);
  if (conflicts.length > 0 && !options.force && !options.dryRun) {
    const paths = conflicts.map((item) => item.destination).join(", ");
    throw new Error(
      `${paths} already exists and differs; inspect ${conflicts.length === 1 ? "it" : "them"}, then rerun with --force to replace only those skill folders`,
    );
  }
  return plan;
}

function planResults(plan, options) {
  return plan.map((item) => ({
    action: item.current
      ? "current"
      : item.destinationExists
        ? options.force
          ? "would replace"
          : "needs --force"
        : "would install",
    destination: item.destination,
    targetName: item.targetName,
  }));
}

async function cleanPrepared(items) {
  for (const item of items) {
    if (item.temporary && (await exists(item.temporary))) {
      await rm(item.temporary, { force: true, recursive: true });
    }
  }
}

async function applyPlan(plan) {
  const changes = plan.filter((item) => !item.current);
  const token = `${process.pid}-${Date.now()}`;

  try {
    for (let index = 0; index < changes.length; index += 1) {
      const item = changes[index];
      const parent = dirname(item.destination);
      await mkdir(parent, { recursive: true });
      const stagingRoot = dirname(parent);
      await mkdir(stagingRoot, { recursive: true });
      item.temporary = join(stagingRoot, `.${SKILL_NAME}.install-${token}-${index}`);
      item.backup = join(stagingRoot, `.${SKILL_NAME}.backup-${token}-${index}`);
      await cp(SOURCE_DIR, item.temporary, { errorOnExist: true, recursive: true });
    }
  } catch (error) {
    await cleanPrepared(changes);
    throw new Error(`could not prepare every destination; no installed copy was changed: ${error.message}`);
  }

  try {
    for (const item of changes) {
      if (item.destinationExists) {
        await rename(item.destination, item.backup);
        item.backedUp = true;
      }
      await rename(item.temporary, item.destination);
      item.swapped = true;
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const item of [...changes].reverse()) {
      try {
        if (item.swapped && (await exists(item.destination))) {
          await rm(item.destination, { force: true, recursive: true });
        }
        if (item.backedUp && (await exists(item.backup))) {
          await rename(item.backup, item.destination);
        }
        if (item.temporary && (await exists(item.temporary))) {
          await rm(item.temporary, { force: true, recursive: true });
        }
      } catch (rollbackError) {
        rollbackErrors.push(`${item.destination}: ${rollbackError.message}`);
      }
    }
    if (rollbackErrors.length > 0) {
      throw new Error(
        `install failed and rollback needs attention (${rollbackErrors.join("; ")}): ${error.message}`,
      );
    }
    throw new Error(`install failed; every destination was rolled back: ${error.message}`);
  }

  for (const item of changes) {
    if (item.backedUp && (await exists(item.backup))) {
      await rm(item.backup, { force: true, recursive: true });
    }
  }

  return plan.map((item) => ({
    action: item.current ? "current" : item.destinationExists ? "replaced" : "installed",
    destination: item.destination,
    targetName: item.targetName,
  }));
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    fail(error.message);
    process.stderr.write(`\n${usage()}\n`);
    return;
  }

  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  if (options.listTargets) {
    printTargets();
    return;
  }

  try {
    await verifySource();
    const plan = await buildPlan(destinations(options), options);
    const results = options.dryRun ? planResults(plan, options) : await applyPlan(plan);
    process.stdout.write(`${options.dryRun ? "Install plan" : "Install result"}:\n`);
    for (const result of results) {
      process.stdout.write(
        `  ${result.action.padEnd(13)} ${result.destination} (${result.targetName})\n`,
      );
    }
  } catch (error) {
    fail(error.message);
  }
}

await main();
