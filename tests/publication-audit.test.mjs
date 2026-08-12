import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

import { auditPaths, parseC2paInfo } from "../skills/agora/scripts/publication-audit.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(ROOT, "skills", "agora", "scripts", "publication-audit.mjs");
const MISSING_TOOL = join(tmpdir(), "agora-tool-that-does-not-exist");

process.env.AGORA_EXIFTOOL = MISSING_TOOL;
process.env.AGORA_C2PATOOL = MISSING_TOOL;

async function withTemp(callback) {
  const root = await mkdtemp(join(tmpdir(), "agora-publication-audit-"));
  try {
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function storedZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, value] of Object.entries(entries)) {
    const nameBuffer = Buffer.from(name, "utf8");
    const data = Buffer.from(value, "utf8");
    const checksum = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    const localRecord = Buffer.concat([local, nameBuffer, data]);
    locals.push(localRecord);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuffer.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(Buffer.concat([central, nameBuffer]));
    offset += localRecord.length;
  }
  const centralDirectory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(centrals.length, 8);
  end.writeUInt16LE(centrals.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDirectory, end]);
}

function pngChunk(type, data = Buffer.alloc(0)) {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(data.length, 0);
  header.write(type, 4, 4, "ascii");
  const footer = Buffer.alloc(4);
  footer.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 0);
  return Buffer.concat([header, data, footer]);
}

function pngHeader() {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(1, 0);
  data.writeUInt32BE(1, 4);
  data[8] = 8;
  data[9] = 2;
  return pngChunk("IHDR", data);
}

function jpegSegment(marker, data) {
  const header = Buffer.alloc(4);
  header[0] = 0xff;
  header[1] = marker;
  header.writeUInt16BE(data.length + 2, 2);
  return Buffer.concat([header, data]);
}

test("text audit reports configured Unicode without changing source bytes", async () => {
  await withTemp(async (root) => {
    const path = join(root, "draft.md");
    const source = "alpha\u200bbeta 👩\u200d💻\nplain text\n";
    await writeFile(path, source, "utf8");

    const report = await auditPaths([path]);
    const file = report.files[0];
    assert.equal(report.schemaVersion, "agora.publication-audit.v1");
    assert.equal(file.path, "draft.md");
    assert.equal(Object.hasOwn(file, "absolutePath"), false);
    assert.equal(file.sourceUnchanged, true);
    assert.equal(file.sha256Before, file.sha256After);
    assert.equal(await readFile(path, "utf8"), source);

    const zeroWidthSpace = file.findings.find((item) => item.id === "unicode-u-200b");
    const joiner = file.findings.find((item) => item.id === "unicode-u-200d");
    assert.equal(zeroWidthSpace.severity, "review");
    assert.equal(joiner.severity, "info");
    assert.match(joiner.detail, /emoji or script shaping/);
    assert.equal(Object.hasOwn(joiner, "value"), false);
  });
});

test("markup values and absolute paths stay redacted unless requested", async () => {
  await withTemp(async (root) => {
    const path = join(root, "page.html");
    await writeFile(path, '<meta name="author" content="alice@example.com"><!-- private production note -->', "utf8");

    const hidden = (await auditPaths([path])).files[0];
    const author = hidden.findings.find((item) => item.id === "markup-meta-field");
    assert.equal(author.value, "[redacted]");
    assert.equal(author.field, "[redacted]");
    assert.equal(hidden.path, "page.html");
    assert.equal(Object.hasOwn(hidden, "absolutePath"), false);

    const revealed = (await auditPaths([path], { showValues: true, includePaths: true })).files[0];
    assert.equal(revealed.absolutePath, resolve(path));
    assert.equal(revealed.findings.find((item) => item.field === "author").value, "alice@example.com");
    assert.match(revealed.findings.find((item) => item.id === "markup-comments").value, /production note/);
  });
});

