# Content and local data schema (design, not code)

## Paper
Stable ID; year; stream; paper/set identifier; source URL and page references; source pattern/version; expected and present question counts; missing-number list; completeness; transcription review status; reviewer/check date; source rights/credit notes.

## Question
Stable ID tied to paper; original number; subject; category and marking-rule reference; text; ordered option IDs/text; maths; diagram asset and accessible description; source page; missing/uncertain flags; transcription review status. Topic mapping is separately reviewed.

## Answer key and explanation
Paper/set and question match; selected correct option IDs; official URL; provisional/final status; source question-to-booklet mapping; check date; review status. Explanations have independent authorship, rights and accuracy status. Never treat a checked transcription as a checked key.

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
