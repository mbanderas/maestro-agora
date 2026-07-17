import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INSTALLER = join(ROOT, "scripts", "install.mjs");
const SOURCE_SKILL = join(ROOT, "write-agora-marketing", "SKILL.md");

function run(args) {
  return spawnSync(process.execPath, [INSTALLER, ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

async function withTemp(callback) {
  const root = await mkdtemp(join(tmpdir(), "agora-skill-test-"));
  try {
    await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

async function assertInstalled(path) {
  const [source, installed] = await Promise.all([
    readFile(SOURCE_SKILL, "utf8"),
    readFile(join(path, "SKILL.md"), "utf8"),
  ]);
  assert.equal(installed, source);
  await readFile(join(path, "agents", "openai.yaml"), "utf8");
  await readFile(join(path, "references", "agora-marketing.md"), "utf8");
}

test("universal user install writes the shared and Claude locations", async () => {
  await withTemp(async (home) => {
    const result = run(["--target", "universal", "--home", home]);
    assert.equal(result.status, 0, result.stderr);
    await assertInstalled(join(home, ".agents", "skills", "write-agora-marketing"));
    await assertInstalled(join(home, ".claude", "skills", "write-agora-marketing"));
  });
});

test("native project targets use each host's documented directory", async () => {
  const expected = {
    claude: [".claude", "skills"],
    codex: [".agents", "skills"],
    copilot: [".github", "skills"],
    cursor: [".cursor", "skills"],
    gemini: [".gemini", "skills"],
    windsurf: [".windsurf", "skills"],
  };
  for (const [target, path] of Object.entries(expected)) {
    await withTemp(async (project) => {
      const result = run(["--target", target, "--scope", "project", "--project", project]);
      assert.equal(result.status, 0, `${target}: ${result.stderr}`);
      await assertInstalled(join(project, ...path, "write-agora-marketing"));
    });
  }
});

test("a different existing copy requires --force", async () => {
  await withTemp(async (home) => {
    const args = ["--target", "shared", "--home", home];
    assert.equal(run(args).status, 0);
    const skill = join(home, ".agents", "skills", "write-agora-marketing", "SKILL.md");
    await writeFile(skill, "changed locally\n", "utf8");

    const refused = run(args);
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /differs/);

    const replaced = run([...args, "--force"]);
    assert.equal(replaced.status, 0, replaced.stderr);
    await assertInstalled(join(home, ".agents", "skills", "write-agora-marketing"));
  });
});

test("universal install preflights every destination before writing", async () => {
  await withTemp(async (home) => {
    const conflict = join(home, ".claude", "skills", "write-agora-marketing");
    await mkdir(conflict, { recursive: true });
    await writeFile(join(conflict, "SKILL.md"), "different copy\n", "utf8");

    const result = run(["--target", "universal", "--home", home]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /differs/);
    await assert.rejects(
      readFile(join(home, ".agents", "skills", "write-agora-marketing", "SKILL.md")),
    );
  });
});

test("universal install prepares every copy before committing any", async () => {
  await withTemp(async (home) => {
    await writeFile(join(home, ".claude"), "blocks the native directory\n", "utf8");

    const result = run(["--target", "universal", "--home", home, "--force"]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /no installed copy was changed/);
    await assert.rejects(
      readFile(join(home, ".agents", "skills", "write-agora-marketing", "SKILL.md")),
    );
  });
});

test("dry run reports destinations without writing", async () => {
  await withTemp(async (home) => {
    const result = run(["--", "--target", "universal", "--home", home, "--dry-run"]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /would install/);
    await assert.rejects(readFile(join(home, ".agents", "skills", "write-agora-marketing", "SKILL.md")));
  });
});
