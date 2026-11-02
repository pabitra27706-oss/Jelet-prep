import { describe, it, expect } from "vitest";
import {
  answerFor,
  formatAnswer,
  keyFor,
  paperKeys,
  showableYears,
  VOID,
} from "./keys";
import { papers } from "./content";

const bundled = papers.map((p) => p.year);

describe("official answer keys", () => {
  it("carries a key for every year supplied", () => {
    expect([...paperKeys.keys()].sort()).toEqual([2023, 2024, 2025, 2026]);
  });

  for (const year of [2023, 2024, 2025, 2026])
    it(`has 100 complete answers for ${year}`, () => {
      const key = keyFor(year);
      expect(key).not.toBeNull();
      expect(key!.entries.map((e) => e.q)).toEqual(
        Array.from({ length: 100 }, (_, i) => i + 1),
      );
      expect(key!.entries.every((e) => e.answer.length > 0)).toBe(true);
      expect(key!.tier).toBe("official");
      expect(key!.documentRef).toMatch(/\//);
    });

  it("marks board-voided questions instead of scoring them", () => {
    expect(keyFor(2023)!.voided).toEqual([6, 46, 88, 94]);
    expect(keyFor(2024)!.voided).toEqual([49, 58]);
    expect(keyFor(2025)!.voided).toEqual([41, 79, 84]);
    expect(keyFor(2026)!.voided).toEqual([79]);
    const voided = answerFor(2024, 49)!;
    expect(voided.voided).toBe(true);
    expect(voided.answer).toBe(VOID);
    expect(voided.options).toEqual([]);
    expect(formatAnswer(voided)).toBe("Void");
  });

  it("splits multi-answer questions and keeps option order", () => {
    // 2023 Q40 is a Category-II item keyed A, C, D.
    const q40 = answerFor(2023, 40)!;
    expect(q40.options).toEqual(["A", "C", "D"]);
    expect(formatAnswer(q40)).toBe("(A, C, D)");
    expect(formatAnswer(answerFor(2023, 1)!)).toBe("(D)");
  });

  it("refuses to answer for years it has no key for", () => {
    for (const year of [2017, 2018, 2019, 2021, 2022])
      expect(answerFor(year, 1)).toBeNull();
  });

  it("refuses out-of-range question numbers", () => {
    expect(answerFor(2024, 0)).toBeNull();
    expect(answerFor(2024, 101)).toBeNull();
  });

  it("only exposes keys whose numbering is mapped to a bundled booklet", () => {
    // Every supplied booklet was determined to be set A, so numbering matches.
    for (const year of [2023, 2024, 2025])
      expect(keyFor(year)!.mappedToBooklet).toBe(true);
    // 2026 has a key but no booklet was supplied to match it against.
    expect(keyFor(2026)!.mappedToBooklet).toBe(false);
    expect(answerFor(2026, 1)).toBeNull();
  });

  it("shows only years that have both a bundled paper and a mapped key", () => {
    const shown = showableYears(bundled);
    // 2023 and 2026 keys exist but their papers are not bundled.
    expect(shown).not.toContain(2023);
    expect(shown).not.toContain(2026);
    for (const year of shown) expect(bundled).toContain(year);
  });

  it("matches the audited JSON, so the UI cannot launder a bad transcription", () => {
    // Spot-check against values confirmed by solving the booklet pages.
    expect(answerFor(2023, 1)!.answer).toBe("D"); // K = 4
    expect(answerFor(2023, 2)!.answer).toBe("D"); // A^99
    expect(answerFor(2023, 3)!.answer).toBe("C"); // a = -6
    expect(answerFor(2025, 7)!.answer).toBe("D"); // A = -2
    expect(answerFor(2025, 8)!.answer).toBe("D"); // f(x)+f(1-x) = 1
    expect(answerFor(2025, 9)!.answer).toBe("C"); // f(x)g(x) + C1
    expect(answerFor(2024, 2)!.answer).toBe("C"); // rank = 2
    expect(answerFor(2024, 71)!.answer).toBe("C"); // atoms in 52 g He
  });
});
