#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { lstat, mkdtemp, open, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { inflateRawSync, inflateSync } from "node:zlib";

const SCHEMA_VERSION = "agora.publication-audit.v1";
const SCANNER_VERSION = "1.0.0";
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_FILES = 1000;
const MAX_ZIP_ENTRIES = 10000;
const MAX_ZIP_EXPANDED_BYTES = 128 * 1024 * 1024;
const MAX_ZIP_ENTRY_BYTES = 16 * 1024 * 1024;
const MAX_EXTERNAL_OUTPUT = 4 * 1024 * 1024;
const MAX_FINDINGS_PER_FILE = 500;
const MAX_CONTAINER_SEGMENTS = 10000;
const MAX_MATCHES_PER_CHECK = 1000;
const MAX_PNG_EXPANDED_TEXT_BYTES = 32 * 1024 * 1024;
const TEXT_EXTENSIONS = new Set([".txt", ".md", ".markdown", ".html", ".htm", ".svg"]);
const OFFICE_EXTENSIONS = new Set([".docx", ".pptx"]);
const MEDIA_EXTENSIONS = new Set([".pdf", ".png", ".jpg", ".jpeg"]);
const ALLOWED_STATUSES = new Set(["FOUND", "NOT_FOUND_BY_THIS_CHECK", "UNKNOWN", "ERROR"]);
const CRC32_TABLE = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  return value >>> 0;
});

const HELP = `Agora publication privacy and provenance audit

Usage:
  agora-publication-audit <path...> [options]

Options:
  --json             Print JSON instead of the human report
  --show-values      Include bounded metadata values and text context
  --include-paths    Include absolute source paths in the report
  --verify-c2pa      Run local c2patool verification when available
  --output <path>    Write the report to a new file instead of stdout
  --help              Show this help

The audit never changes source files. It does not remove watermarks, determine
authorship, or prove that a file is clean. Missing or partial coverage is
reported as UNKNOWN.
`;

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function bounded(value, limit = 240) {
  const normalized = String(value)
    .replace(/\p{Cf}/gu, (character) => `<${codePointLabel(character.codePointAt(0))}>`)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length <= limit ? normalized : `${normalized.slice(0, limit)}...`;
}

function parseArgs(argv) {
  const options = {
    json: false,
    showValues: false,
    includePaths: false,
    verifyC2pa: false,
    output: null,
    paths: [],
  };
  let positionalOnly = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (positionalOnly) {
      options.paths.push(arg);
      continue;
    }
    if (arg === "--") {
      positionalOnly = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") return { ...options, help: true };
    if (arg === "--json") options.json = true;
    else if (arg === "--show-values") options.showValues = true;
    else if (arg === "--include-paths") options.includePaths = true;
    else if (arg === "--verify-c2pa") options.verifyC2pa = true;
    else if (arg === "--output") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error("--output requires a path");
      options.output = resolve(value);
      index += 1;
    } else if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
    else options.paths.push(arg);
  }
  if (options.paths.length === 0) throw new Error("Provide at least one file or directory");
  return options;
}

function displayPath(path, includePaths) {
  return bounded(includePaths ? resolve(path) : basename(path), 1000);
}

async function collectFiles(inputPaths, options) {
  const files = [];
  const inputErrors = [];
  const skippedSymlinks = [];
  const outputPath = options.output ? resolve(options.output) : null;

  async function visit(path) {
    if (files.length >= MAX_FILES) throw new Error(`Audit is limited to ${MAX_FILES} files`);
    let stats;
    try {
      stats = await lstat(path);
    } catch (error) {
      inputErrors.push({
        path: displayPath(path, options.includePaths),
        status: "ERROR",
        detail: `Cannot inspect input: ${error.code || "read error"}`,
      });
      return;
    }
    if (stats.isSymbolicLink()) {
      skippedSymlinks.push(displayPath(path, options.includePaths));
      return;
    }
    if (stats.isDirectory()) {
      let entries;
      try {
        entries = await readdir(path, { withFileTypes: true });
      } catch (error) {
        inputErrors.push({
          path: displayPath(path, options.includePaths),
          status: "ERROR",
          detail: `Cannot read directory: ${error.code || "read error"}`,
        });
        return;
      }
      for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
        await visit(join(path, entry.name));
      }
      return;
    }
    if (!stats.isFile()) return;
    if (outputPath && resolve(path) === outputPath) return;
    files.push(resolve(path));
  }

  for (const input of inputPaths) await visit(resolve(input));
  return { files, inputErrors, skippedSymlinks };
}

function createResult(path, options) {
  return {
    path: displayPath(path, options.includePaths),
    ...(options.includePaths ? { absolutePath: bounded(resolve(path), 1000) } : {}),
    extension: bounded(extname(path).toLowerCase(), 32) || null,
    sizeBytes: null,
    sha256Before: null,
    sha256After: null,
    sourceUnchanged: null,
    status: "UNKNOWN",
    findings: [],
    coverage: [],
  };
}

function addCoverage(result, check, status, detail) {
  if (!ALLOWED_STATUSES.has(status)) throw new Error(`Invalid status: ${status}`);
  result.coverage.push({ check: bounded(check, 100), status, detail: bounded(detail, 500) });
}

function addFinding(result, options, finding) {
  if (result.findings.length >= MAX_FINDINGS_PER_FILE) {
    if (!result.coverage.some((entry) => entry.check === "finding-limit")) {
      addCoverage(result, "finding-limit", "UNKNOWN", `More than ${MAX_FINDINGS_PER_FILE} findings were present; remaining findings were omitted.`);
    }
    return;
  }
  const entry = {
    id: bounded(finding.id, 100),
    category: bounded(finding.category, 40),
    severity: bounded(finding.severity, 40),
    status: "FOUND",
    title: bounded(finding.title, 200),
    ...(finding.field ? { field: finding.sourceControlledField && !options.showValues ? "[redacted]" : bounded(finding.field, 200) } : {}),
    ...(finding.count ? { count: finding.count } : {}),
    ...(finding.locations ? { locations: finding.locations } : {}),
    ...(finding.detail ? { detail: bounded(finding.detail, 500) } : {}),
  };
  if (Object.hasOwn(finding, "value")) {
    entry.value = options.showValues ? bounded(finding.value) : "[redacted]";
  }
  result.findings.push(entry);
}

function finalizeStatus(result) {
  if (result.coverage.some((entry) => entry.status === "ERROR")) result.status = "ERROR";
  else if (result.findings.length > 0) result.status = "FOUND";
  else if (result.coverage.some((entry) => entry.status === "UNKNOWN")) result.status = "UNKNOWN";
  else if (result.coverage.some((entry) => entry.status === "NOT_FOUND_BY_THIS_CHECK")) {
    result.status = "NOT_FOUND_BY_THIS_CHECK";
  } else result.status = "UNKNOWN";
}

function codePointLabel(codePoint) {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
}

