#!/usr/bin/env node
// Structural audit for WBJEEB final answer keys.
//
// These are transcriptions of official board documents, so the audit cannot
// check them "for correctness" - it checks that the transcription is internally
// consistent and complete, which is the only failure mode under our control.
//
//   node scripts/official-key-audit.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "docs/official-keys";
const SERIES = ["seriesA", "seriesB", "seriesC", "seriesD"];
const problems = [];
const seen = [];

for (const file of readdirSync(DIR)
  .filter((f) => f.endsWith(".json"))
  .sort()) {
  const path = join(DIR, file);
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const fail = (m) => problems.push(`${file}: ${m}`);

  if (doc.tier !== "official")
    fail(`tier must be "official", got "${doc.tier}"`);
  for (const key of [
    "documentRef",
    "documentDate",
    "provenance",
    "sourceTable",
  ]) {
    if (!doc[key]) fail(`missing ${key}`);
  }

  const rows = doc.entries ?? [];
  const voided = [];
  if (rows.length !== 100) fail(`expected 100 entries, got ${rows.length}`);

  const qs = rows.map((r) => r.q);
  if (qs.join(",") !== Array.from({ length: 100 }, (_, i) => i + 1).join(",")) {
    fail("q must be exactly 1..100 in order");
  }

  // Every series column must be a permutation of 1..100: a repeated or missing
  // number means a row was dropped or duplicated while transcribing.
  for (const s of SERIES) {
    const col = rows.map((r) => r[s]).sort((a, b) => a - b);
    const want = Array.from({ length: 100 }, (_, i) => i + 1);
    if (col.join(",") !== want.join(","))
      fail(`${s} is not a permutation of 1..100`);
  }

  for (const r of rows) {
    const a = r.answer;
    if (typeof a !== "string" || a.length === 0) {
      fail(`Q${r.q} has no answer`);
      continue;
    }
    // "W" is the board's own marker for a question it voided: no option is
    // correct and every candidate is awarded the marks. It appears in all four
    // years supplied, so it is part of the format, not a transcription error.
    if (a === "W") {
      voided.push(r.q);
      continue;
    }
    if (!/^[A-D]{1,4}$/.test(a)) {
      fail(
        `Q${r.q} answer "${a}" is neither a letter string A-D nor the void marker W`,
      );
      continue;
    }
    if (new Set(a).size !== a.length)
      fail(`Q${r.q} answer "${a}" repeats a letter`);
  }

  // Booklet mapping: when a booklet is held, record which set it is. Set A means
  // the board's master ordering and our booklet ordering coincide, so the key can
  // be handed to a student without translation. Any other set would need the
  // B/C/D permutation applied, which this audit refuses to leave implicit.
  const b = doc.booklet;
  if (b) {
    if (b.set && !/^[A-D]$/.test(b.set))
      fail(`booklet.set "${b.set}" is not A-D`);
    if (!b.sourceFile && b.set) fail("booklet records a set but no sourceFile");
    if (b.set === "A" && b.mapping !== "identity") {
      fail('booklet is Set A so mapping must be "identity"');
    }
    if (!b.set && b.mapping) fail("booklet has a mapping but no set");
    if (!b.determination)
      fail("booklet.set is recorded without evidence (determination)");
  }

  seen.push({
    file,
    year: doc.year,
    ref: doc.documentRef,
    voided,
    set: b?.set ?? "none",
  });
}

if (problems.length) {
  console.error(
    `Official-key audit FAILED with ${problems.length} problem(s):`,
  );
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}

for (const s of seen) {
  const v = s.voided.length ? `  voided: Q${s.voided.join(", Q")}` : "";
  console.log(`ok  ${s.year}  ${s.ref}  set ${s.set}  (${s.file})${v}`);
}
const total = seen.reduce((n, s) => n + s.voided.length, 0);
console.log(`\nOfficial keys valid: ${seen.length} file(s), 100 entries each.`);
console.log(`Board-voided questions: ${total}.`);
