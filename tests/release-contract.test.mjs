import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (path) => JSON.parse(await readFile(join(ROOT, ...path.split("/")), "utf8"));

const [packageJson, current] = await Promise.all([
  readJson("package.json"),
  readJson("evals/releases/current.json"),
]);

test("historical blind contract retains its matching manifest, schemas, and gates", async () => {
  assert.equal(current.schema_version, 1);
  assert.equal(current.skill_version, "1.11.0");
  for (const field of ["blind_manifest", "release_plan", "adjudications_schema", "records_schema"]) {
    await access(join(ROOT, ...current[field].split("/")));
  }
  const [manifest, gates] = await Promise.all([
    readJson(current.blind_manifest),
    readJson(current.release_plan),
  ]);
  assert.equal(manifest.status, "frozen-release");
  assert.equal(manifest.skill_version, current.skill_version);
  assert.equal(gates.skill_version, current.skill_version);
  assert.equal(manifest.cases.length, 5);
  assert.ok(gates.partitions.some((partition) => partition.id === "article-generation"));
  assert.deepEqual(current.required_partitions, ["article-generation"]);
  assert.equal(current.generator_model, "gpt-6-luna");
  assert.equal(current.judge_model, "gpt-6-luna");
  assert.equal(current.generator_reasoning_effort, "max");
  assert.equal(current.judge_reasoning_effort, "max");
});

test("publish paths require checks and the versioned distribution lock", async () => {
  assert.equal(packageJson.scripts["eval:release"], "node scripts/release-evidence-check.mjs");
  assert.equal(packageJson.scripts["release:check"], "npm run check && node scripts/distribution-release-check.mjs");
  assert.equal(packageJson.scripts.prepack, "npm run release:check");
  assert.equal(packageJson.scripts.prepublishOnly, "npm run release:check");
  assert.equal(current.adjudications, `evals/releases/v${current.skill_version}.adjudications.json`);
  assert.equal(current.records, `evals/releases/v${current.skill_version}.records.json`);
  assert.equal(current.evidence, `evals/releases/v${current.skill_version}.evidence.json`);
  const distribution = await readJson(`evals/releases/v${packageJson.version}.distribution.json`);
  assert.equal(distribution.version, packageJson.version);
  assert.equal(distribution.policy, "owner-approved-content-lock-v1");
  assert.equal(distribution.blind_superiority, "not-established");
});
