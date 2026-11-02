# Repository content inventory

Generated 2026-11-02 from repository text, not from official-PDF comparison. Number coverage is not a completeness or accuracy guarantee. All answer keys remain unverified/unavailable in the app. Original Markdown is unchanged.

| File | Numbered entries | Missing from 1–100 | SHA-256 |
| --- | --- | --- | --- |
| `pyq-md/2017.md` | 100 | None by numbering | `d67bbdf6369a49dce4e7aa05dc78b544f631eab04b99da6d1e5a6252647d935b` |
| `pyq-md/2018.md` | 100 | None by numbering | `a2763176debdca3c435fac38f701b1a72ee1aa1543c6f45fdca63cd649dec036` |
| `pyq-md/2019.md` | 98 | 78, 79 | `c55185c803724a9b161b7db51ffc6a6f48e2b088d6715da4caacb3f47f753239` |
| `pyq-md/2021.md` | 100 | None by numbering | `906d978c51dfa80176e29f5cda758a7982c8650eb77ef6dd8638913f09905e45` |
| `pyq-md/2022.md` | 95 | 86, 87, 88, 89, 90 | `d796aec9d04f5f39a1076139ba6d6564aebb24a48928c7f1f5493cc22bd6308b` |
| `pyq-md/2024.md` | 97 | 60, 61, 62 | `7e0be760254f083a3511bd1b9ffc47d012457a420fed33a176188949a0ba12b3` |
| `pyq-md/2025.md` | 100 | None by numbering | `998b466949ec03cbc14bd97f851f0230c38d63b816ef85bd14fb7a947f396813` |

## Known identity/content issues
- 2019 file title says JELET-2018; no automatic correction was made. It also has no entries numbered 78–79. The library flags the conflict and the reader exposes missing numbers.
- 2022/2024 omit known question ranges and include image-based placeholders.
- 2025 has all numbered entries but question 95 references a diagram not reproduced here. Other diagram/option gaps require manual review across the corpus.
- Historical stream labels come from repository text and the previously inspected archive, not a newly authenticated paper match. Original archive is used where a specific PDF link was not established.
- Runtime question parsing retains original text/option order, removes editorial end markers and separates subject headings. Tests compare every numbered entry with the source; this is structural parity, not a substantive transcription audit.
- Syllabus extractor exposes only the detailed four-subject summary (11/15/8/8 topic groups), not the unreviewed eligibility/reservation quick-reference section.
- Phase 2 added stable study IDs without altering content: paper `jelet-et-p1-<year>`, question `jelet-et-p1-<year>:q<original number>`, topic `jelet-syllabus:<subject>:t<nn>`. Original numbering and file text are unchanged, so known gaps (2019 q78–79, 2022 q86–90, 2024 q60–62) stay gaps and saved bookmark/note references to them are reported as orphans rather than silently removed.
- `src/study/ids.test.ts` pins a SHA-256 fingerprint of the seven paper files; an edit to the corpus without a `CONTENT_VERSION` decision fails the unit tests.
