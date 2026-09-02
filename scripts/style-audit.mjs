#!/usr/bin/env node

import { resolve } from "node:path";

import { auditFile, REGISTERS } from "./style-audit-core.mjs";

export function parseArgs(argv) {
  const options = { file: null, register: "plain", json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--json") options.json = true;
    else if (value === "--register") options.register = argv[++index];
    else if (value.startsWith("--register=")) options.register = value.slice("--register=".length);
    else if (value.startsWith("-")) throw new Error(`unknown option: ${value}`);
    else if (options.file) throw new Error("supply exactly one file");
    else options.file = value;
  }
  if (!options.file) throw new Error("missing file");
  if (!REGISTERS.has(options.register)) throw new Error(`unknown register: ${options.register}`);
  return options;
}

export function renderHuman(path, report) {
  const status = report.pass ? "PASS" : "FAIL";
  const lines = [
    `${status} ${path}`,
    `Register: ${report.register}`,
    `Hard failures: ${report.hard_failure_count}`,
    `Review warnings: ${report.warning_count}`,
  ];
  for (const item of report.findings) {
    lines.push(`${item.severity.toUpperCase()} ${item.line}:${item.column} ${item.rule}: ${item.message}`);
  }
  lines.push("This audit does not rewrite text, validate facts, infer authorship, or promise detector evasion.");
  return `${lines.join("\n")}\n`;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const path = resolve(options.file);
  const report = await auditFile(path, { register: options.register });
  process.stdout.write(options.json ? `${JSON.stringify(report, null, 2)}\n` : renderHuman(options.file, report));
  if (!report.pass) process.exitCode = 1;
  return report;
}

if (import.meta.url === new URL(`file://${resolve(process.argv[1]).replaceAll("\\", "/")}`).href) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`agora-style-audit: ${error.message}\n`);
    process.exitCode = 2;
  }
}
