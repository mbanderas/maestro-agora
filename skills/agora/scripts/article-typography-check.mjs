#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const names = new Map([
  [0x2014, "em dash"],
  [0x2018, "left single quote"],
  [0x2019, "right single quote"],
  [0x201c, "left double quote"],
  [0x201d, "right double quote"],
]);

export function findArticleTypography(text) {
  const findings = [];
  let line = 1;
  let column = 1;
  for (const character of text) {
    const codePoint = character.codePointAt(0);
    if (names.has(codePoint)) {
      findings.push({ line, column, codePoint: `U+${codePoint.toString(16).toUpperCase()}`, name: names.get(codePoint) });
    }
    if (character === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return findings;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.length > 3) {
    process.stderr.write("Usage: node article-typography-check.mjs [draft.txt]\n");
    process.exitCode = 2;
  } else {
    try {
      const text = process.argv[2]
        ? await readFile(process.argv[2], "utf8")
        : await (async () => {
          const chunks = [];
          for await (const chunk of process.stdin) chunks.push(chunk);
          return Buffer.concat(chunks).toString("utf8");
        })();
      const findings = findArticleTypography(text);
      if (findings.length) {
        for (const item of findings) {
          process.stderr.write(`${item.line}:${item.column} ${item.codePoint} ${item.name}\n`);
        }
        process.exitCode = 1;
      } else {
        process.stdout.write("Article typography check passed.\n");
      }
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 2;
    }
  }
}
