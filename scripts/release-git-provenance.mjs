import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { computeEvalTreeLock } from "./eval-locks.mjs";

const execFileAsync = promisify(execFile);
const COMMIT = /^[a-f0-9]{40}$/;

const asBuffer = (value) => Buffer.isBuffer(value) ? value : Buffer.from(String(value));
const asText = (value) => asBuffer(value).toString("utf8").trim();
const sameTree = (left, right) => left?.file_count === right?.file_count
  && left?.sha256 === right?.sha256;

export const createGitRunner = (root) => async (args, { binary = false } = {}) => {
  const { stdout } = await execFileAsync("git", ["-c", "core.quotepath=false", ...args], {
    cwd: root,
    encoding: binary ? null : "utf8",
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  });
  return stdout;
};

export async function computeGitTreeLock({ gitRun, commit, releasePath }) {
  const raw = await gitRun([
    "ls-tree",
    "-r",
    "-z",
    "--full-tree",
    commit,
    "--",
    releasePath,
  ], { binary: true });
  const prefix = `${releasePath.replaceAll("\\", "/").replace(/\/$/u, "")}/`;
  const entries = asBuffer(raw).toString("utf8").split("\0").filter(Boolean).map((entry) => {
    const tab = entry.indexOf("\t");
    const metadata = entry.slice(0, tab).split(" ");
    const fullPath = entry.slice(tab + 1).replaceAll("\\", "/");
    if (tab < 0 || metadata.length !== 3 || metadata[1] !== "blob" || !fullPath.startsWith(prefix)) {
      throw new Error(`unexpected Git tree entry for ${releasePath}`);
    }
    return { object: metadata[2], path: fullPath.slice(prefix.length) };
  }).sort((left, right) => left.path.localeCompare(right.path));

  const tree = createHash("sha256");
  for (const entry of entries) {
    const bytes = asBuffer(await gitRun(["cat-file", "blob", entry.object], { binary: true }));
    const fileHash = createHash("sha256").update(bytes).digest("hex");
    tree.update(entry.path);
    tree.update("\0");
    tree.update(fileHash);
    tree.update("\n");
  }
  return {
    path: releasePath,
    file_count: entries.length,
    sha256: tree.digest("hex"),
  };
}

const commitExists = async (gitRun, commit) => {
  try {
    await gitRun(["cat-file", "-e", `${commit}^{commit}`]);
    return true;
  } catch {
    return false;
  }
};

const isAncestor = async (gitRun, ancestor, descendant) => {
  try {
    await gitRun(["merge-base", "--is-ancestor", ancestor, descendant]);
    return true;
  } catch {
    return false;
  }
};

const commitTimeMs = async (gitRun, commit) => {
  const seconds = Number(asText(await gitRun(["show", "-s", "--format=%ct", commit])));
  return Number.isFinite(seconds) ? seconds * 1000 : Number.NaN;
};

const blobAtCommit = async (gitRun, commit, path) => {
  const object = asText(await gitRun(["rev-parse", "--verify", `${commit}:${path}`]));
  return asBuffer(await gitRun(["cat-file", "blob", object], { binary: true }));
};

export async function validateGitReleaseProvenance({
  root,
  commits,
  startedAtUtc,
  evidenceTreeHashes = {},
  requiredProtocolFiles,
  candidateSkillPath = "skills/agora",
  protocolTreePath,
  gitRun = createGitRunner(root),
  targetCommit = "HEAD",
}) {
  const errors = [];
  try {
    const inside = asText(await gitRun(["rev-parse", "--is-inside-work-tree"]));
    if (inside !== "true") return ["release evidence must be verified inside a Git worktree"];
  } catch {
    return ["release evidence must be verified inside a Git worktree"];
  }

  let head;
  try {
    head = asText(await gitRun(["rev-parse", "--verify", `${targetCommit}^{commit}`]));
  } catch {
    return [`release evidence target commit ${targetCommit} does not exist`];
  }
  if (!COMMIT.test(head)) return [`release evidence target commit ${targetCommit} is invalid`];

  const namedCommits = [
    ["candidate freeze", commits?.candidate_freeze],
    ["judge protocol", commits?.judge_protocol],
    ["baseline", commits?.baseline],
  ];
  const existing = new Map();
  for (const [label, commit] of namedCommits) {
    if (!COMMIT.test(commit ?? "")) {
      errors.push(`${label} commit is invalid`);
      continue;
    }
    if (!await commitExists(gitRun, commit)) {
      errors.push(`${label} commit does not exist`);
      continue;
    }
    existing.set(label, commit);
    if (!await isAncestor(gitRun, commit, head)) {
      errors.push(`${label} commit is not an ancestor of ${targetCommit}`);
    }
  }

  const candidateCommit = existing.get("candidate freeze");
  const protocolCommit = existing.get("judge protocol");
  if (candidateCommit && protocolCommit
    && !await isAncestor(gitRun, candidateCommit, protocolCommit)) {
    errors.push("candidate freeze commit is not an ancestor of judge protocol commit");
  }

  const started = Date.parse(startedAtUtc);
  if (!Number.isFinite(started)) {
    errors.push("external artifact started_at is invalid");
  } else {
    for (const [label, commit] of namedCommits.slice(0, 2)) {
      if (!existing.has(label)) continue;
      try {
        const timestamp = await commitTimeMs(gitRun, commit);
        if (!Number.isFinite(timestamp)) errors.push(`${label} commit timestamp is invalid`);
        else if (timestamp > started) errors.push(`${label} commit is later than external artifact start`);
      } catch {
        errors.push(`${label} commit timestamp could not be read`);
      }
    }
  }

  const compareTree = async ({ label, path, commit }) => {
    if (!commit) return;
    try {
      const [current, frozen] = await Promise.all([
        computeEvalTreeLock(root, path),
        computeGitTreeLock({ gitRun, commit, releasePath: path }),
      ]);
      if (!sameTree(current, frozen)) errors.push(`${label} tree differs from ${path} at its frozen commit`);
      const evidenced = evidenceTreeHashes?.[path];
      if (evidenced && !sameTree(evidenced, frozen)) {
        errors.push(`${label} tree differs from the evidence tree hash`);
      }
    } catch (error) {
      errors.push(`${label} tree could not be verified: ${error.message}`);
    }
  };

  await compareTree({
    label: "candidate skill",
    path: candidateSkillPath,
    commit: candidateCommit,
  });
  await compareTree({
    label: "judge protocol pack",
    path: protocolTreePath,
    commit: protocolCommit,
  });

  if (protocolCommit) {
    for (const path of requiredProtocolFiles ?? []) {
      try {
        const [current, frozen] = await Promise.all([
          readFile(join(root, ...path.split("/"))),
          blobAtCommit(gitRun, protocolCommit, path),
        ]);
        if (!current.equals(frozen)) errors.push(`protocol file differs from judge protocol commit: ${path}`);
      } catch {
        errors.push(`protocol file is unavailable at judge protocol commit: ${path}`);
      }
    }
  }

  return errors;
}
