// Corpus ingestion and cleaning.
//
// Every threshold in the admission rules counts clean author-controlled words:
// the author's own prose after quotations, forwarded text, copied source
// material, boilerplate, templates, legal disclaimers, automatic signatures,
// and house-written headlines are removed. Cleaning therefore runs before any
// counting, and each removal is recorded so the profile can report what left.

import { readFile, readdir, stat } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";

import { countTypography, normalize, tokenize } from "./pipeline.mjs";

export const TEXT_EXTENSIONS = new Set([".md", ".markdown", ".txt", ".text", ".html", ".htm"]);
export const REFUSED_EXTENSIONS = new Set([".docx", ".doc", ".pdf", ".rtf", ".odt", ".pages", ".epub"]);
const MAX_FETCH_BYTES = 5_000_000;
const FETCH_TIMEOUT_MS = 20_000;

/**
 * Binary document formats are refused rather than parsed. Extracting prose from
 * them needs a dependency this package does not ship, and a partial extraction
 * would silently change the word counts every admission threshold depends on.
 */
export function refusalMessage(source, extension) {
  return `${source}: ${extension} is not supported. Export it to Markdown, plain text, or HTML and rerun. Voice thresholds count clean words, and a partial extraction from a binary format would move every one of them without saying so.`;
}

function stripHtml(html) {
  const withoutHead = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(nav|header|footer|aside|form)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
  const blockquotes = (withoutHead.match(/<blockquote\b/gi) || []).length;
  const headings = (withoutHead.match(/<h[1-6]\b/gi) || []).length;
  const body = withoutHead
    .replace(/<blockquote\b[^>]*>[\s\S]*?<\/blockquote>/gi, " ")
    .replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gi, " ")
    .replace(/<\/(p|div|li|tr|section|article|br)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
  return { text: body, removed: { blockquotes, headings } };
}

function stripMarkdown(markdown, options) {
  const removed = { frontmatter: 0, code_blocks: 0, blockquotes: 0, headings: 0, tables: 0, signatures: 0 };
  let text = markdown;

  text = text.replace(/^---\n[\s\S]*?\n---\n/, () => {
    removed.frontmatter += 1;
    return "";
  });
  text = text.replace(/^```[\s\S]*?^```$/gm, () => {
    removed.code_blocks += 1;
    return "\n\n";
  });
  text = text.replace(/^(?: {4}|\t).*$/gm, "");
  text = text.replace(/`[^`\n]+`/g, " ");

  const lines = text.split("\n");
  const kept = [];
  for (const line of lines) {
    if (/^\s*>/.test(line)) {
      removed.blockquotes += 1;
      continue;
    }
    if (/^\s{0,3}#{1,6}\s/.test(line)) {
      removed.headings += 1;
      if (!options.keepHeadings) continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line) || /^\s*\|?[\s:-]*-{3,}[\s:|-]*$/.test(line)) {
      removed.tables += 1;
      continue;
    }
    if (/^\s*(--\s*$|Sent from my |Get Outlook for )/.test(line)) {
      removed.signatures += 1;
      continue;
    }
    kept.push(line);
  }

  return {
    text: kept
      .join("\n")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
      .replace(/^\s*(?:[-*_]\s*){3,}$/gm, ""),
    removed,
  };
}

/** Clean one document and count what the cleaning removed. */
export function cleanDocument(raw, { source, format, keepHeadings = false }) {
  const typography = countTypography(raw);
  const rawWords = tokenize(raw).length;
  const html = format === "html";
  const stage = html ? stripHtml(raw) : stripMarkdown(raw, { keepHeadings });
  const cleanText = normalize(stage.text).replace(/\n{3,}/g, "\n\n").trim();
  const tokens = tokenize(cleanText);
  return {
    source,
    format,
    text: cleanText,
    tokens,
    clean_words: tokens.length,
    raw_words: rawWords,
    removed: stage.removed,
    typography,
  };
}

function formatFor(name) {
  const extension = extname(name).toLowerCase();
  if (extension === ".html" || extension === ".htm") return "html";
  return "markdown";
}

/**
 * A short, stable label for a document. Relative to the working directory when
 * the file sits underneath it, and the parent folder plus the file name when it
 * does not, so a profile never carries a long absolute path from the machine
 * that built it.
 */
function labelFor(path, cwd) {
  const relativePath = relative(cwd, path).replaceAll("\\", "/");
  if (relativePath !== "" && !relativePath.startsWith("..")) return relativePath;
  return `${basename(dirname(path))}/${basename(path)}`;
}

async function walk(directory) {
  const found = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    if (entry.name.startsWith(".")) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(path)));
    else if (entry.isFile()) found.push(path);
  }
  return found;
}

async function fetchDocument(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${url}: only http and https URLs can be fetched`);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { redirect: "follow", signal: controller.signal });
    if (!response.ok) throw new Error(`${url}: fetch returned ${response.status}`);
    const type = (response.headers.get("content-type") || "").toLowerCase();
    if (type.includes("pdf") || type.includes("officedocument") || type.includes("msword")) {
      throw new Error(refusalMessage(url, type.split(";")[0]));
    }
    const body = await response.text();
    if (body.length > MAX_FETCH_BYTES) {
      throw new Error(`${url}: response exceeds the ${MAX_FETCH_BYTES} byte ceiling`);
    }
    return { raw: body, format: type.includes("text/html") ? "html" : "markdown" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve every --from argument into cleaned documents. Directories expand to
 * their readable text files; unsupported formats are refused by name so the
 * user learns which document was skipped and why.
 */
export async function collectCorpus(sources, { keepHeadings = false, cwd = process.cwd() } = {}) {
  const documents = [];
  const refused = [];
  const targets = [];

  for (const source of sources) {
    if (/^https?:\/\//i.test(source)) {
      targets.push({ kind: "url", value: source, label: source });
      continue;
    }
    const path = resolve(cwd, source);
    const info = await stat(path).catch(() => null);
    if (!info) throw new Error(`${source}: no such file or directory`);
    if (info.isDirectory()) {
      for (const file of await walk(path)) {
        targets.push({ kind: "file", value: file, label: labelFor(file, cwd) });
      }
    } else {
      targets.push({ kind: "file", value: path, label: labelFor(path, cwd) });
    }
  }

  for (const target of targets) {
    if (target.kind === "file") {
      const extension = extname(target.value).toLowerCase();
      if (REFUSED_EXTENSIONS.has(extension)) {
        refused.push(refusalMessage(target.label, extension));
        continue;
      }
      if (!TEXT_EXTENSIONS.has(extension)) continue;
      const raw = await readFile(target.value, "utf8");
      documents.push(cleanDocument(raw, { source: target.label, format: formatFor(target.value), keepHeadings }));
      continue;
    }
    try {
      const fetched = await fetchDocument(target.value);
      documents.push(
        cleanDocument(fetched.raw, { source: target.label, format: fetched.format, keepHeadings }),
      );
    } catch (error) {
      refused.push(error.message);
    }
  }

  documents.sort((left, right) => left.source.localeCompare(right.source));
  return { documents, refused };
}
