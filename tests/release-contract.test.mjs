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

test("current release contract matches package, frozen manifest, schemas, and gates", async () => {
  assert.equal(current.schema_version, 1);
  assert.equal(current.skill_version, packageJson.version);
  for (const field of ["blind_manifest", "release_plan", "adjudications_schema", "records_schema"]) {
    await access(join(ROOT, ...current[field].split("/")));
  }
  const [manifest, gates] = await Promise.all([
    readJson(current.blind_manifest),
    readJson(current.release_plan),
  ]);
  assert.equal(manifest.status, "frozen-release");
  assert.equal(manifest.skill_version, packageJson.version);
  assert.equal(gates.skill_version, packageJson.version);
  assert.equal(manifest.cases.length, 24);
  assert.ok(gates.partitions.some((partition) => partition.id === "human-writing"));
  assert.deepEqual(current.required_partitions, ["human-writing"]);
  assert.equal(current.generator_model, "gpt-5.6-luna");
  assert.equal(current.judge_model, "gpt-5.6-luna");
  assert.equal(current.generator_reasoning_effort, "max");
  assert.equal(current.judge_reasoning_effort, "max");
});

test("publish paths fail closed through the current evidence verifier", () => {
  assert.equal(packageJson.scripts["eval:release"], "node scripts/release-evidence-check.mjs");
  assert.equal(packageJson.scripts["release:check"], "npm run check && npm run eval:release");
  assert.equal(packageJson.scripts.prepack, "npm run release:check");
  assert.equal(packageJson.scripts.prepublishOnly, "npm run release:check");
  assert.equal(current.adjudications, `evals/releases/v${packageJson.version}.adjudications.json`);
  assert.equal(current.records, `evals/releases/v${packageJson.version}.records.json`);
  assert.equal(current.evidence, `evals/releases/v${packageJson.version}.evidence.json`);
});