function classifyInvisible(codePoint, offset) {
  const map = new Map([
    [0x00a0, ["NO-BREAK SPACE", "info", "Visible spacing can differ across renderers."]],
    [0x00ad, ["SOFT HYPHEN", "review", "May change line wrapping or remain visually hidden."]],
    [0x200b, ["ZERO WIDTH SPACE", "review", "Invisible separator; review its purpose."]],
    [0x200c, ["ZERO WIDTH NON-JOINER", "info", "May be required for language-specific shaping."]],
    [0x200d, ["ZERO WIDTH JOINER", "info", "May be required for emoji or script shaping."]],
    [0x200e, ["LEFT-TO-RIGHT MARK", "review", "Directional control; review its purpose."]],
    [0x200f, ["RIGHT-TO-LEFT MARK", "review", "Directional control; review its purpose."]],
    [0x202a, ["LEFT-TO-RIGHT EMBEDDING", "review", "Directional control; review display order."]],
    [0x202b, ["RIGHT-TO-LEFT EMBEDDING", "review", "Directional control; review display order."]],
    [0x202c, ["POP DIRECTIONAL FORMATTING", "review", "Directional control; review display order."]],
    [0x202d, ["LEFT-TO-RIGHT OVERRIDE", "review", "Directional override; review display order."]],
    [0x202e, ["RIGHT-TO-LEFT OVERRIDE", "review", "Directional override; review display order."]],
    [0x2060, ["WORD JOINER", "review", "Invisible joining control; review its purpose."]],
    [0x2066, ["LEFT-TO-RIGHT ISOLATE", "review", "Directional control; review display order."]],
    [0x2067, ["RIGHT-TO-LEFT ISOLATE", "review", "Directional control; review display order."]],
    [0x2068, ["FIRST STRONG ISOLATE", "review", "Directional control; review display order."]],
    [0x2069, ["POP DIRECTIONAL ISOLATE", "review", "Directional control; review display order."]],
    [0xfeff, [offset === 0 ? "BYTE ORDER MARK" : "ZERO WIDTH NO-BREAK SPACE", offset === 0 ? "info" : "review", offset === 0 ? "Normal at the start of some text files." : "Invisible character inside text; review its purpose."]],
  ]);
  if (map.has(codePoint)) return map.get(codePoint);
  if ((codePoint >= 0xfe00 && codePoint <= 0xfe0f) || (codePoint >= 0xe0100 && codePoint <= 0xe01ef)) {
    return ["VARIATION SELECTOR", "info", "May be required for emoji or glyph presentation."];
  }
  if ((codePoint >= 0 && codePoint <= 0x08) || codePoint === 0x0b || codePoint === 0x0c
    || (codePoint >= 0x0e && codePoint <= 0x1f) || codePoint === 0x7f) {
    return ["CONTROL CHARACTER", "review", "Non-printing control; review its purpose."];
  }
  return null;
}

function scanUnicode(text, result, options) {
  const groups = new Map();
  let line = 1;
  let column = 1;
  for (let offset = 0; offset < text.length;) {
    const codePoint = text.codePointAt(offset);
    const width = codePoint > 0xffff ? 2 : 1;
    const classification = classifyInvisible(codePoint, offset);
    if (classification) {
      const key = codePointLabel(codePoint);
      const existing = groups.get(key) ?? {
        codePoint,
        name: classification[0],
        severity: classification[1],
        detail: classification[2],
        count: 0,
        locations: [],
        contexts: [],
      };
      existing.count += 1;
      if (existing.locations.length < 5) existing.locations.push({ line, column, offset });
      if (existing.contexts.length < 3) existing.contexts.push(text.slice(Math.max(0, offset - 16), offset + width + 16));
      groups.set(key, existing);
    }
    if (codePoint === 0x0a) {
      line += 1;
      column = 1;
    } else column += 1;
    offset += width;
  }
  for (const [label, group] of groups) {
    addFinding(result, options, {
      id: `unicode-${label.toLowerCase().replace("+", "-")}`,
      category: "privacy",
      severity: group.severity,
      title: `${label} ${group.name}`,
      count: group.count,
      locations: group.locations,
      detail: group.detail,
      ...(options.showValues ? { value: group.contexts.join(" | ") } : {}),
    });
  }
  addCoverage(
    result,
    "unicode-invisible-controls",
    groups.size > 0 ? "FOUND" : "NOT_FOUND_BY_THIS_CHECK",
    groups.size > 0 ? `${groups.size} code-point type(s) found.` : "No configured invisible or control characters found.",
  );
}

function parseHtmlAttributes(tag) {
  const attributes = new Map();
  const pattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(pattern)) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

function collectMatches(text, pattern, limit = MAX_MATCHES_PER_CHECK) {
  const matches = [];
  for (const match of text.matchAll(pattern)) {
    if (matches.length >= limit) return { matches, truncated: true };
    matches.push(match);
  }
  return { matches, truncated: false };
}

function scanMarkup(text, extension, result, options) {
  let metadataCount = 0;
  const metaTags = collectMatches(text, /<meta\b[^>]*>/gi);
  for (const match of metaTags.matches) {
    const attributes = parseHtmlAttributes(match[0]);
    const field = attributes.get("name") || attributes.get("property") || attributes.get("itemprop") || "meta";
    if (!/(?:author|creator|generator|producer|application|company|manager|copyright|email|c2pa|credential)/i.test(field)) continue;
    const value = attributes.get("content") ?? "";
    metadataCount += 1;
    addFinding(result, options, {
      id: "markup-meta-field",
      category: /c2pa|credential/i.test(field) ? "provenance" : "privacy",
      severity: /c2pa|credential/i.test(field) ? "provenance" : /author|creator|company|manager|email/i.test(field) ? "sensitive" : "info",
      title: "Markup metadata field",
      field,
      sourceControlledField: true,
      value,
    });
  }
  if (metaTags.truncated) addCoverage(result, "markup-meta-fields", "UNKNOWN", `Metadata scan stopped after ${MAX_MATCHES_PER_CHECK} tags.`);
  const comments = collectMatches(text, /<!--[\s\S]*?-->/g);
  if (comments.matches.length > 0) {
    metadataCount += comments.matches.length;
    addFinding(result, options, {
      id: "markup-comments",
      category: "privacy",
      severity: "review",
      title: "Published markup comments",
      count: comments.matches.length,
      detail: "Comments remain available to recipients and page-source viewers.",
      ...(options.showValues ? { value: comments.matches.slice(0, 3).map((item) => item[0]).join(" | ") } : {}),
    });
    if (comments.truncated) addCoverage(result, "markup-comments", "UNKNOWN", `Comment scan stopped after ${MAX_MATCHES_PER_CHECK} matches.`);
  }
  if (extension === ".svg") {
    const metadataBlocks = collectMatches(text, /<metadata\b[\s\S]*?<\/metadata>/gi);
    if (metadataBlocks.matches.length > 0) {
      metadataCount += metadataBlocks.matches.length;
      addFinding(result, options, {
        id: "svg-metadata",
        category: "privacy",
        severity: "review",
        title: "SVG metadata block",
        count: metadataBlocks.matches.length,
        ...(options.showValues ? { value: metadataBlocks.matches.slice(0, 2).map((item) => item[0]).join(" | ") } : {}),
      });
      if (metadataBlocks.truncated) addCoverage(result, "svg-metadata-blocks", "UNKNOWN", `Metadata scan stopped after ${MAX_MATCHES_PER_CHECK} matches.`);
    }
    for (const attribute of ["inkscape:version", "sodipodi:docname"]) {
      const match = text.match(new RegExp(`${attribute}\\s*=\\s*["']([^"']*)["']`, "i"));
      if (!match) continue;
      metadataCount += 1;
      addFinding(result, options, {
        id: "svg-editor-field",
        category: "provenance",
        severity: "provenance",
        title: "SVG editor field",
        field: attribute,
        value: match[1],
      });
    }
  }
  addCoverage(
    result,
    "markup-metadata",
    metadataCount > 0 ? "FOUND" : "NOT_FOUND_BY_THIS_CHECK",
    metadataCount > 0 ? `${metadataCount} markup metadata item(s) found.` : "No configured markup metadata found.",
  );
}

