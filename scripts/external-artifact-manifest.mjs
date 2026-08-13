import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { promisify } from "node:util";

export const EXTERNAL_FILE_MANIFEST_ALGORITHM = "sha256-path-nul-file-sha256-lf-v1";

const SHA256 = /^[a-f0-9]{64}$/;
const MANIFEST_KEYS = ["algorithm", "file_count", "files", "root", "sha256"].sort();
const FILE_KEYS = ["path", "sha256"];
const comparePaths = (left, right) => left < right ? -1 : left > right ? 1 : 0;
const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const execFileAsync = promisify(execFile);

const isSafeRelativePath = (path) => typeof path === "string"
  && path.length > 0
  && !path.includes("\\")
  && !path.startsWith("/")
  && !/^[a-zA-Z]:/.test(path)
  && !/[\0\r\n]/.test(path)
  && path.split("/").every((part) => part && part !== "." && part !== "..");

async function listFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(current, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(root, fullPath));
    else if (entry.isFile()) files.push(relative(root, fullPath).split(sep).join("/"));
  }
  return files.sort(comparePaths);
}

export const computeExternalManifestRoot = (files) => {
  const tree = createHash("sha256");
  for (const file of files) {
    tree.update(file.path);
    tree.update("\0");
    tree.update(file.sha256);
    tree.update("\n");
  }
  return tree.digest("hex");
};

export async function buildExternalFileManifest(baseRoot, relativeRoot) {
  if (!isSafeRelativePath(relativeRoot)) throw new Error(`unsafe external artifact root ${String(relativeRoot)}`);
  const absoluteRoot = join(baseRoot, ...relativeRoot.split("/"));
  const paths = await listFiles(absoluteRoot);
  const files = [];
  for (const path of paths) {
    const bytes = await readFile(join(absoluteRoot, ...path.split("/")));
    files.push({
      path,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  return {
    algorithm: EXTERNAL_FILE_MANIFEST_ALGORITHM,
    root: relativeRoot,
    file_count: files.length,
    files,
    sha256: computeExternalManifestRoot(files),
  };
}

export async function buildGitFileManifest({ repositoryRoot, commit, repositoryPath, manifestRoot }) {
  const tree = await execFileAsync(
    "git",
    ["ls-tree", "-r", "--name-only", commit, "--", repositoryPath],
    { cwd: repositoryRoot, windowsHide: true },
  );
  const prefix = `${repositoryPath}/`;
  const paths = tree.stdout.split(/\r?\n/).filter(Boolean).map((path) => path.slice(prefix.length));
  const files = [];
  for (const path of paths) {
    if (!isSafeRelativePath(path)) throw new Error(`unsafe Git artifact path ${path}`);
    const object = await execFileAsync(
      "git",
      ["cat-file", "blob", `${commit}:${repositoryPath}/${path}`],
      { cwd: repositoryRoot, windowsHide: true, encoding: "buffer", maxBuffer: 16 * 1024 * 1024 },
    );
    files.push({ path, sha256: createHash("sha256").update(object.stdout).digest("hex") });
  }
  return createExternalFileManifest({ root: manifestRoot, files });
}

export function validateExternalFileManifest({ manifest, expectedRoot, expectedPaths, label }) {
  const errors = [];
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return [`${label} must be a file manifest object`];
  }
  if (!sameJson(Object.keys(manifest).sort(), MANIFEST_KEYS)) {
    errors.push(`${label} must contain exactly algorithm, root, file_count, files, and sha256`);
  }
  if (manifest.algorithm !== EXTERNAL_FILE_MANIFEST_ALGORITHM) {
    errors.push(`${label}.algorithm is unsupported`);
  }
  if (manifest.root !== expectedRoot) errors.push(`${label}.root is invalid`);
  if (!Array.isArray(manifest.files)) {
    errors.push(`${label}.files must be an array`);
    return errors;
  }

  const paths = [];
  for (const [index, file] of manifest.files.entries()) {
    const fileLabel = `${label}.files[${index}]`;
    if (!file || typeof file !== "object" || Array.isArray(file)
      || !sameJson(Object.keys(file).sort(), FILE_KEYS)) {
      errors.push(`${fileLabel} must contain exactly path and sha256`);
      continue;
    }
    if (!isSafeRelativePath(file.path)) errors.push(`${fileLabel}.path is not a safe relative path`);
    if (!SHA256.test(file.sha256 ?? "")) errors.push(`${fileLabel}.sha256 is invalid`);
    paths.push(file.path);
  }
  const sortedPaths = [...paths].sort(comparePaths);
  if (!sameJson(paths, sortedPaths) || new Set(paths).size !== paths.length) {
    errors.push(`${label}.files must use unique paths in deterministic order`);
  }
  if (!Number.isInteger(manifest.file_count) || manifest.file_count !== manifest.files.length) {
    errors.push(`${label}.file_count does not match files`);
  }
  if (expectedPaths && !sameJson(paths, [...expectedPaths].sort(comparePaths))) {
    errors.push(`${label}.files do not match the exact expected paths`);
  }
  if (!SHA256.test(manifest.sha256 ?? "")
    || manifest.sha256 !== computeExternalManifestRoot(manifest.files)) {
    errors.push(`${label}.sha256 does not match its file manifest root`);
  }
  return errors;
}

export const sameExternalFileSet = (left, right) => Boolean(left && right)
  && left.algorithm === right.algorithm
  && left.file_count === right.file_count
  && left.sha256 === right.sha256
  && sameJson(left.files, right.files);

export function createExternalFileManifest({ root, files }) {
  const normalized = [...files].sort((left, right) => comparePaths(left.path, right.path));
  return {
    algorithm: EXTERNAL_FILE_MANIFEST_ALGORITHM,
    root,
    file_count: normalized.length,
    files: normalized,
    sha256: computeExternalManifestRoot(normalized),
  };
}
