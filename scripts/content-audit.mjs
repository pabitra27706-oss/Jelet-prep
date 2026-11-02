#!/usr/bin/env node
/**
 * Phase 0-A content audit.
 *
 * Reads the preserved Markdown corpus and produces a machine-generated inventory
 * (docs/audits/content-audit.json + .md). It is deliberately independent of the
 * runtime parser in src/content.ts: the unit test
 * src/audit/audit.test.ts compares both, so a parser change cannot silently
 * change reported coverage.
 *
 * Run: npm run audit:content
 *
 * Limits: this is a structural/textual audit of the repository transcriptions.
 * It does not compare against the official PDFs, and it cannot verify that a
 * question's wording is correct.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

export const PAPER_META = {
  2017: { era: "Historical format", stream: "Engineering & Technology" },
  2018: { era: "Historical format", stream: "Engineering & Technology" },
  2019: { era: "Historical format", stream: "Engineering & Technology" },
  2021: { era: "Historical format", stream: "Engineering & Technology" },
  2022: { era: "Recent format", stream: "Engineering & Technology" },
  2024: { era: "Recent format", stream: "Engineering & Technology" },
  2025: { era: "Recent format", stream: "Engineering & Technology" },
};

const IMAGE_PLACEHOLDER =
  /\[(?:diagram|figure|equation|image)[^\]]*\]|not reproduced|not provided|as image|shown in (?:the )?figure|\[image\]/i;
const MISSING_NOTICE = /missing|omitted|cannot be (?:reproduced|shown)/i;

export function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

/** Parse a single paper transcription into auditable question records. */
export function auditPaper(raw, year) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  const questions = [];
  let section = "";
  let current = null;
  const declaredRanges = [];

  const pushCurrent = () => {
    if (current) questions.push(current);
    current = null;
  };

  for (const line of lines) {
    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      pushCurrent();
      section = heading[2].trim();
      sections.push({ level: heading[1].length, title: section });
      const range = /\(Q\s*(\d+)\s*[–-]\s*(\d+)\)|\(Q\s*(\d+)\)/.exec(section);
      if (range) {
        declaredRanges.push({
          title: section,
          from: Number(range[1] ?? range[3]),
          to: Number(range[2] ?? range[3]),
        });
      }
      continue;
    }
    const match = /^(?:\*\*(\d+)\.\*\*|(\d+)\.)\s+(.*)$/.exec(line);
    if (match) {
      pushCurrent();
      current = {
        number: Number(match[1] ?? match[2]),
        section,
        text: match[3],
      };
    } else if (current) {
      current.text += "\n" + line;
    }
  }
  pushCurrent();

  const seen = new Map();
  const records = questions.map((question) => {
    const text = question.text.trim();
    const optionLetters = detectOptions(text);
    const mathOpen = count(text, "\\(");
    const mathClose = count(text, "\\)");
    const displayOpen = count(text, "\\[");
    const displayClose = count(text, "\\]");
    const record = {
      number: question.number,
      section: question.section,
      chars: text.length,
      optionLetters,
      optionCount: optionLetters.length,
      hasMath: mathOpen + displayOpen > 0,
      balancedMath: mathOpen === mathClose && displayOpen === displayClose,
      imagePlaceholder: IMAGE_PLACEHOLDER.test(text),
      missingNotice: MISSING_NOTICE.test(text),
      excessiveMarkup: (text.match(/\*\*/g) || []).length % 2 !== 0,
      replacementChar: /[\uFFFD]/.test(text),
      mojibake: /â€|Ã¢|Â|ï¿½/.test(text),
      bengali: /[\u0980-\u09FF]/.test(text),
      blank: text.length === 0,
    };
    if (seen.has(question.number))
      seen.get(question.number).push(record.section || "(none)");
    else seen.set(question.number, [record.section || "(none)"]);
    return record;
  });

  const duplicates = [...seen.entries()]
    .filter(([, occurrences]) => occurrences.length > 1)
    .map(([number, occurrences]) => ({ number, occurrences }));

  const present = new Set(records.map((record) => record.number));
  const missing = [];
  for (let n = 1; n <= 100; n++) if (!present.has(n)) missing.push(n);

  const outOfRange = records
    .filter((record) => record.number < 1 || record.number > 100)
    .map((record) => record.number);

  const sectionMismatch = [];
  for (const range of declaredRanges) {
    const inSection = records.filter(
      (record) => record.section === range.title,
    );
    const outside = inSection.filter(
      (record) => record.number < range.from || record.number > range.to,
    );
    if (outside.length)
      sectionMismatch.push({
        section: range.title,
        declared: `${range.from}–${range.to}`,
        outside: outside.map((record) => record.number),
      });
  }

  const title = /^#\s+(.*)$/m.exec(raw)?.[1]?.trim() ?? "";
  const titleYear = Number((/JELET[- ]?(20\d{2})/.exec(title) ?? [])[1] ?? 0);

  return {
    year,
    file: `pyq-md/${year}.md`,
    ...PAPER_META[year],
    sha256: sha256(raw),
    bytes: Buffer.byteLength(raw, "utf8"),
    lines: lines.length,
    title,
    titleYear,
    titleMatchesFileName: titleYear ? titleYear === year : null,
    declaredQuestionCount: Number(
      /Total Questions:\s*(\d+)|No\. of MCQ:\s*(\d+)/
        .exec(raw)
        ?.slice(1)
        .find(Boolean) || 0,
    ),
    sections,
    declaredRanges,
    sectionMismatch,
    questionCount: records.length,
    missing,
    duplicates,
    outOfRange,
    questions: records,
    stats: {
      imagePlaceholders: records.filter((record) => record.imagePlaceholder)
        .length,
      missingNotices: records.filter((record) => record.missingNotice).length,
      mathsQuestions: records.filter((record) => record.hasMath).length,
      unbalancedMath: records.filter((record) => !record.balancedMath).length,
      fewerThanFourOptions: records.filter(
        (record) => record.optionCount > 0 && record.optionCount < 4,
      ).length,
      noOptionsDetected: records.filter((record) => record.optionCount === 0)
        .length,
      unansweredOptionLetters: records
        .filter((record) => record.optionCount === 0)
        .map((record) => record.number),
      blankQuestions: records.filter((record) => record.blank).length,
      replacementChars: records.filter((record) => record.replacementChar)
        .length,
      mojibake: records.filter((record) => record.mojibake).length,
      bengaliText: records.filter((record) => record.bengali).length,
      malformedMarkup: records.filter((record) => record.excessiveMarkup)
        .length,
    },
    unknownPlaceholderMarkers: [
      ...new Set(
        records.flatMap((record) => {
          const found = record.text ?? "";
          return found.match(/\[[^\]]{0,60}\]/g) ?? [];
        }),
      ),
    ].slice(0, 40),
  };
}