function zipEntries(buffer) {
  const minimum = Math.max(0, buffer.length - 65557);
  let eocd = -1;
  for (let index = buffer.length - 22; index >= minimum; index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) throw new Error("ZIP end-of-central-directory record not found");
  const entryCount = buffer.readUInt16LE(eocd + 10);
  const diskNumber = buffer.readUInt16LE(eocd + 4);
  const centralDisk = buffer.readUInt16LE(eocd + 6);
  const diskEntryCount = buffer.readUInt16LE(eocd + 8);
  const archiveCommentLength = buffer.readUInt16LE(eocd + 20);
  if (eocd + 22 + archiveCommentLength !== buffer.length) throw new Error("ZIP end record or archive comment is inconsistent");
  if (diskNumber !== 0 || centralDisk !== 0 || diskEntryCount !== entryCount) {
    throw new Error("Multi-disk ZIP files are not supported");
  }
  const centralSize = buffer.readUInt32LE(eocd + 12);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  if (entryCount > MAX_ZIP_ENTRIES) throw new Error(`ZIP contains more than ${MAX_ZIP_ENTRIES} entries`);
  if (centralOffset + centralSize > buffer.length) throw new Error("ZIP central directory is outside the file");
  if (centralOffset + centralSize !== eocd) throw new Error("ZIP central directory boundary is inconsistent");
  const entries = [];
  const names = new Set();
  let cursor = centralOffset;
  let totalExpanded = 0;
  for (let count = 0; count < entryCount; count += 1) {
    if (cursor + 46 > buffer.length || buffer.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error("ZIP central directory is malformed");
    }
    const flags = buffer.readUInt16LE(cursor + 8);
    const method = buffer.readUInt16LE(cursor + 10);
    const crc = buffer.readUInt32LE(cursor + 16);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    if ([compressedSize, uncompressedSize, localOffset].includes(0xffffffff)) {
      throw new Error("ZIP64 office files are not supported by this check");
    }
    if (flags & 0x1) throw new Error("Encrypted ZIP entries are not supported");
    const nameStart = cursor + 46;
    const nameEnd = nameStart + nameLength;
    if (nameEnd > buffer.length) throw new Error("ZIP entry name is outside the file");
    const encoding = flags & 0x800 ? "utf8" : "latin1";
    const name = buffer.subarray(nameStart, nameEnd).toString(encoding).replaceAll("\\", "/");
    if (name.split("/").some((part) => part === "..")) throw new Error("ZIP entry contains parent traversal");
    if (names.has(name)) throw new Error(`ZIP contains duplicate entry: ${bounded(name)}`);
    names.add(name);
    totalExpanded += uncompressedSize;
    if (totalExpanded > MAX_ZIP_EXPANDED_BYTES) throw new Error("ZIP expanded-size limit exceeded");
    entries.push({ name, flags, method, crc, compressedSize, uncompressedSize, localOffset });
    cursor = nameEnd + extraLength + commentLength;
    if (cursor > centralOffset + centralSize) throw new Error("ZIP central entry exceeds the central directory");
  }
  if (cursor !== centralOffset + centralSize) throw new Error("ZIP central directory size is inconsistent");
  return entries;
}

