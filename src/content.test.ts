import { describe, it, expect } from "vitest";
import {
  parsePaper,
  parseSyllabus,
  missingNumbers,
  filterPapers,
} from "./content";
import syllabus from "../syllabus.md?raw";
const files = import.meta.glob("../pyq-md/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
describe("paper corpus", () => {
  for (const [file, raw] of Object.entries(files))
    it(`preserves original numbered entries in ${file}`, () => {
      const matches = [
        ...raw.matchAll(/^(?:\*\*(\d+)\.\*\*|(\d+)\.)\s+/gm),
      ].map((m) => Number(m[1] || m[2]));
      const { questions } = parsePaper(raw);
      expect(questions.map((q) => q.number)).toEqual(matches);
      expect(new Set(matches).size).toBe(matches.length);
      expect(questions.every((q) => q.text.length > 0)).toBe(true);
    });
  it("flags 2024 gaps", () =>
    expect(
      missingNumbers(parsePaper(files["../pyq-md/2024.md"]).questions),
    ).toEqual([60, 61, 62]));
  it("flags 2022 gaps", () =>
    expect(
      missingNumbers(parsePaper(files["../pyq-md/2022.md"]).questions),
    ).toEqual([86, 87, 88, 89, 90]));
  it("recognizes all 2025 numbers, without claiming accuracy", () =>
    expect(parsePaper(files["../pyq-md/2025.md"]).questions).toHaveLength(100));
  it("preserves maths and marks missing diagram", () => {
    const { questions } = parsePaper(files["../pyq-md/2025.md"]);
    expect(questions[0].text).toContain("\\(");
    expect(questions.find((q) => q.number === 95)?.warning).toBe(true);
  });
});
describe("syllabus", () => {
  it("extracts 4 subjects and all topic groups", () => {
    const s = parseSyllabus(syllabus);
    expect(s.map((x) => x.topics.length)).toEqual([11, 15, 8, 8]);
    expect(s[0].topics[0].title).toContain("Matrices");
  });
  it("does not expose unreviewed eligibility as syllabus", () => {
    expect(JSON.stringify(parseSyllabus(syllabus))).not.toContain(
      "Eligibility Highlights",
    );
  });
});
describe("library search", () => {
  it("combines case-insensitive search and format", () => {
    expect(filterPapers(" 2024 ", "all").map((p) => p.year)).toEqual([2024]);
    expect(filterPapers("2024", "Historical format")).toEqual([]);
    expect(filterPapers("PAPER I", "all").length).toBe(7);
  });
});