test("DOCX audit finds properties, comments, tracked changes, and custom XML", async () => {
  await withTemp(async (root) => {
    const path = join(root, "review.docx");
    await writeFile(path, storedZip({
      "docProps/core.xml": '<cp:coreProperties><dc:creator>Alice</dc:creator><cp:lastModifiedBy>Bob</cp:lastModifiedBy><dcterms:created>2026-08-12</dcterms:created></cp:coreProperties>',
      "docProps/app.xml": '<Properties><Application>Word</Application><Company>Example Corp</Company></Properties>',
      "word/document.xml": '<w:document><w:body><w:ins><w:r><w:t>new</w:t></w:r></w:ins><w:del><w:r><w:delText>old</w:delText></w:r></w:del></w:body></w:document>',
      "word/header1.xml": '<x:hdr><x:del><x:r><x:delText>old header</x:delText></x:r></x:del></x:hdr>',
      "word/comments.xml": '<w:comments><w:comment w:author="Alice">private note</w:comment></w:comments>',
      "customXml/item1.xml": "<private>record</private>",
      "word/media/image1.png": "not-a-real-image",
    }));

    const file = (await auditPaths([path])).files[0];
    const ids = new Set(file.findings.map((item) => item.id));
    assert.ok(ids.has("office-property"));
    assert.ok(ids.has("docx-comments"));
    assert.equal(file.findings.find((item) => item.id === "docx-tracked-changes").count, 3);
    assert.ok(ids.has("office-custom-xml"));
    assert.equal(file.coverage.find((item) => item.check === "office-embedded-media-metadata").status, "UNKNOWN");
    assert.equal(file.sourceUnchanged, true);
  });
});

test("PPTX audit finds speaker notes, comments, authors, and hidden slides", async () => {
  await withTemp(async (root) => {
    const path = join(root, "deck.pptx");
    await writeFile(path, storedZip({
      "docProps/core.xml": '<cp:coreProperties><dc:creator>Alice</dc:creator></cp:coreProperties>',
      "ppt/slides/slide1.xml": '<x:sld show="false"><x:cSld/></x:sld>',
      "ppt/notesSlides/notesSlide1.xml": '<p:notes><a:t>Do not publish this note</a:t></p:notes>',
      "ppt/comments/comment1.xml": '<p:cm text="private"/>',
      "ppt/commentAuthors.xml": '<p:cmAuthor name="Alice"/>',
    }));

    const file = (await auditPaths([path])).files[0];
    const ids = new Set(file.findings.map((item) => item.id));
    assert.ok(ids.has("pptx-speaker-notes"));
    assert.ok(ids.has("pptx-comments"));
    assert.ok(ids.has("pptx-hidden-slides"));
    assert.equal(file.sourceUnchanged, true);
  });
});

test("PDF and image audits report metadata and unverified provenance without external tools", async () => {
  await withTemp(async (root) => {
    const pdf = join(root, "document.pdf");
    const png = join(root, "image.png");
    const jpeg = join(root, "photo.jpg");
    await writeFile(pdf, "%PDF-1.4\n1 0 obj << /Author (Alice) /Creator (Example Tool) >> endobj\nC2PA JUMBF\n%%EOF", "latin1");
    await writeFile(png, Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      pngHeader(),
      pngChunk("tEXt", Buffer.from("Author\0Alice", "latin1")),
      pngChunk("caBX", Buffer.from("manifest")),
      pngChunk("IEND"),
    ]));
    await writeFile(jpeg, Buffer.concat([
      Buffer.from([0xff, 0xd8]),
      jpegSegment(0xe1, Buffer.from("Exif\0\0payload", "latin1")),
      jpegSegment(0xeb, Buffer.from("jumb c2pa", "latin1")),
      jpegSegment(0xfe, Buffer.from("private comment", "latin1")),
      Buffer.from([0xff, 0xd9]),
    ]));

    const report = await auditPaths([pdf, png, jpeg]);
    for (const file of report.files) {
      assert.equal(file.sourceUnchanged, true);
      assert.equal(file.coverage.find((item) => item.check === "exiftool-metadata").status, "UNKNOWN");
      assert.equal(file.coverage.find((item) => item.check === "c2pa-verification").status, "UNKNOWN");
      assert.ok(file.findings.some((item) => item.id === "c2pa-carrier-hint"));
    }
    assert.ok(report.files.find((item) => item.extension === ".pdf").findings.some((item) => item.id === "pdf-document-info"));
    assert.ok(report.files.find((item) => item.extension === ".png").findings.some((item) => item.id === "png-text-metadata"));
    assert.ok(report.files.find((item) => item.extension === ".jpg").findings.some((item) => item.id === "jpeg-comment"));
  });
});