function crc32Parts(parts) {
  let crc = 0xffffffff;
  for (const buffer of parts) {
    for (const byte of buffer) crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function crc32(buffer) {
  return crc32Parts([buffer]);
}

function readZipEntry(buffer, entry) {
  if (entry.uncompressedSize > MAX_ZIP_ENTRY_BYTES) throw new Error(`ZIP entry too large: ${entry.name}`);
  const offset = entry.localOffset;
  if (offset + 30 > buffer.length || buffer.readUInt32LE(offset) !== 0x04034b50) {
    throw new Error(`ZIP local header is malformed: ${entry.name}`);
  }
  const localFlags = buffer.readUInt16LE(offset + 6);
  const localMethod = buffer.readUInt16LE(offset + 8);
  const localCrc = buffer.readUInt32LE(offset + 14);
  const localCompressedSize = buffer.readUInt32LE(offset + 18);
  const localUncompressedSize = buffer.readUInt32LE(offset + 22);
  const nameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const localNameStart = offset + 30;
  const localNameEnd = localNameStart + nameLength;
  if (localNameEnd > buffer.length) throw new Error(`ZIP local name is outside the file: ${bounded(entry.name)}`);
  const localEncoding = localFlags & 0x800 ? "utf8" : "latin1";
  const localName = buffer.subarray(localNameStart, localNameEnd).toString(localEncoding).replaceAll("\\", "/");
  if (localName !== entry.name || localFlags !== entry.flags || localMethod !== entry.method) {
    throw new Error(`ZIP local and central headers disagree: ${bounded(entry.name)}`);
  }
  if (!(entry.flags & 0x8)
    && (localCrc !== entry.crc || localCompressedSize !== entry.compressedSize || localUncompressedSize !== entry.uncompressedSize)) {
    throw new Error(`ZIP local sizes or CRC disagree: ${bounded(entry.name)}`);
  }
  const start = offset + 30 + nameLength + extraLength;
  const end = start + entry.compressedSize;
  if (end > buffer.length) throw new Error(`ZIP entry data is outside the file: ${entry.name}`);
  const compressed = buffer.subarray(start, end);
  let data;
  if (entry.method === 0) data = compressed;
  else if (entry.method === 8) data = inflateRawSync(compressed, { maxOutputLength: MAX_ZIP_ENTRY_BYTES });
  else throw new Error(`Unsupported ZIP compression method ${entry.method}: ${entry.name}`);
  if (data.length !== entry.uncompressedSize) throw new Error(`ZIP entry size mismatch: ${entry.name}`);
  if (crc32(data) !== entry.crc) throw new Error(`ZIP entry CRC mismatch: ${bounded(entry.name)}`);
  return data;
}

function decodeXml(value) {
  return bounded(value
    .replace(/<[^>]*>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&"));
}

function xmlTagValues(xml, localName) {
  const pattern = new RegExp(`<[^>:/\\s]+:${localName}\\b[^>]*>([\\s\\S]*?)<\\/[^>:/\\s]+:${localName}>`, "gi");
  const values = [];
  for (const match of xml.matchAll(pattern)) {
    if (values.length >= MAX_MATCHES_PER_CHECK) break;
    const value = decodeXml(match[1]);
    if (value) values.push(value);
  }
  return values;
}

function officeEntryText(buffer, entries, name) {
  const entry = entries.find((candidate) => candidate.name.toLowerCase() === name.toLowerCase());
  return entry ? readZipEntry(buffer, entry).toString("utf8") : "";
}

function addOfficeProperty(result, options, source, field, value, severity = "review") {
  addFinding(result, options, {
    id: "office-property",
    category: severity === "info" ? "provenance" : "privacy",
    severity,
    title: "Office document property",
    field: `${source}.${field}`,
    value,
  });
}

function scanOffice(buffer, extension, result, options) {
  let entries;
  try {
    entries = zipEntries(buffer);
  } catch (error) {
    addCoverage(result, "office-container", "ERROR", error.message);
    return;
  }
  addCoverage(result, "office-container", "NOT_FOUND_BY_THIS_CHECK", `Parsed ${entries.length} container entries without extraction.`);
  const core = officeEntryText(buffer, entries, "docProps/core.xml");
  const app = officeEntryText(buffer, entries, "docProps/app.xml");
  let propertyCount = 0;
  for (const [field, severity] of [
    ["creator", "sensitive"],
    ["lastModifiedBy", "sensitive"],
    ["title", "review"],
    ["subject", "review"],
    ["description", "review"],
    ["keywords", "review"],
    ["created", "info"],
    ["modified", "info"],
  ]) {
    for (const value of xmlTagValues(core, field)) {
      propertyCount += 1;
      addOfficeProperty(result, options, "core", field, value, severity);
    }
  }
  for (const [field, severity] of [
    ["Application", "info"],
    ["AppVersion", "info"],
    ["Company", "sensitive"],
    ["Manager", "sensitive"],
    ["Template", "review"],
  ]) {
    const pattern = new RegExp(`<${field}\\b[^>]*>([\\s\\S]*?)<\\/${field}>`, "gi");
    for (const match of app.matchAll(pattern)) {
      propertyCount += 1;
      addOfficeProperty(result, options, "app", field, decodeXml(match[1]), severity);
    }
  }
  const customProperties = entries.filter((entry) => /^docProps\/custom\.xml$/i.test(entry.name));
  if (customProperties.length > 0) {
    propertyCount += customProperties.length;
    addFinding(result, options, {
      id: "office-custom-properties",
      category: "privacy",
      severity: "review",
      title: "Office custom properties",
      count: customProperties.length,
      detail: "Custom properties can contain organization-specific or personal data.",
    });
  }
  addCoverage(
    result,
    "office-properties",
    propertyCount > 0 ? "FOUND" : "NOT_FOUND_BY_THIS_CHECK",
    propertyCount > 0 ? `${propertyCount} configured property value(s) found.` : "No configured Office properties found.",
  );

  if (extension === ".docx") {
    const comments = entries.filter((entry) => /^word\/comments[^/]*\.xml$/i.test(entry.name));
    const storyParts = entries.filter((entry) => /^word\/(?:document|header\d+|footer\d+|footnotes|endnotes|comments[^/]*)\.xml$/i.test(entry.name));
    let tracked = 0;
    let trackedTruncated = false;
    for (const entry of storyParts) {
      const xml = readZipEntry(buffer, entry).toString("utf8");
      for (const _match of xml.matchAll(/<(?:[A-Za-z_][\w.-]*:)?(?:ins|del|moveFrom|moveTo)\b/gi)) {
        tracked += 1;
        if (tracked >= MAX_MATCHES_PER_CHECK) {
          trackedTruncated = true;
          break;
        }
      }
      if (trackedTruncated) break;
    }
    if (comments.length > 0) addFinding(result, options, {
      id: "docx-comments",
      category: "privacy",
      severity: "sensitive",
      title: "Word comments",
      count: comments.length,
      detail: "Comments and their author fields can remain in the document package.",
    });
    if (tracked > 0) addFinding(result, options, {
      id: "docx-tracked-changes",
      category: "privacy",
      severity: "sensitive",
      title: "Word tracked changes",
      count: tracked,
      detail: "Inserted or deleted content remains represented in document XML.",
    });
    if (trackedTruncated) addCoverage(result, "docx-tracked-changes", "UNKNOWN", `Tracked-change scan stopped after ${MAX_MATCHES_PER_CHECK} elements.`);
    addCoverage(result, "docx-review-data", comments.length + tracked > 0 ? "FOUND" : "NOT_FOUND_BY_THIS_CHECK",
      comments.length + tracked > 0 ? "Comments or tracked changes found." : "No comments or tracked-change elements found.");
  }

  if (extension === ".pptx") {
    const notes = entries.filter((entry) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/i.test(entry.name));
    const comments = entries.filter((entry) => /^ppt\/comments\/comment\d+\.xml$/i.test(entry.name));
    const commentAuthors = entries.filter((entry) => /^ppt\/commentAuthors\.xml$/i.test(entry.name));
    let hiddenSlides = 0;
    for (const entry of entries.filter((candidate) => /^ppt\/slides\/slide\d+\.xml$/i.test(candidate.name))) {
      const xml = readZipEntry(buffer, entry).toString("utf8");
      if (/<(?:[A-Za-z_][\w.-]*:)?sld\b[^>]*\bshow=["'](?:0|false|off)["']/i.test(xml)) hiddenSlides += 1;
    }
    if (notes.length > 0) addFinding(result, options, {
      id: "pptx-speaker-notes",
      category: "privacy",
      severity: "sensitive",
      title: "PowerPoint speaker notes",
      count: notes.length,
    });
    if (comments.length + commentAuthors.length > 0) addFinding(result, options, {
      id: "pptx-comments",
      category: "privacy",
      severity: "sensitive",
      title: "PowerPoint comments or comment authors",
      count: comments.length + commentAuthors.length,
    });
    if (hiddenSlides > 0) addFinding(result, options, {
      id: "pptx-hidden-slides",
      category: "privacy",
      severity: "review",
      title: "PowerPoint hidden slides",
      count: hiddenSlides,
    });
    addCoverage(result, "pptx-review-data", notes.length + comments.length + commentAuthors.length + hiddenSlides > 0 ? "FOUND" : "NOT_FOUND_BY_THIS_CHECK",
      notes.length + comments.length + commentAuthors.length + hiddenSlides > 0 ? "Notes, comments, authors, or hidden slides found." : "No notes, comments, authors, or hidden slides found.");
  }

  const customXml = entries.filter((entry) => /^customXml\//i.test(entry.name));
  if (customXml.length > 0) addFinding(result, options, {
    id: "office-custom-xml",
    category: "privacy",
    severity: "review",
    title: "Office custom XML",
    count: customXml.length,
  });
  addCoverage(result, "office-custom-xml", customXml.length > 0 ? "FOUND" : "NOT_FOUND_BY_THIS_CHECK",
    customXml.length > 0 ? `${customXml.length} custom XML entry or entries found.` : "No custom XML entries found.");

  const media = entries.filter((entry) => /^(?:word|ppt)\/media\//i.test(entry.name));
  addCoverage(result, "office-embedded-media-metadata", media.length > 0 ? "UNKNOWN" : "NOT_FOUND_BY_THIS_CHECK",
    media.length > 0 ? `${media.length} embedded media file(s) were not recursively inspected.` : "No embedded media files found.");
}

function pdfLiteral(value) {
  return bounded(value.replace(/\\([\\()])/g, "$1").replace(/\\[nrtbf]/g, " "));
}

function scanPdf(buffer, result, options) {
  const text = buffer.toString("latin1");
  let infoCount = 0;
  for (const field of ["Author", "Creator", "Producer", "Title", "Subject", "Keywords", "CreationDate", "ModDate"]) {
    const pattern = new RegExp(`/${field}\\s*\\(([^)]*)\\)`, "g");
    for (const match of text.matchAll(pattern)) {
      if (infoCount >= MAX_MATCHES_PER_CHECK) {
        addCoverage(result, "pdf-document-info", "UNKNOWN", `Raw PDF metadata scan stopped after ${MAX_MATCHES_PER_CHECK} fields.`);
        break;
      }
      infoCount += 1;
      addFinding(result, options, {
        id: "pdf-document-info",
        category: /Author|Creator/i.test(field) ? "privacy" : "provenance",
        severity: /Author/i.test(field) ? "sensitive" : /Creator|Producer/i.test(field) ? "provenance" : "review",
        title: "PDF document information",
        field,
        value: pdfLiteral(match[1]),
      });
    }
  }
  addCoverage(result, "pdf-document-info", infoCount > 0 ? "FOUND" : "UNKNOWN",
    infoCount > 0 ? `${infoCount} raw PDF information field(s) found; compressed, indirect, hexadecimal, and UTF-16 values require ExifTool.` : "Raw-byte scan found no configured PDF information fields; compressed, indirect, hexadecimal, and UTF-16 values remain uninspected.");
  const xmp = /<x:xmpmeta\b[\s\S]*?<\/x:xmpmeta>/i.exec(text);
  if (xmp) addFinding(result, options, {
    id: "pdf-xmp",
    category: "provenance",
    severity: "provenance",
    title: "PDF XMP metadata packet",
    ...(options.showValues ? { value: xmp[0] } : {}),
  });
  addCoverage(result, "pdf-xmp", xmp ? "FOUND" : "UNKNOWN",
    xmp ? "Uncompressed XMP packet found." : "No uncompressed XMP packet found; compressed XMP remains uninspected.");
  const carrier = /(?:c2pa|content credentials|jumbf)/i.test(text);
  recordC2paCarrier(result, options, carrier, "PDF byte markers", "UNKNOWN");
}

function pngChunks(buffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 8 || !buffer.subarray(0, 8).equals(signature)) throw new Error("PNG signature is invalid");
  const chunks = [];
  let cursor = 8;
  while (cursor + 12 <= buffer.length) {
    if (chunks.length >= MAX_CONTAINER_SEGMENTS) throw new Error(`PNG contains more than ${MAX_CONTAINER_SEGMENTS} chunks`);
    const length = buffer.readUInt32BE(cursor);
    const type = buffer.subarray(cursor + 4, cursor + 8).toString("ascii");
    const end = cursor + 12 + length;
    if (end > buffer.length) throw new Error("PNG chunk is outside the file");
    const data = buffer.subarray(cursor + 8, cursor + 8 + length);
    const suppliedCrc = buffer.readUInt32BE(cursor + 8 + length);
    const actualCrc = crc32Parts([buffer.subarray(cursor + 4, cursor + 8), data]);
    if (suppliedCrc !== actualCrc) throw new Error(`PNG ${bounded(type)} chunk CRC mismatch`);
    chunks.push({ type, data });
    cursor = end;
    if (type === "IEND") {
      if (length !== 0) throw new Error("PNG IEND chunk must be empty");
      if (cursor !== buffer.length) throw new Error("PNG contains data after IEND");
      break;
    }
  }
  if (chunks.length === 0 || chunks[0].type !== "IHDR" || chunks[0].data.length !== 13) {
    throw new Error("PNG must begin with one 13-byte IHDR chunk");
  }
  if (chunks.filter((chunk) => chunk.type === "IHDR").length !== 1) throw new Error("PNG must contain exactly one IHDR chunk");
  if (chunks.at(-1)?.type !== "IEND") throw new Error("PNG IEND chunk is missing");
  return chunks;
}

function parsePngText(chunk, remainingExpandedBytes) {
  const separator = chunk.data.indexOf(0);
  if (separator < 0) return null;
  const key = chunk.data.subarray(0, separator).toString("latin1");
  if (chunk.type === "tEXt") {
    const payload = chunk.data.subarray(separator + 1);
    if (payload.length > remainingExpandedBytes) throw new Error("PNG expanded text metadata limit exceeded");
    return { key, value: payload.toString("latin1"), expandedBytes: payload.length };
  }
  if (chunk.type === "zTXt") {
    if (chunk.data[separator + 1] !== 0) return null;
    const payload = inflateSync(chunk.data.subarray(separator + 2), { maxOutputLength: remainingExpandedBytes });
    return { key, value: payload.toString("latin1"), expandedBytes: payload.length };
  }
  if (chunk.type === "iTXt") {
    let cursor = separator + 1;
    const compressed = chunk.data[cursor] === 1;
    cursor += 2;
    for (let field = 0; field < 2; field += 1) {
      const end = chunk.data.indexOf(0, cursor);
      if (end < 0) return null;
      cursor = end + 1;
    }
    const payload = chunk.data.subarray(cursor);
    const expanded = compressed ? inflateSync(payload, { maxOutputLength: remainingExpandedBytes }) : payload;
    if (expanded.length > remainingExpandedBytes) throw new Error("PNG expanded text metadata limit exceeded");
    return { key, value: expanded.toString("utf8"), expandedBytes: expanded.length };
  }
  return null;
}

function classifyMetadataKey(key) {
  if (/gps|serial|owner|email|history|ancestor|hostcomputer/i.test(key)) return ["privacy", "sensitive"];
  if (/author|artist|creator|company|manager|comment|description|documentname/i.test(key)) return ["privacy", "review"];
  if (/c2pa|credential|jumbf/i.test(key)) return ["provenance", "provenance"];
  return ["provenance", "info"];
}

function scanPng(buffer, result, options) {
  let chunks;
  try {
    chunks = pngChunks(buffer);
  } catch (error) {
    addCoverage(result, "png-structure", "ERROR", error.message);
    return;
  }
  addCoverage(result, "png-structure", "NOT_FOUND_BY_THIS_CHECK", `Parsed ${chunks.length} PNG chunks.`);
  let metadataCount = 0;
  let expandedTextBytes = 0;
  for (const chunk of chunks.filter((item) => ["tEXt", "zTXt", "iTXt"].includes(item.type))) {
    if (metadataCount >= MAX_MATCHES_PER_CHECK) {
      addCoverage(result, "png-text-metadata-limit", "UNKNOWN", `PNG text scan stopped after ${MAX_MATCHES_PER_CHECK} chunks.`);
      break;
    }
    let item;
    try {
      item = parsePngText(chunk, MAX_PNG_EXPANDED_TEXT_BYTES - expandedTextBytes);
    } catch {
      addCoverage(result, "png-text-metadata", "ERROR", `Could not safely decode ${chunk.type} metadata within the aggregate expansion limit.`);
      break;
    }
    if (!item) continue;
    expandedTextBytes += item.expandedBytes;
    metadataCount += 1;
    const [category, severity] = classifyMetadataKey(item.key);
    addFinding(result, options, {
      id: "png-text-metadata",
      category,
      severity,
      title: "PNG text metadata",
      field: item.key,
      sourceControlledField: true,
      value: item.value,
    });
  }
  const exif = chunks.filter((item) => item.type === "eXIf").length;
  if (exif > 0) addFinding(result, options, {
    id: "png-exif-container",
    category: "privacy",
    severity: "review",
    title: "PNG EXIF metadata container",
    count: exif,
  });
  addCoverage(result, "png-text-and-exif-metadata", metadataCount + exif > 0 ? "FOUND" : "NOT_FOUND_BY_THIS_CHECK",
    metadataCount + exif > 0 ? `${metadataCount} text field(s) and ${exif} EXIF container(s) found.` : "No PNG text or EXIF metadata found.");
  const carrier = chunks.some((item) => item.type === "caBX")
    || chunks.some((item) => ["iTXt", "tEXt", "zTXt"].includes(item.type) && /(?:c2pa|content credentials|jumbf)/i.test(item.data.toString("latin1")));
  recordC2paCarrier(result, options, carrier, "PNG caBX or text markers");
}

function jpegSegments(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) throw new Error("JPEG signature is invalid");
  const segments = [];
  let cursor = 2;
  while (cursor + 4 <= buffer.length) {
    if (segments.length >= MAX_CONTAINER_SEGMENTS) throw new Error(`JPEG contains more than ${MAX_CONTAINER_SEGMENTS} metadata segments`);
    while (buffer[cursor] === 0xff) cursor += 1;
    const marker = buffer[cursor];
    cursor += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker >= 0xd0 && marker <= 0xd7) continue;
    if (cursor + 2 > buffer.length) throw new Error("JPEG segment length is missing");
    const length = buffer.readUInt16BE(cursor);
    if (length < 2 || cursor + length > buffer.length) throw new Error("JPEG segment is outside the file");
    segments.push({ marker, data: buffer.subarray(cursor + 2, cursor + length) });
    cursor += length;
  }
  return segments;
}

function scanJpeg(buffer, result, options) {
  let segments;
  try {
    segments = jpegSegments(buffer);
  } catch (error) {
    addCoverage(result, "jpeg-structure", "ERROR", error.message);
    return;
  }
  addCoverage(result, "jpeg-structure", "NOT_FOUND_BY_THIS_CHECK", `Parsed ${segments.length} JPEG metadata segments.`);
  const exif = segments.filter((item) => item.marker === 0xe1 && item.data.subarray(0, 6).toString("ascii") === "Exif\0\0");
  const xmp = segments.filter((item) => item.marker === 0xe1 && /(?:xmpmeta|ns\.adobe\.com\/xap)/i.test(item.data.toString("latin1")));
  const iptc = segments.filter((item) => item.marker === 0xed);
  const comments = segments.filter((item) => item.marker === 0xfe);
  for (const [id, title, count, severity] of [
    ["jpeg-exif", "JPEG EXIF metadata container", exif.length, "review"],
    ["jpeg-xmp", "JPEG XMP metadata packet", xmp.length, "provenance"],
    ["jpeg-iptc", "JPEG IPTC metadata container", iptc.length, "review"],
    ["jpeg-comment", "JPEG comment", comments.length, "review"],
  ]) {
    if (count === 0) continue;
    addFinding(result, options, {
      id,
      category: severity === "provenance" ? "provenance" : "privacy",
      severity,
      title,
      count,
      ...(id === "jpeg-comment" && options.showValues ? { value: comments.slice(0, 3).map((item) => item.data.toString("latin1")).join(" | ") } : {}),
    });
  }
  const total = exif.length + xmp.length + iptc.length + comments.length;
  addCoverage(result, "jpeg-metadata-containers", total > 0 ? "FOUND" : "NOT_FOUND_BY_THIS_CHECK",
    total > 0 ? `${total} metadata container(s) or comment(s) found.` : "No EXIF, XMP, IPTC, or comment segments found.");
  const carrier = segments.some((item) => item.marker === 0xeb && /(?:jumb|c2pa|content credentials)/i.test(item.data.toString("latin1")))
    || xmp.some((item) => /(?:c2pa|content credentials|jumbf)/i.test(item.data.toString("latin1")));
  recordC2paCarrier(result, options, carrier, "JPEG APP11 or XMP markers");
}

function recordC2paCarrier(result, options, found, source, absentStatus = "NOT_FOUND_BY_THIS_CHECK") {
  if (found) addFinding(result, options, {
    id: "c2pa-carrier-hint",
    category: "provenance",
    severity: "provenance",
    title: "Possible C2PA or Content Credentials carrier",
    detail: `${source} indicate provenance data. Presence is not a privacy failure and is not validation.`,
  });
  addCoverage(result, "c2pa-carrier-presence", found ? "FOUND" : absentStatus,
    found ? `Possible carrier found through ${source}.` : absentStatus === "UNKNOWN" ? `No carrier found through partial ${source}; other representations remain uninspected.` : `No carrier found through ${source}.`);
}

let exifToolAvailability;
function externalCommand(name) {
  const override = name === "exiftool" ? process.env.AGORA_EXIFTOOL : process.env.AGORA_C2PATOOL;
  return override || name;
}

function toolAvailable(name) {
  if (name === "exiftool" && exifToolAvailability !== undefined) return exifToolAvailability;
  const command = externalCommand(name);
  const result = spawnSync(command, [name === "exiftool" ? "-ver" : "--version"], {
    encoding: "utf8",
    windowsHide: true,
    timeout: 5000,
    maxBuffer: 1024 * 1024,
  });
  const available = !result.error && result.status === 0;
  if (name === "exiftool") exifToolAvailability = available;
  return available;
}

function scanExifTool(path, result, options) {
  if (!toolAvailable("exiftool")) {
    addCoverage(result, "exiftool-metadata", "UNKNOWN", "ExifTool is not installed; built-in format checks still ran.");
    return;
  }
  const run = spawnSync(externalCommand("exiftool"), ["-j", "-G1", "-n", path], {
    encoding: "utf8",
    windowsHide: true,
    timeout: 30000,
    maxBuffer: MAX_EXTERNAL_OUTPUT,
  });
  if (run.error || run.status !== 0) {
    addCoverage(result, "exiftool-metadata", "ERROR", "ExifTool could not inspect the file.");
    return;
  }
  let records;
  try {
    records = JSON.parse(run.stdout);
  } catch {
    addCoverage(result, "exiftool-metadata", "ERROR", "ExifTool returned invalid JSON.");
    return;
  }
  const record = Array.isArray(records) ? records[0] ?? {} : {};
  let found = 0;
  for (const [field, value] of Object.entries(record)) {
    if (/^(?:SourceFile|File:|System:)/i.test(field)) continue;
    if (!/(?:gps|serial|owner|artist|author|creator|company|manager|email|comment|description|history|ancestor|hostcomputer|software|producer|creatortool|c2pa|credential|jumbf)/i.test(field)) continue;
    const [category, severity] = classifyMetadataKey(field);
    found += 1;
    addFinding(result, options, {
      id: "exiftool-field",
      category,
      severity,
      title: "ExifTool metadata field",
      field,
      sourceControlledField: true,
      value: typeof value === "object" ? JSON.stringify(value) : value,
    });
  }
  addCoverage(result, "exiftool-metadata", found > 0 ? "FOUND" : "NOT_FOUND_BY_THIS_CHECK",
    found > 0 ? `${found} configured metadata field(s) found by ExifTool.` : "ExifTool found no configured privacy or provenance fields.");
}

export function parseC2paInfo(output, status) {
  const text = bounded(output, 2000);
  if (status !== 0) return { status: "ERROR", detail: "c2patool could not complete local verification." };
  if (/no (?:claim|manifest)|manifest.*not found|claim.*not found/i.test(text)) {
    return { status: "NOT_FOUND_BY_THIS_CHECK", detail: "c2patool reported no manifest." };
  }
  if (/(?:validation|signature).*(?:error|failed|invalid)|(?:error|failed|invalid).*(?:validation|signature)/i.test(text)) {
    return { status: "FOUND", detail: "c2patool reported a manifest with validation problems.", invalid: true };
  }
  if (/(?:mismatch|malformed|untrusted|not[_ -]?trusted|expired|revoked|unsupported|failure|claimSignature\.[A-Za-z]*mismatch)/i.test(text)) {
    return { status: "FOUND", detail: "c2patool reported a manifest with validation problems.", invalid: true };
  }
  if (/\b(?:claim|claimSignature|assertion|ingredient|manifest|hardBinding|signingCredential|timeStamp|hashedURI|algorithm|general)(?:\.[A-Za-z][\w-]*)*\.(?:missing|multiple|undeclared|inaccessible|notRedacted|redacted|invalid|mismatch|malformed|untrusted|expired|revoked|unsupported|failure|error)\b/i.test(text)) {
    return { status: "FOUND", detail: "c2patool reported a manifest with validation problems.", invalid: true };
  }
  if (/(?:c2pa|manifest|claim|signature|validation)/i.test(text)) {
    return { status: "FOUND", detail: "c2patool reported local C2PA manifest information.", invalid: false };
  }
  return { status: "UNKNOWN", detail: "c2patool returned no recognizable manifest or validation result." };
}

async function verifyC2pa(path, result, options) {
  if (!options.verifyC2pa) {
    addCoverage(result, "c2pa-verification", "UNKNOWN", "Verification not requested. Use --verify-c2pa for local c2patool inspection.");
    return;
  }
  if (!toolAvailable("c2patool")) {
    addCoverage(result, "c2pa-verification", "UNKNOWN", "c2patool is not installed.");
    return;
  }
  const temporary = await mkdtemp(join(tmpdir(), "agora-c2pa-settings-"));
  const settings = join(temporary, "settings.json");
  try {
    await writeFile(settings, JSON.stringify({ verify: { remote_manifest_fetch: false } }), { encoding: "utf8", flag: "wx" });
    const run = spawnSync(externalCommand("c2patool"), [path, "--info", "--settings", settings], {
      encoding: "utf8",
      windowsHide: true,
      timeout: 30000,
      maxBuffer: MAX_EXTERNAL_OUTPUT,
    });
    if (run.error) {
      addCoverage(result, "c2pa-verification", "ERROR", "c2patool could not start.");
      return;
    }
    const parsed = parseC2paInfo(`${run.stdout}\n${run.stderr}`, run.status);
    if (parsed.status === "FOUND") addFinding(result, options, {
      id: parsed.invalid ? "c2pa-validation-problem" : "c2pa-verified-manifest",
      category: "provenance",
      severity: "provenance",
      title: parsed.invalid ? "C2PA validation problem" : "C2PA manifest information",
      detail: parsed.detail,
    });
    addCoverage(result, "c2pa-verification", parsed.status, parsed.detail);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

async function readOpenFile(handle, size) {
  const buffer = Buffer.alloc(size);
  let offset = 0;
  while (offset < size) {
    const { bytesRead } = await handle.read(buffer, offset, size - offset, offset);
    if (bytesRead === 0) break;
    offset += bytesRead;
  }
  if (offset !== size) throw new Error("File size changed while it was being read");
  return buffer;
}

function sameFileIdentity(left, right) {
  if (Number.isFinite(left.dev) && Number.isFinite(left.ino)
    && Number.isFinite(right.dev) && Number.isFinite(right.ino)
    && (left.dev !== 0 || left.ino !== 0 || right.dev !== 0 || right.ino !== 0)) {
    return left.dev === right.dev && left.ino === right.ino;
  }
  return left.mode === right.mode
    && left.birthtimeMs === right.birthtimeMs
    && left.size === right.size
    && left.mtimeMs === right.mtimeMs;
}

async function scanFile(path, options) {
  const result = createResult(path, options);
  let handle;
  try {
    const preOpenStats = await lstat(path);
    if (preOpenStats.isSymbolicLink()) throw new Error("Symbolic links are not inspected");
    if (!preOpenStats.isFile()) throw new Error("Input is not a regular file");
    handle = await open(path, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0));
    const stats = await handle.stat();
    if (!stats.isFile()) throw new Error("Input is not a regular file");
    if (!sameFileIdentity(preOpenStats, stats)) throw new Error("Input identity changed while it was being opened");
    result.sizeBytes = stats.size;
    if (stats.size > MAX_FILE_BYTES) {
      addCoverage(result, "file-size", "UNKNOWN", `File exceeds the ${MAX_FILE_BYTES} byte audit limit.`);
      finalizeStatus(result);
      return result;
    }
    const buffer = await readOpenFile(handle, stats.size);
    result.sha256Before = sha256(buffer);
    const extension = result.extension;
    if (TEXT_EXTENSIONS.has(extension)) {
      let text;
      try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
      } catch {
        addCoverage(result, "utf8-text-decoding", "ERROR", "Text file is not valid UTF-8.");
      }
      if (text !== undefined) {
        addCoverage(result, "utf8-text-decoding", "NOT_FOUND_BY_THIS_CHECK", "Decoded as UTF-8.");
        scanUnicode(text, result, options);
        if ([".html", ".htm", ".svg"].includes(extension)) scanMarkup(text, extension, result, options);
      }
    } else if (OFFICE_EXTENSIONS.has(extension)) scanOffice(buffer, extension, result, options);
    else if (extension === ".pdf") scanPdf(buffer, result, options);
    else if (extension === ".png") scanPng(buffer, result, options);
    else if ([".jpg", ".jpeg"].includes(extension)) scanJpeg(buffer, result, options);
    else addCoverage(result, "format-support", "UNKNOWN", `Unsupported extension: ${extension || "none"}`);

    if (MEDIA_EXTENSIONS.has(extension)) {
      const temporary = await mkdtemp(join(tmpdir(), "agora-publication-media-"));
      const copy = join(temporary, `artifact${extension}`);
      try {
        await writeFile(copy, buffer, { flag: "wx" });
        scanExifTool(copy, result, options);
        await verifyC2pa(copy, result, options);
      } finally {
        await rm(temporary, { recursive: true, force: true });
      }
    }
    const afterStats = await handle.stat();
    const finalPathStats = await lstat(path);
    const after = afterStats.size <= MAX_FILE_BYTES ? await readOpenFile(handle, afterStats.size) : null;
    result.sha256After = after ? sha256(after) : null;
    result.sourceUnchanged = after !== null
      && stats.size === afterStats.size
      && stats.mtimeMs === afterStats.mtimeMs
      && !finalPathStats.isSymbolicLink()
      && sameFileIdentity(stats, finalPathStats)
      && result.sha256Before === result.sha256After;
    addCoverage(result, "source-integrity", result.sourceUnchanged ? "NOT_FOUND_BY_THIS_CHECK" : "ERROR",
      result.sourceUnchanged ? "Source bytes are unchanged after inspection." : "Source bytes changed during inspection.");
  } catch (error) {
    addCoverage(result, "file-inspection", "ERROR", `Inspection failed: ${error.code || error.message}`);
  } finally {
    await handle?.close().catch(() => {});
  }
  finalizeStatus(result);
  return result;
}

export async function auditPaths(inputPaths, suppliedOptions = {}) {
  const options = {
    json: false,
    showValues: false,
    includePaths: false,
    verifyC2pa: false,
    output: null,
    ...suppliedOptions,
  };
  const collected = await collectFiles(inputPaths, options);
  const files = [];
  for (const path of collected.files) files.push(await scanFile(path, options));
  const statusCounts = Object.fromEntries([...ALLOWED_STATUSES].map((status) => [status, files.filter((file) => file.status === status).length]));
  return {
    schemaVersion: SCHEMA_VERSION,
    scannerVersion: SCANNER_VERSION,
    generatedAtUtc: new Date().toISOString(),
    guarantees: {
      sourceMutation: "Source files are read only and compared by SHA-256 before and after inspection.",
      network: options.verifyC2pa
        ? "c2patool receives settings that disable remote-manifest fetching. Other local tool behavior is outside Agora's control."
        : "No network-capable verifier is invoked by default.",
      interpretation: "Findings are signals, not proof of authorship, safety, cleanliness, or complete provenance.",
    },
    options: {
      showValues: options.showValues,
      includePaths: options.includePaths,
      verifyC2pa: options.verifyC2pa,
    },
    summary: {
      fileCount: files.length,
      statusCounts,
      inputErrorCount: collected.inputErrors.length,
      skippedSymlinkCount: collected.skippedSymlinks.length,
    },
    inputErrors: collected.inputErrors,
    skippedSymlinks: collected.skippedSymlinks,
    files,
  };
}

function humanReport(report) {
  const lines = [
    "Agora publication privacy and provenance audit",
    `Files: ${report.summary.fileCount}`,
    "Source mutation: none requested; byte hashes checked after inspection.",
    "Interpretation: findings are signals, not proof that content is AI-generated, human-written, clean, or safe.",
    "",
  ];
  for (const file of report.files) {
    lines.push(`${file.status}  ${file.path}`);
    lines.push(`  SHA-256: ${file.sha256Before ?? "unavailable"}`);
    for (const finding of file.findings) {
      const field = finding.field ? ` [${finding.field}]` : "";
      const count = finding.count ? ` x${finding.count}` : "";
      lines.push(`  - ${finding.severity}: ${finding.title}${field}${count}`);
      if (finding.detail) lines.push(`    ${finding.detail}`);
      if (finding.value) lines.push(`    value: ${finding.value}`);
    }
    for (const coverage of file.coverage.filter((entry) => ["UNKNOWN", "ERROR"].includes(entry.status))) {
      lines.push(`  - ${coverage.status}: ${coverage.check}: ${coverage.detail}`);
    }
    lines.push("");
  }
  for (const error of report.inputErrors) lines.push(`${error.status}  ${error.path}: ${error.detail}`);
  for (const path of report.skippedSymlinks) lines.push(`UNKNOWN  ${path}: symbolic link skipped`);
  return `${lines.join("\n").trimEnd()}\n`;
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n\n${HELP}`);
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    process.stdout.write(HELP);
    return;
  }
  try {
    if (options.output && options.paths.some((path) => resolve(path) === options.output)) {
      throw new Error("Report output path cannot also be an input file");
    }
    const report = await auditPaths(options.paths, options);
    const output = options.json ? `${JSON.stringify(report, null, 2)}\n` : humanReport(report);
    if (options.output) await writeFile(options.output, output, { encoding: "utf8", flag: "wx" });
    else process.stdout.write(output);
    if (report.inputErrors.length > 0 || report.files.some((file) => file.status === "ERROR")) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`Audit failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await main();
}
