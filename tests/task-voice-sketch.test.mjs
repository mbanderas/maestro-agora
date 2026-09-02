import assert from "node:assert/strict";
import test from "node:test";

import {
  TASK_VOICE_SKETCH,
  buildTaskSampleOverlapIndex,
  buildTaskVoiceSketch,
  checkTaskSampleOverlap,
} from "../scripts/task-voice-sketch.mjs";

test("no samples produce a plain professional fallback", () => {
  const sketch = buildTaskVoiceSketch([]);
  assert.equal(sketch.kind, TASK_VOICE_SKETCH);
  assert.equal(sketch.certified, false);
  assert.equal(sketch.persistence, "task-only");
  assert.equal(sketch.confidence, "fallback");
  assert.match(sketch.observations[0], /plain professional writing/);
});

test("one thin sample produces cautious local observations without storing prose", () => {
  const source = "I write short notes. I use contractions when they fit. I end with the request.";
  const sketch = buildTaskVoiceSketch([{ id: "thin", genre: "email", text: source }], { genre: "email" });
  assert.match(sketch.confidence, /^low:/);
  assert.equal(sketch.certified, false);
  assert.equal(sketch.stores_source_text, false);
  assert.equal(JSON.stringify(sketch).includes(source), false);
  assert.match(sketch.limitations.join("\n"), /One or two samples/);
});

test("three to ten same-genre samples produce a fuller task-local sketch", () => {
  const samples = [
    { id: "one", genre: "email", text: "I checked the draft. Two figures need correction. Please send the source." },
    { id: "two", genre: "email", text: "The file opens. The table is missing. Can you attach it?" },
    { id: "three", genre: "email", text: "I reviewed the notes. They answer the first question. The second still needs a date." },
    { id: "post", genre: "article", text: "A long unrelated article sample should not set the email sketch." },
  ];
  const sketch = buildTaskVoiceSketch(samples, { genre: "email" });
  assert.equal(sketch.sample_count, 3);
  assert.equal(sketch.supplied_sample_count, 4);
  assert.equal(sketch.same_genre_samples, true);
  assert.match(sketch.confidence, /^task-local:/);
  assert.equal(sketch.certified, false);
});

test("task samples can never be certified or accepted above ten", () => {
  const samples = Array.from({ length: 11 }, (_, index) => `Sample ${index + 1}.`);
  assert.throws(() => buildTaskVoiceSketch(samples), /at most 10 samples/);
});

test("phrase overlap catches copied runs without making an authorship claim", () => {
  const sample = "Copper rain crossed the silent station while seven clocks counted backward through the night.";
  const index = buildTaskSampleOverlapIndex([{ id: "sample", text: sample }]);
  const hits = checkTaskSampleOverlap("The draft says copper rain crossed the silent station while seven clocks counted backward.", index);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].source, "sample");
  assert.ok(hits[0].phrase.split(" ").length >= 8);
});
