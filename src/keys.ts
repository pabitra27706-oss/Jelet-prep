// Official answer keys, wired into the app.
//
// Source of truth: docs/official-keys/<year>-paper1.json, transcriptions of
// WBJEEB's final answer-key notices. Validate them with `npm run keys:official`
// before shipping; this module deliberately does no validation of its own, so a
// bad transcription cannot be laundered into "verified" by the UI.
//
// Only years whose booklet was supplied *and* whose question paper is bundled can
// actually be shown. A key with no paper behind it is data, not content.

import key2023 from "../docs/official-keys/2023-paper1.json";
import key2024 from "../docs/official-keys/2024-paper1.json";
import key2025 from "../docs/official-keys/2025-paper1.json";
import key2026 from "../docs/official-keys/2026-paper1.json";

/** A question the board itself withdrew: no option is correct, everyone scores. */
export const VOID = "W";

export interface KeyEntry {
  q: number;
  answer: string;
  /** True when the board voided the question (`answer === VOID`). */
  voided: boolean;
  /** Option letters split for display, e.g. "ABD" -> ["A","B","D"]. */
  options: string[];
}

export interface PaperKey {
  year: number;
  tier: "official";
  documentRef: string;
  documentDate: string;
  provenance: string;
  hostedBy: string;
  sourceTable: string;
  /** Booklet set, or null when no booklet was supplied to match against. */
  set: "A" | "B" | "C" | "D" | null;
  /** Set A means booklet question n is board question n. */
  mappedToBooklet: boolean;
  entries: KeyEntry[];
  voided: number[];
}

interface RawEntry {
  q: number;
  answer: string;
  seriesA: number;
  seriesB: number;
  seriesC: number;
  seriesD: number;
}

interface RawKey {
  year: number;
  documentRef: string;
  documentDate: string;
  provenance: string;
  hostedBy: string;
  sourceTable: string;
  entries: RawEntry[];
  booklet?: {
    set: string | null;
    mapping: string | null;
    sourceFile: string | null;
    bookletNumber: string | null;
    determination: string;
  };
}

function toPaperKey(raw: RawKey): PaperKey {
  const set = (raw.booklet?.set ?? null) as PaperKey["set"];
  const entries: KeyEntry[] = raw.entries.map((e) => ({
    q: e.q,
    answer: e.answer,
    voided: e.answer === VOID,
    options: e.answer === VOID ? [] : [...e.answer],
  }));
  return {
    year: raw.year,
    tier: "official",
    documentRef: raw.documentRef,
    documentDate: raw.documentDate,
    provenance: raw.provenance,
    hostedBy: raw.hostedBy,
    sourceTable: raw.sourceTable,
    set,
    mappedToBooklet: set === "A" && raw.booklet?.mapping === "identity",
    entries,
    voided: entries.filter((e) => e.voided).map((e) => e.q),
  };
}

const raw = [key2023, key2024, key2025, key2026] as unknown as RawKey[];

export const paperKeys = new Map<number, PaperKey>(
  raw.map((r) => [r.year, toPaperKey(r)]),
);

/** The key for a paper, or null when none was obtained. */
export function keyFor(year: number): PaperKey | null {
  return paperKeys.get(year) ?? null;
}

/**
 * The answer for one question.
 *
 * Returns null when there is no key for that paper, when the question number is
 * outside the key, or — importantly — when the key exists but has not been mapped
 * to the bundle's booklet numbering. A Set B/C/D key needs a permutation applied
 * and this layer refuses to guess one.
 */
export function answerFor(year: number, question: number): KeyEntry | null {
  const key = keyFor(year);
  if (!key || !key.mappedToBooklet) return null;
  return key.entries.find((e) => e.q === question) ?? null;
}

/** Human-readable answer, e.g. "(C)" or "(A, C)"; "Void" for withdrawn items. */
export function formatAnswer(entry: KeyEntry): string {
  if (entry.voided) return "Void";
  return `(${entry.options.join(", ")})`;
}

/** Papers that have a displayable key, i.e. a key *and* a bundled paper. */
export function showableYears(bundledYears: number[]): number[] {
  return bundledYears.filter((y) => keyFor(y)?.mappedToBooklet === true);
}
