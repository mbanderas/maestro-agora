import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { findArticleTypography } from "../skills/agora/scripts/article-typography-check.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHECKER = join(ROOT, "skills", "agora", "scripts", "article-typography-check.mjs");

test("article typography check identifies exact forbidden characters and positions", () => {
  assert.deepEqual(findArticleTypography("A\u2019B\nC\u2014D"), [
    { line: 1, column: 2, codePoint: "U+2019", name: "right single quote" },
    { line: 2, column: 2, codePoint: "U+2014", name: "em dash" },
  ]);
  assert.deepEqual(findArticleTypography("A's draft.\n"), []);
});

test("CLI reads draft text without rewriting it or reporting an authorship score", () => {
  const bad = spawnSync(process.execPath, [CHECKER], { input: "A\u2019s draft.\n", encoding: "utf8" });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /1:2 U\+2019 right single quote/);
  assert.equal(bad.stdout, "");

  const good = spawnSync(process.execPath, [CHECKER], { input: "A's draft.\n", encoding: "utf8" });
  assert.equal(good.status, 0);
  assert.match(good.stdout, /Article typography check passed/);
  assert.equal(good.stderr, "");
});
