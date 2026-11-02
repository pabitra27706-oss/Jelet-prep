# Content and local data schema (design, not code)

## Paper

Stable ID; year; stream; paper/set identifier; source URL and page references; source pattern/version; expected and present question counts; missing-number list; completeness; transcription review status; reviewer/check date; source rights/credit notes.

## Question

Stable ID tied to paper; original number; subject; category and marking-rule reference; text; ordered option IDs/text; maths; diagram asset and accessible description; source page; missing/uncertain flags; transcription review status. Topic mapping is separately reviewed.

## Answer key and explanation

Paper/set and question match; selected correct option IDs; official URL; provisional/final status; source question-to-booklet mapping; check date; review status. Explanations have independent authorship, rights and accuracy status. Never treat a checked transcription as a checked key.

## Figure (added 2026-11-02, ADR-0002)

A figure is a first-class asset, not an inline blob: stable ID tied to the
question; `kind` (graph / circuit / mechanics / structure); asset path to an
original SVG; `altText` and a longer `description`; `officialPage` for the source
citation; `derivation` (always `reconstructed` for now); `sourceRef` (paper,
booklet, page, question); `redrawDate`; `reviewed` flag and reviewer; known
deviations from the source sketch.

Two rules travel with the record: a question whose figure is unreviewed is not
scorable, and a reconstructed figure never makes a question verified. Machine
inventory: `docs/figures/manifest.json`.

## Answer key file — import contract (implemented 2026-11-02)

Keys now exist for 2023–2026 (`docs/official-keys/`, transcriptions of WBJEEB's
final-key notices) and are wired into the app through `src/keys.ts`. Years
without a published key stay unkeyed rather than derived-and-displayed.

Required per record: `paperId`; `questionNumber`; `correctOptionIds` (one or more,
each an existing option of that question); `provenance` (publisher URL or document
reference, retrieval date, who transcribed it); `keyStatus` (`provisional` |
`final`); `checkDate`; `reviewedBy`.

Validator must reject, with a reason and without partially importing: unknown
`paperId` or `questionNumber`; an option ID the question does not have; a duplicate
record for the same question; an empty or over-full correct set; a record with no
provenance; a record whose `keyStatus` claims `final` without a source document.

Import is **all-or-nothing**. A partially applied key is worse than none, because
it silently converts a complete-looking paper into a half-scored one.

## Syllabus and exam guidance

Year; bulletin/notice URL; section/page; subject/chapter/topic IDs; reviewed date; supersedes/superseded-by references; verification state. Do not silently promote 2026 rules into a future exam year.

## Stable content IDs (implemented Phase 2)

`CONTENT_VERSION = "2026-11-02.1"` names the identity space of the bundled
content. Derived IDs, never random and never array-index based:

- paper `jelet-et-p1-<year>`
- question `jelet-et-p1-<year>:q<original number>` (original numbering preserved,
  so 2024's gap stays a gap and 2019 is not renumbered)
- subject `jelet-syllabus:<subject slug>`
- topic `jelet-syllabus:<subject slug>:t<position>` (positional within the
  preserved syllabus summary, therefore version-guarded)
  A SHA-256 fingerprint of the seven `pyq-md` files is pinned in
  `src/study/ids.test.ts`. Changing content without bumping `CONTENT_VERSION` and
  reviewing stored references fails that test.

## Device-local progress — implemented v1

Schema version 1 in IndexedDB database `jelet-prep-study` (see
`docs/STUDY-DATA.md` for the authoritative contract):

- `bookmarks` — question ID, paper ID, question number, created timestamp.
- `positions` — one reading position per paper (paper ID, question number,
  updated timestamp).
- `notes` — one plain-text note per question (≤2000 characters), created/updated.
- `topics` — self-reported `studying`/`revised` per syllabus topic; absence means
  not started. No mastery value is stored or derived.
- `history` — recent paper/syllabus opens (60 most recent, timestamped keys).
- `meta` — a pre-replace safety copy only.
  No attempt, option, timer, score, review flag or scoring-rule version exists yet:
  scored practice remains blocked on verified keys. No name, phone, email, rank
  card or other personal identifier is stored.

## Validation and migration

- Detect duplicate/missing IDs and invalid option references.
- Enforce category rules and paper/set matching.
- Exclude uncertain material from scored practice and incomplete papers from full mocks.
- Validate imports and schema version; preview merge/replace changes; never execute imported HTML/scripts.
- Migrations preserve or explicitly back up existing progress.
- Content updates must not mutate historical attempts or silently change scores.
- Catch unavailable storage and quota errors; tell users progress is device-local, not guaranteed cloud backup.

Question papers being publicly accessible does not itself establish redistribution permission. Track provenance and resolve content/diagram rights before publication; link to originals where appropriate.

## Answer keys in the app — implemented 2026-11-02

`src/keys.ts` imports the four official key files and exposes `keyFor`,
`answerFor` and `formatAnswer`. Three rules are enforced in code, not by
convention:

1. **A key with no bundled question paper is data, not content.** `answerFor`
   still resolves it, but the reader shows nothing because there is no question
   to attach it to. 2023 and 2026 are in this state today.
2. **A key that has not been mapped to a booklet numbering is not shown.**
   `mappedToBooklet` is true only when the booklet was determined to be Set A
   (serial numbering identical to the board's). A Set B/C/D key would need a
   permutation, and the layer refuses to guess one.
3. **A voided question is never scored.** `answer === "W"` becomes
   `voided: true`, renders as _Void_, and carries the board's explanation. It is
   excluded from `options` so no caller can accidentally treat `W` as a letter.

Routes: `/keys` (index) and `/keys/<year>` (full 100-answer sheet, grouped by
section). The reader (`/#papers/<year>`) shows the board's answer under each
question, with the document reference and the set that was verified. Papers
without a keys — 2017, 2018, 2019, 2021, 2022 — continue to say plainly that no
verified answers are supplied.