test("unsupported formats remain UNKNOWN instead of passing clean", async () => {
  await withTemp(async (root) => {
    const path = join(root, "artifact.bin");
    await writeFile(path, Buffer.from([1, 2, 3, 4]));
    const file = (await auditPaths([path])).files[0];
    assert.equal(file.status, "UNKNOWN");
    assert.equal(file.coverage.find((item) => item.check === "format-support").status, "UNKNOWN");
    assert.equal(file.sourceUnchanged, true);
  });
});

test("partial PDF parsing remains UNKNOWN when raw markers are absent", async () => {
  await withTemp(async (root) => {
    const path = join(root, "compressed.pdf");
    await writeFile(path, "%PDF-1.7\n1 0 obj << /Filter /FlateDecode >> stream\nopaque\nendstream\n%%EOF", "latin1");
    const file = (await auditPaths([path])).files[0];
    assert.equal(file.status, "UNKNOWN");
    assert.equal(file.coverage.find((item) => item.check === "pdf-document-info").status, "UNKNOWN");
    assert.equal(file.coverage.find((item) => item.check === "pdf-xmp").status, "UNKNOWN");
    assert.equal(file.coverage.find((item) => item.check === "c2pa-carrier-presence").status, "UNKNOWN");
  });
});

test("source-controlled labels cannot inject terminal controls or forged lines", async () => {
  await withTemp(async (root) => {
    const path = join(root, "unsafe.html");
    const key = "Author\u001b[31m\u202eFORGED";
    await writeFile(path, `<meta name="${key}" content="Alice">`, "utf8");
    const file = (await auditPaths([path])).files[0];
    const field = file.findings.find((item) => item.id === "markup-meta-field").field;
    assert.equal(field, "[redacted]");
    const revealed = (await auditPaths([path], { showValues: true })).files[0]
      .findings.find((item) => item.id === "markup-meta-field").field;
    assert.doesNotMatch(revealed, /[\u001b\u202e\r\n]/);
    assert.match(revealed, /<U\+202E>/);

    const run = spawnSync(process.execPath, [CLI, path], {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, AGORA_EXIFTOOL: MISSING_TOOL, AGORA_C2PATOOL: MISSING_TOOL },
    });
    assert.equal(run.status, 0, run.stderr);
    assert.doesNotMatch(run.stdout, /[\u001b\u202e]/);
  });
});

test("container and CRC limits fail closed", async () => {
  await withTemp(async (root) => {
    const noisyPng = join(root, "many.png");
    const chunks = [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), pngHeader()];
    for (let index = 0; index < 10001; index += 1) chunks.push(pngChunk("tEXt", Buffer.from(`k${index}\0v`)));
    chunks.push(pngChunk("IEND"));
    await writeFile(noisyPng, Buffer.concat(chunks));
    const png = (await auditPaths([noisyPng])).files[0];
    assert.equal(png.status, "ERROR");
    assert.match(png.coverage.find((item) => item.check === "png-structure").detail, /more than 10000 chunks/);

    const corruptPng = join(root, "corrupt.png");
    const pngBytes = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      pngHeader(),
      pngChunk("IEND"),
    ]);
    pngBytes[pngBytes.length - 1] ^= 0xff;
    await writeFile(corruptPng, pngBytes);
    const corrupt = (await auditPaths([corruptPng])).files[0];
    assert.equal(corrupt.status, "ERROR");
    assert.match(corrupt.coverage.find((item) => item.check === "png-structure").detail, /CRC mismatch/);

    const corruptDocx = join(root, "corrupt.docx");
    const bytes = storedZip({ "word/document.xml": "<w:document/>" });
    const payload = bytes.indexOf(Buffer.from("<w:document/>"));
    bytes[payload] ^= 0xff;
    await writeFile(corruptDocx, bytes);
    const docx = (await auditPaths([corruptDocx])).files[0];
    assert.equal(docx.status, "ERROR");
    assert.match(docx.coverage.find((item) => item.check === "file-inspection").detail, /CRC mismatch/);
  });
});

