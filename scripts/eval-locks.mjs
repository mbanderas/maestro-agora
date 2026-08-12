#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCK_FILE = join(ROOT, "evals", "releases", "locks.json");

async function listFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(current, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(root, fullPath));
    else if (entry.isFile()) files.push(relative(root, fullPath).split(sep).join("/"));
  }

  return files.sort((a, b) => a.localeCompare(b));
}

export async function computeEvalTreeLock(root, releasePath) {
  const absolute = join(root, ...releasePath.split("/"));
  const files = await listFiles(absolute);
  const tree = createHash("sha256");

  for (const file of files) {
    const bytes = await readFile(join(absolute, ...file.split("/")));
    const fileHash = createHash("sha256").update(bytes).digest("hex");
    tree.update(file);
    tree.update("\0");
    tree.update(fileHash);
    tree.update("\n");
  }

  return {
    path: releasePath,
    file_count: files.length,
    sha256: tree.digest("hex"),
  };
}

export async function verifyEvalLocks(root = ROOT) {
  const lockPath = join(root, "evals", "releases", "locks.json");
  const lock = JSON.parse(await readFile(lockPath, "utf8"));
  const errors = [];

  if (lock.schema_version !== 1 || !Array.isArray(lock.releases)) {
    return ["eval release lock must use schema_version 1 with a releases array"];
  }

  for (const expected of lock.releases) {
    const actual = await computeEvalTreeLock(root, expected.path);
    if (actual.file_count !== expected.file_count || actual.sha256 !== expected.sha256) {
      errors.push(`${expected.path} differs from its frozen release lock`);
    }
  }

  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = await verifyEvalLocks();
  if (errors.length) {
    process.stderr.write(`Evaluation lock verification failed:\n- ${errors.join("\n- ")}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write("Evaluation release locks verified.\n");
  }
}
