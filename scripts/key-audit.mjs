#!/usr/bin/env node
// Validates derived answer-key files against the rules in
// docs/decisions/ADR-0003-derived-answer-keys.md and docs/CONTENT-SCHEMA.md.
//
// Run: npm run keys:check
// Exits non-zero on any violation. No dependencies.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "docs", "derived-keys");
const TIERS = new Set([
  "official",
  "derived-verified",
  "derived-provisional",
  "disputed",
]);
const LETTERS = new Set(["A", "B", "C", "D"]);

const problems = [];
const warnings = [];
const stats = { files: 0, entries: 0, byTier: {}, byCategory: {} };

const fail = (file, msg) => problems.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

for (const name of readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .sort()) {
  const raw = readFileSync(join(dir, name), "utf8");
  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (err) {
    fail(name, `invalid JSON (${err.message})`);
    continue;
  }
  stats.files++;

  for (const field of [
    "paper",
    "booklet",
    "date",
    "protocol",
    "decision",
    "entries",
  ]) {
    if (!doc[field]) fail(name, `missing required top-level field "${field}"`);
  }

  const seen = new Set();
  for (const e of doc.entries ?? []) {
    stats.entries++;
    const id = `Q${e.q}`;

    if (!Number.isInteger(e.q) || e.q < 1 || e.q > 100)
      fail(name, `${id} has an out-of-range question number`);
    if (seen.has(e.q)) fail(name, `${id} appears more than once`);
    seen.add(e.q);

    if (!["I", "II"].includes(e.category))
      fail(name, `${id} category must be "I" or "II"`);
    stats.byCategory[e.category] = (stats.byCategory[e.category] ?? 0) + 1;

    if (!TIERS.has(e.tier)) fail(name, `${id} has unknown tier "${e.tier}"`);
    // The hard rule: nothing produced by a solver may claim to be an official key.
    if (e.tier === "official")
      fail(
        name,
        `${id} is tiered "official"; no official key exists for these papers`,
      );
    stats.byTier[e.tier] = (stats.byTier[e.tier] ?? 0) + 1;

    if (!Array.isArray(e.answer)) {
      fail(name, `${id} answer must be an array`);
    } else {
      for (const a of e.answer)
        if (!LETTERS.has(a))
          fail(name, `${id} answer contains invalid option "${a}"`);
      if (new Set(e.answer).size !== e.answer.length)
        fail(name, `${id} answer repeats an option`);
      // Category-I is single answer; more than one mark is scored as wrong by the paper.
      if (e.category === "I" && e.answer.length > 1)
        fail(name, `${id} is Category-I but lists ${e.answer.length} answers`);
      // A disputed item must not carry an answer, or it would silently score.
      if (e.tier === "disputed" && e.answer.length > 0)
        fail(name, `${id} is disputed but still carries an answer`);
      if (e.tier !== "disputed" && e.answer.length === 0)
        fail(name, `${id} is not disputed but has no answer`);
      if (e.category === "II" && e.answer.length === 4)
        warn(
          name,
          `${id} marks all four options correct; confirm this is intended`,
        );
    }

    if (!e.reasoning || e.reasoning.length < 20)
      fail(name, `${id} has no usable reasoning (the Errata rule)`);
    if (!e.verification) fail(name, `${id} has no verification field`);
    if (!Number.isInteger(e.page)) fail(name, `${id} has no source page`);
    if (
      !["none", "read from image", "unreadable", "reconstructed"].includes(
        e.figure,
      )
    ) {
      fail(name, `${id} has an unrecognised figure state "${e.figure}"`);
    }
    if (typeof e.machineChecked !== "boolean")
      fail(name, `${id} must state machineChecked true or false`);
    if (e.confidence === "low" && e.tier !== "disputed") {
      warn(
        name,
        `${id} is low confidence but tiered "${e.tier}"; only "disputed" cannot score`,
      );
    }
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const p of problems) console.error(`error ${p}`);

if (problems.length) {
  console.error(
    `\n${problems.length} problem(s) across ${stats.files} key file(s).`,
  );
  process.exit(1);
}

console.log(
  `Derived-key files valid: ${stats.files} file(s), ${stats.entries} entries ` +
    `(${Object.entries(stats.byTier)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")}).`,
);
