import { createHash } from "node:crypto";
import { describe, it, expect } from "vitest";
import {
  CONTENT_VERSION,
  isQuestionId,
  isTopicId,
  paperFromQuestionId,
  paperId,
  papers,
  parsePaper,
  questionId,
} from "../content";
import { subjects } from "../syllabus-data";

const corpus = import.meta.glob("../../pyq-md/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/**
 * Guard against content edits that silently move stored IDs. If this fails,
 * bump CONTENT_VERSION in src/content.ts after checking which IDs moved and
 * plan a migration rather than reusing the old version number.
 */
const CORPUS_FINGERPRINT =
  "c25438e231284dbc48cc5c9cbe72349d15c12df68548e7145cede4b795d69b0d";

describe("content identity", () => {
  it("pins the corpus fingerprint to CONTENT_VERSION", () => {
    expect(CONTENT_VERSION).toBe("2026-11-02.1");
    const hash = createHash("sha256");
    const files = Object.keys(corpus).sort();
    expect(files).toHaveLength(7);
    for (const file of files) {
      hash.update(file.replace("../../", ""));
      hash.update(corpus[file]);
    }
    expect(hash.digest("hex")).toBe(CORPUS_FINGERPRINT);
  });

  it("derives stable year-based paper and question IDs", () => {
    expect(paperId(2024)).toBe("jelet-et-p1-2024");
    expect(questionId(2024, 7)).toBe("jelet-et-p1-2024:q7");
    expect(paperFromQuestionId("jelet-et-p1-2019:q78")).toEqual({
      year: 2019,
      number: 78,
    });
    expect(paperFromQuestionId("2019:78")).toBeNull();
    expect(isQuestionId("jelet-et-p1-2024:q0")).toBe(false);
    expect(isQuestionId("jelet-et-p1-2024:q101")).toBe(false);
    expect(isQuestionId("jelet-et-p1-2024:q12")).toBe(true);
  });

  it("gives every present question a unique ID", () => {
    const ids = new Set<string>();
    for (const paper of papers) {
      const raw = corpus[`../../pyq-md/${paper.year}.md`];
      expect(raw, `${paper.year} source present`).toBeTruthy();
      for (const question of parsePaper(raw).questions) {
        const id = questionId(paper.year, question.number);
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
    }
    expect(ids.size).toBeGreaterThan(600);
  });

  it("derives unique, stable syllabus topic IDs", () => {
    const ids = subjects.flatMap((subject) =>
      subject.topics.map((topic) => topic.id),
    );
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(isTopicId(id)).toBe(true);
    expect(subjects[0].id).toBe("jelet-syllabus:mathematics");
    expect(subjects[3].topics[0].id).toBe(
      "jelet-syllabus:electrical-and-electronics:t01",
    );
    expect(isTopicId("jelet-et-p1-2024:q1")).toBe(false);
  });

  it("keeps the 2019 identity conflict visible instead of renumbering", () => {
    expect(papers.find((paper) => paper.year === 2019)?.note).toContain(
      "Year conflict",
    );
  });
});