function detectOptions(text) {
  // Count distinct (A)…(D) option markers; inline and one-per-line both count.
  const letters = new Set();
  for (const match of text.matchAll(/\(([A-D])\)/g)) letters.add(match[1]);
  return [...letters].sort();
}

function count(text, needle) {
  return text.split(needle).length - 1;
}

export function auditSyllabus(raw) {
  const headings = [...raw.matchAll(/^(#{1,3})\s+(.*)$/gm)].map((match) => ({
    level: match[1].length,
    title: match[2].trim(),
  }));
  const subjects = [...raw.matchAll(/^###\s+\d+\.\s+(.*)$/gm)].map((match) =>
    match[1].trim(),
  );
  return {
    file: "syllabus.md",
    sha256: sha256(raw),
    bytes: Buffer.byteLength(raw, "utf8"),
    lines: raw.split("\n").length,
    headings,
    subjects,
    subjectCount: subjects.length,
    topicGroups: (raw.match(/^\*\*[A-Z]\.\s+/gm) || []).length,
    bulletTopics: (raw.match(/^- \*\*/gm) || []).length,
    hasEligibilitySection: /Eligibility Highlights/i.test(raw),
    hasReservationSection: /reservation/i.test(raw),
    mentionsYear: /2026/.test(raw),
    bengali: /[\u0980-\u09FF]/.test(raw),
  };
}

export function auditLegacyReader(html) {
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(
    (match) => match[1],
  );
  return {
    file: "pyq-index.html",
    sha256: sha256(html),
    bytes: Buffer.byteLength(html, "utf8"),
    externalScripts: scripts.filter((src) => /^https?:/.test(src)),
    scriptCount: scripts.length,
    fetchesLocalMarkdown: /fetch\(/.test(html) && /pyq-md/.test(html),
  };
}

export function auditCorpus({ papers, syllabus, legacyHtml }) {
  const paperAudits = Object.keys(papers)
    .map(Number)
    .sort((a, b) => a - b)
    .map((year) => auditPaper(papers[year], year));
  return {
    generatedBy: "scripts/content-audit.mjs",
    scope:
      "Structural/textual audit of the repository transcriptions. No comparison against official PDFs; wording accuracy is not established.",
    paperAudits,
    syllabus: auditSyllabus(syllabus),
    legacyReader: auditLegacyReader(legacyHtml),
    totals: {
      papers: paperAudits.length,
      questionsPresent: paperAudits.reduce(
        (sum, paper) => sum + paper.questionCount,
        0,
      ),
      missingNumbers: paperAudits.reduce(
        (sum, paper) => sum + paper.missing.length,
        0,
      ),
      imagePlaceholders: paperAudits.reduce(
        (sum, paper) => sum + paper.stats.imagePlaceholders,
        0,
      ),
      questionsWithoutDetectedOptions: paperAudits.reduce(
        (sum, paper) => sum + paper.stats.noOptionsDetected,
        0,
      ),
      questionsWithFewerThanFourOptions: paperAudits.reduce(
        (sum, paper) => sum + paper.stats.fewerThanFourOptions,
        0,
      ),
      unbalancedMath: paperAudits.reduce(
        (sum, paper) => sum + paper.stats.unbalancedMath,
        0,
      ),
      duplicates: paperAudits.reduce(
        (sum, paper) => sum + paper.duplicates.length,
        0,
      ),
      titleMismatches: paperAudits.filter(
        (paper) => paper.titleMatchesFileName === false,
      ).length,
    },
  };
}

/** Eligibility matrix: what each paper may be used for *today*. */
export function eligibilityMatrix(audit) {
  return audit.paperAudits.map((paper) => ({
    year: paper.year,
    readable: true,
    transcriptionVerified: false,
    keyVerified: false,
    fullMockEligible: false,
    reason:
      paper.missing.length || paper.titleMatchesFileName === false
        ? `Incomplete transcription (missing ${paper.missing.join(", ") || "none"})` +
          (paper.titleMatchesFileName === false
            ? "; internal title conflicts with file name"
            : "") +
          "; no verified answer key"
        : "No verified answer key; wording not compared with the official original",
  }));
}

export function renderMarkdown(audit) {
  const lines = [];
  lines.push("# Content audit — machine-generated inventory");
  lines.push("");
  lines.push(
    `Generated by \`npm run audit:content\` on ${new Date().toISOString().slice(0, 10)}. Do not hand-edit; regenerate after any content change.`,
  );
  lines.push("");
  lines.push(
    "**Scope.** Structural and textual audit of the repository transcriptions only. Nothing here compares the text with the official PDF, and no answer keys exist. Number coverage is not an accuracy or completeness guarantee.",
  );
  lines.push("");
  lines.push("## Totals");
  lines.push("");
  const t = audit.totals;
  lines.push("| Metric | Value |");
  lines.push("| --- | --- |");
  lines.push(`| Papers audited | ${t.papers} |`);
  lines.push(`| Numbered questions present | ${t.questionsPresent} |`);
  lines.push(`| Missing numbers (1–100) | ${t.missingNumbers} |`);
  lines.push(
    `| Questions with an image/diagram placeholder | ${t.imagePlaceholders} |`,
  );
  lines.push(
    `| Questions where no (A)–(D) options were detected | ${t.questionsWithoutDetectedOptions} |`,
  );
  lines.push(
    `| Questions with 1–3 detected option markers | ${t.questionsWithFewerThanFourOptions} |`,
  );
  lines.push(
    `| Questions with unbalanced maths delimiters | ${t.unbalancedMath} |`,
  );
  lines.push(`| Duplicate question numbers | ${t.duplicates} |`);
  lines.push(
    `| Internal title conflicts with file name | ${t.titleMismatches} |`,
  );
  lines.push("");
  lines.push("## Per paper");
  lines.push("");
  lines.push(
    "| Year | File | Present | Missing from 1–100 | Sections | Image placeholders | No options detected | <4 options | Maths | Unbalanced maths | Duplicate numbers | Title check | SHA-256 (first 12) |",
  );
  lines.push(
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  );
  for (const paper of audit.paperAudits) {
    const titleCheck =
      paper.titleMatchesFileName === null
        ? "no year in title"
        : paper.titleMatchesFileName
          ? "ok"
          : `file ${paper.year} vs title "${paper.title}"`;
    lines.push(
      `| ${paper.year} | \`${paper.file}\` | ${paper.questionCount} | ${paper.missing.length ? paper.missing.join(", ") : "none"} | ${paper.sections.length} | ${paper.stats.imagePlaceholders} | ${paper.stats.noOptionsDetected} | ${paper.stats.fewerThanFourOptions} | ${paper.stats.mathsQuestions} | ${paper.stats.unbalancedMath} | ${paper.duplicates.length} | ${titleCheck} | \`${paper.sha256.slice(0, 12)}\` |`,
    );
  }
  lines.push("");
  lines.push("## Section headings as declared in each file");
  lines.push("");
  for (const paper of audit.paperAudits) {
    lines.push(`### ${paper.year}`);
    for (const section of paper.sections)
      lines.push(`- ${"#".repeat(section.level)} ${section.title}`);
    if (paper.sectionMismatch.length) {
      lines.push("");
      lines.push("Declared-range mismatches:");
      for (const mismatch of paper.sectionMismatch)
        lines.push(
          `- \`${mismatch.section}\` declares ${mismatch.declared} but holds question(s) ${mismatch.outside.join(", ")}`,
        );
    }
    if (paper.stats.unansweredOptionLetters.length) {
      lines.push("");
      lines.push(
        `Questions with no detectable options: ${paper.stats.unansweredOptionLetters.join(", ")}`,
      );
    }
    lines.push("");
  }
  lines.push("## Eligibility matrix (current state)");
  lines.push("");
  lines.push(
    "| Year | Readable | Transcription verified | Key verified | Full mock eligible | Reason |",
  );
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const row of eligibilityMatrix(audit))
    lines.push(
      `| ${row.year} | ${row.readable} | ${row.transcriptionVerified} | ${row.keyVerified} | ${row.fullMockEligible} | ${row.reason} |`,
    );
  lines.push("");
  lines.push("## Syllabus and legacy reader");
  lines.push("");
  const syllabus = audit.syllabus;
  lines.push(
    `- \`syllabus.md\`: ${syllabus.lines} lines, ${syllabus.subjectCount} subjects, ${syllabus.topicGroups} lettered topic groups, ${syllabus.bulletTopics} bulleted topics.`,
  );
  lines.push(
    `- Contains an Eligibility/Reservation quick-reference section: ${syllabus.hasEligibilitySection ? "yes" : "no"} (not exposed by the app while unverified).`,
  );
  lines.push(
    `- Contains 2026 references: ${syllabus.mentionsYear ? "yes" : "no"}. Bengali text present: ${syllabus.bengali ? "yes" : "no"}.`,
  );
  const legacy = audit.legacyReader;
  lines.push(
    `- \`pyq-index.html\` (legacy, preserved): ${legacy.scriptCount} script tags, ${legacy.externalScripts.length} external CDN script(s)${legacy.externalScripts.length ? ` — ${legacy.externalScripts.join(", ")}` : ""}.`,
  );
  lines.push("");
  return lines.join("\n") + "\n";
}

function build() {
  const dir = join(root, "pyq-md");
  const papers = {};
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".md"))) {
    const year = Number(file.replace(".md", ""));
    papers[year] = readFileSync(join(dir, file), "utf8");
  }
  const audit = auditCorpus({
    papers,
    syllabus: readFileSync(join(root, "syllabus.md"), "utf8"),
    legacyHtml: readFileSync(join(root, "pyq-index.html"), "utf8"),
  });
  return audit;
}

