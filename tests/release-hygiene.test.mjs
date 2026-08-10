import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { collectViolations } from "../scripts/release-hygiene.mjs";

async function withTree(files, callback) {
  const root = await mkdtemp(join(tmpdir(), "agora-release-hygiene-"));
  try {
    for (const [file, content] of Object.entries(files)) {
      const path = join(root, ...file.split("/"));
      await mkdir(join(path, ".."), { recursive: true });
      await writeFile(path, content);
    }
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("accepts reviewed public text files", async () => {
  await withTree({
    "README.md": "Public package documentation\n",
    "skills/agora/SKILL.md": "---\nname: agora\ndescription: test\n---\n",
  }, async (root) => {
    const violations = await collectViolations({
      root,
      files: ["README.md", "skills/agora/SKILL.md"],
    });
    assert.deepEqual(violations, []);
  });
});

test("rejects research roots and private artifact file types", async () => {
  await withTree({
    "research/notes.md": "private notes\n",
    "assets/source.pdf": "not a real PDF\n",
  }, async (root) => {
    const violations = await collectViolations({
      root,
      files: ["research/notes.md", "assets/source.pdf"],
    });
    assert.equal(violations.length, 2);
    assert.match(violations[0], /not on the public repository allowlist/);
    assert.match(violations[1], /file type is forbidden/);
  });
});

test("rejects local paths, assigned secrets, and private denylist terms without printing the term", async () => {
  const secretLabel = ["api", "key"].join("_");
  const homePath = ["C:", "Users", "person", "Downloads", "source.txt"].join("\\");
  await withTree({
    "README.md": `${homePath}\n${secretLabel} = \"replace-with-a-real-secret\"\nPrivate Framework Alpha\n`,
  }, async (root) => {
    const violations = await collectViolations({
      root,
      files: ["README.md"],
      privateTerms: ["Private Framework Alpha"],
    });
    assert.equal(violations.length, 3);
    assert.ok(violations.some((finding) => finding.includes("absolute user-home path")));
    assert.ok(violations.some((finding) => finding.includes("generic assigned secret")));
    assert.ok(violations.some((finding) => finding.includes("private denylist entry 1")));
    assert.ok(violations.every((finding) => !finding.includes("Private Framework Alpha")));
  });
});

test("rejects unexpected binary files but permits reviewed image assets", async () => {
  await withTree({
    "assets/unreviewed.bin": Buffer.from([0, 1, 2, 3]),
    "assets/icon.png": Buffer.from([0, 1, 2, 3]),
  }, async (root) => {
    const violations = await collectViolations({
      root,
      files: ["assets/unreviewed.bin", "assets/icon.png"],
    });
    assert.equal(violations.length, 1);
    assert.match(violations[0], /unexpected binary file/);
  });
});
