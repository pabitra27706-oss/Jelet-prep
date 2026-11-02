# Content and local data schema (design, not code)

## Paper
Stable ID; year; stream; paper/set identifier; source URL and page references; source pattern/version; expected and present question counts; missing-number list; completeness; transcription review status; reviewer/check date; source rights/credit notes.

## Question
Stable ID tied to paper; original number; subject; category and marking-rule reference; text; ordered option IDs/text; maths; diagram asset and accessible description; source page; missing/uncertain flags; transcription review status. Topic mapping is separately reviewed.

## Answer key and explanation
Paper/set and question match; selected correct option IDs; official URL; provisional/final status; source question-to-booklet mapping; check date; review status. Explanations have independent authorship, rights and accuracy status. Never treat a checked transcription as a checked key.

## Syllabus and exam guidance
Year; bulletin/notice URL; section/page; subject/chapter/topic IDs; reviewed date; supersedes/superseded-by references; verification state. Do not silently promote 2026 rules into a future exam year.

## Device-local progress
Schema version; bookmarks; reader position; notes; topic statuses; attempt ID; paper/question snapshot version; selected options; review flags; timer start/deadline; submission state; results and scoring-rule version. Avoid name, phone, email, rank card or other unnecessary personal identifiers.

## Validation and migration
- Detect duplicate/missing IDs and invalid option references.
- Enforce category rules and paper/set matching.
- Exclude uncertain material from scored practice and incomplete papers from full mocks.
- Validate imports and schema version; preview merge/replace changes; never execute imported HTML/scripts.
- Migrations preserve or explicitly back up existing progress.
- Content updates must not mutate historical attempts or silently change scores.
- Catch unavailable storage and quota errors; tell users progress is device-local, not guaranteed cloud backup.

Question papers being publicly accessible does not itself establish redistribution permission. Track provenance and resolve content/diagram rights before publication; link to originals where appropriate.