function main(argv) {
  const audit = build();
  const outDir = join(root, "docs", "audits");
  const json = JSON.stringify(audit, null, 2) + "\n";
  const markdown = renderMarkdown(audit);
  if (argv.includes("--check")) {
    // CI mode: never rewrite; fail if the committed inventory is stale.
    let stale = [];
    try {
      if (readFileSync(join(outDir, "content-audit.json"), "utf8") !== json)
        stale.push("docs/audits/content-audit.json");
      if (readFileSync(join(outDir, "content-audit.md"), "utf8") !== markdown)
        stale.push("docs/audits/content-audit.md");
    } catch {
      stale.push("docs/audits/content-audit.{json,md} (missing)");
    }
    if (stale.length) {
      console.error(
        `Content audit is stale: ${stale.join(", ")}. Run \`npm run audit:content\` and commit the result.`,
      );
      process.exit(1);
    }
    console.log("Content audit matches the corpus.");
    return;
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "content-audit.json"), json);
  writeFileSync(join(outDir, "content-audit.md"), markdown);
  const t = audit.totals;
  console.log(
    `Audited ${t.papers} papers: ${t.questionsPresent} questions, ${t.missingNumbers} missing numbers, ${t.imagePlaceholders} image placeholders, ${t.unbalancedMath} unbalanced maths, ${t.duplicates} duplicates.`,
  );
  console.log("Wrote docs/audits/content-audit.{json,md}");
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  main(process.argv.slice(2));
}