test("PNG compressed text has one aggregate expansion budget", async () => {
  await withTemp(async (root) => {
    const path = join(root, "compressed.png");
    const compressed = deflateSync(Buffer.alloc(17 * 1024 * 1024, 0x61));
    const textChunk = (key) => pngChunk("zTXt", Buffer.concat([
      Buffer.from(`${key}\0`, "latin1"),
      Buffer.from([0]),
      compressed,
    ]));
    await writeFile(path, Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      pngHeader(),
      textChunk("Author"),
      textChunk("Comment"),
      pngChunk("IEND"),
    ]));
    const file = (await auditPaths([path])).files[0];
    assert.equal(file.status, "ERROR");
    assert.match(file.coverage.find((item) => item.check === "png-text-metadata").detail, /limit|output length/i);
  });
});

test("CLI writes only a new report and refuses to overwrite it", async () => {
  await withTemp(async (root) => {
    const source = join(root, "draft.txt");
    const output = join(root, "audit.json");
    await writeFile(source, "plain text", "utf8");
    const before = await readFile(source);

    const first = spawnSync(process.execPath, [CLI, source, "--json", "--output", output], {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, AGORA_EXIFTOOL: MISSING_TOOL, AGORA_C2PATOOL: MISSING_TOOL },
    });
    assert.equal(first.status, 0, first.stderr);
    const report = JSON.parse(await readFile(output, "utf8"));
    assert.equal(report.files[0].sourceUnchanged, true);

    const second = spawnSync(process.execPath, [CLI, source, "--json", "--output", output], {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, AGORA_EXIFTOOL: MISSING_TOOL, AGORA_C2PATOOL: MISSING_TOOL },
    });
    assert.equal(second.status, 1);
    assert.match(second.stderr, /EEXIST|already exists|file already exists/i);
    assert.deepEqual(await readFile(source), before);
  });
});

test("C2PA result parsing preserves absence and validation problems", () => {
  assert.deepEqual(parseC2paInfo("No manifest found", 0), {
    status: "NOT_FOUND_BY_THIS_CHECK",
    detail: "c2patool reported no manifest.",
  });
  assert.deepEqual(parseC2paInfo("Validation error: signature invalid", 0), {
    status: "FOUND",
    detail: "c2patool reported a manifest with validation problems.",
    invalid: true,
  });
  assert.deepEqual(parseC2paInfo("manifest validated", 0), {
    status: "FOUND",
    detail: "c2patool reported local C2PA manifest information.",
    invalid: false,
  });
  assert.equal(parseC2paInfo("claimSignature.mismatch", 0).invalid, true);
  assert.equal(parseC2paInfo("Manifest validation status: assertion.missing", 0).invalid, true);
  assert.equal(parseC2paInfo("claim.multiple", 0).invalid, true);
  assert.equal(parseC2paInfo("assertion.notRedacted", 0).invalid, true);
  assert.equal(parseC2paInfo("Manifest validation status: claim.required.missing", 0).invalid, true);
  assert.equal(parseC2paInfo("Manifest validation status: assertion.action.redacted", 0).invalid, true);
  for (const code of [
    "claimSignature.missing",
    "timeStamp.mismatch",
    "hashedURI.mismatch",
    "algorithm.unsupported",
    "general.error",
  ]) assert.equal(parseC2paInfo(`Manifest validation status: ${code}`, 0).invalid, true, code);
  assert.equal(parseC2paInfo("No manifest found", 1).status, "ERROR");
  assert.equal(parseC2paInfo("", 0).status, "UNKNOWN");
  assert.equal(parseC2paInfo("unexpected success", 0).status, "UNKNOWN");
});
