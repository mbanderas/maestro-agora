import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { auditText } from "../scripts/style-audit-core.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("hard rules fail while review triggers remain warnings", () => {
  const long = "The team reviews the file and checks the source while the editor preserves every condition because the legal wording must remain exact and the reader needs the full relationship in one sentence.";
  const report = auditText(`This robust framework uses smart checks.\n\n${long}`);
  assert.equal(report.pass, false);
  assert.ok(report.findings.some((item) => item.rule === "banned-vocabulary:robust" && item.severity === "hard"));
  assert.ok(report.findings.some((item) => item.rule === "banned-vocabulary:framework" && item.severity === "hard") === false);
  assert.ok(report.findings.some((item) => item.rule === "control-room:framework" && item.severity === "warning"));
  assert.ok(report.findings.some((item) => item.rule === "sentence-over-28-words" && item.severity === "warning"));
  assert.ok(report.findings.some((item) => item.rule === "three-or-more-joined-clauses" && item.severity === "warning"));
  assert.equal(report.limits.authorship, "not assessed");
  assert.equal(report.limits.rewriting, "not performed");
});

test("exact text contexts protect immutable quotations and code", () => {
  const report = auditText([
    "> " + String.fromCodePoint(0x201c) + "A robust framework" + String.fromCodePoint(0x201d),
    "",
    "```text",
    "In the realm of exact source text",
    "```",
    "",
    "The product closes the account.",
  ].join("\n"));
  assert.equal(report.pass, true);
  assert.equal(report.hard_failure_count, 0);
});

test("register handling preserves exact technical and legal language", () => {
  const technical = auditText("The verification route returns HTTP 409 when the lock is held.", { register: "technical" });
  assert.equal(technical.findings.some((item) => item.rule.startsWith("control-room:")), false);
  const legal = auditText("The claim shall remain subject to the foregoing terms.", { register: "legal" });
  assert.equal(legal.findings.some((item) => item.rule === "legalistic-leakage"), false);
  assert.equal(legal.pass, true);
});

test("plain register reports control words and added pattern families", () => {
  const report = auditText([
    "The claim stays inside the operational scope.",
    "The result? Teams act.",
    "This is not just a report. It is a framework.",
    "The tool provides the ability to export files.",
    "With respect to access, users sign in.",
    "This demonstrates that teams act.",
  ].join("\n"));
  for (const rule of ["control-room:claim", "control-room:operational", "control-room:scope", "question-fragment-theater", "corporate-helper", "legalistic-leakage", "empty-analytical-ending"]) {
    assert.ok(report.findings.some((item) => item.rule === rule), rule);
  }
  assert.ok(report.findings.some((item) => item.rule.startsWith("false-reframe:")));
});

test("CLI emits JSON and human reports without rewriting", async () => {
  const root = await mkdtemp(join(tmpdir(), "agora-style-audit-"));
  try {
    const path = join(root, "draft.txt");
    await writeFile(path, "A robust product.\n", "utf8");
    const jsonRun = spawnSync(process.execPath, [join(ROOT, "scripts", "style-audit.mjs"), path, "--json"], { encoding: "utf8" });
    assert.equal(jsonRun.status, 1);
    const report = JSON.parse(jsonRun.stdout);
    assert.equal(report.pass, false);
    assert.equal(report.limits.detector_evasion, "not promised");

    const humanRun = spawnSync(process.execPath, [join(ROOT, "scripts", "style-audit.mjs"), path], { encoding: "utf8" });
    assert.equal(humanRun.status, 1);
    assert.match(humanRun.stdout, /^FAIL /);
    assert.match(humanRun.stdout, /does not rewrite text, validate facts, infer authorship, or promise detector evasion/);
    assert.equal(await import("node:fs/promises").then(({ readFile }) => readFile(path, "utf8")), "A robust product.\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
