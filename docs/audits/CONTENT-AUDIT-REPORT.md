# Phase 0-A — Content audit report

Recorded 2026-11-02. Machine-generated numbers come from
[`content-audit.md`](content-audit.md) / `content-audit.json`; the source
register is `src/audit/sources.ts`.

**Evidence standard.** Official links and titles below were read from the WBJEEB
JELET archive index on 2026-11-02. The official PDFs themselves could **not** be
downloaded or parsed from the authoring sandbox (the CDN host is unreachable
there), so no paper has been compared line by line with its official original.
Two spot checks used a secondary mirror's page images and are labelled as such.
Where something was not checked, this report says so instead of implying
verification.

---

## 1. What is shipped

| Year | File             | Questions present | Missing numbers | Bytes  | SHA-256 (12)   |
| ---- | ---------------- | ----------------- | --------------- | ------ | -------------- |
| 2017 | `pyq-md/2017.md` | 100               | none            | 19 147 | `d67bbdf6369a` |
| 2018 | `pyq-md/2018.md` | 100               | none            | 20 858 | `a2763176debd` |
| 2019 | `pyq-md/2019.md` | 98                | 78, 79          | 20 531 | `c55185c80372` |
| 2021 | `pyq-md/2021.md` | 100               | none            | 22 750 | `906d978c51df` |
| 2022 | `pyq-md/2022.md` | 95                | 86–90           | 24 714 | `d796aec9d04f` |
| 2024 | `pyq-md/2024.md` | 97                | 60, 61, 62      | 21 134 | `7e0be760254f` |
| 2025 | `pyq-md/2025.md` | 100               | none            | 23 039 | `998b466949ec` |

690 numbered questions in total. Plus `syllabus.md` (2026 summary) and the
preserved legacy reader `pyq-index.html`. Both original formats are kept.

---

## 2. Official source mapping

Every shipped paper was matched to an entry on the official archive
(<https://wbjeeb.nic.in/jelet-old-question-papers/>, read 2026-11-02):

| Year | Official title                              | Official file                            |
| ---- | ------------------------------------------- | ---------------------------------------- |
| 2017 | JELET 2017 Engg. & Tech.                    | `uploads/2023/11/2023111594.pdf`         |
| 2018 | JELET 2018 Engg. & Tech.                    | `uploads/2023/11/2023111538-1.pdf`       |
| 2019 | JELET 2019 Engg & Tech                      | `uploads/2023/11/2023111582-1.pdf`       |
| 2021 | JELET 2021 Engg. & Tech.                    | `uploads/2023/11/2023111536-1.pdf`       |
| 2022 | JELET 2022 Paper I (Engg Tech/B.Sc)         | `uploads/2023/11/2023111591-3.pdf`       |
| 2024 | JELET 2024 Paper 1 (ET, B.Sc, B.Voc, D.Voc) | `uploads/2024/12/2024120234.pdf`         |
| 2025 | JELET 2025 Paper I                          | `uploads/2025/12/202512161802442791.pdf` |

Observations that matter for later phases:

- **2022 and 2024 files cover more than one stream.** The 2022 file is shared by
  Engineering & Technology and B.Sc.; the 2024 file is shared by ET, B.Sc, B.Voc
  and D.Voc. The app presents both as "Engineering & Technology · Paper I", which
  is the intended audience but is not the full official scope of the file.
- **No answer key appears on the official archive page.** Any "final answer key"
  claim elsewhere is unverified by this project, and none is used by the app.
- **2023 Paper I exists officially but is not in the library.** The archive lists
  it; the repository does not have a transcription. It is therefore a _gap in the
  library_, not a missing question inside a paper.
- 2017–2021 are per-stream papers (Engineering & Technology separate from B.Sc.,
  Pharmacy, etc.). Only the ET papers are transcribed.
- Historic papers used a **five-section structure** (Mathematics, Electrical
  Technology, Computer Application, plus two more) with 100 questions at 1 mark;
  the 2022+ pattern is four subjects and 120 marks.

---

## 3. Findings by severity

### 3.1 High — blocks any scoring or "verified" claim

| ID  | Finding                                                       | Evidence                                                                                                                                                                                                                                                                                                                                                                                                | Effect                                                                                                                | Action                                                                                                                                           |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| H-1 | **No answer key exists in the project.**                      | No key file in the repository; the official archive page links no key.                                                                                                                                                                                                                                                                                                                                  | Nothing can be scored; no practice, no marks, no accuracy.                                                            | Phase 3 requires a sourced, dated key per paper. Until then the app says so explicitly (implemented).                                            |
| H-2 | **No transcription has been compared with the official PDF.** | CDN unreachable from the authoring sandbox; PDF text extraction unavailable.                                                                                                                                                                                                                                                                                                                            | Wording accuracy is unknown; do not claim "verified transcription".                                                   | Needs a person or tooling with network access to the PDFs; track in the issue register.                                                          |
| H-3 | **Transcriptions are condensed, not verbatim.**               | 2022 Q66–67 compared against a secondary mirror's page image: identical substance and options, but official "A closed container of fixed volume has a mixture of one mole of hydrogen and one mole of helium in equilibrium at temperature T. Assume the gases are ideal." became "A closed container of fixed volume has one mole of hydrogen and one mole of helium at temperature T. (Ideal gases)". | A student may read a subtly different question than the exam asked; never use this file as a wording-critical source. | Label the reader accordingly; add verbatim re-transcription to the Phase 3 content gate.                                                         |
| H-4 | **2019 identity conflict.**                                   | Repository file `2019.md` has the internal title `# JELET-2018 Question Paper`. The 2019 ET booklet's cover, viewed on a secondary mirror page image (2026-11-02), reads **"JELET-2019"**, supporting the file name.                                                                                                                                                                                    | The library already flags a "Year conflict" badge and the reader names it.                                            | Leave the preserved text untouched; replace the badge wording with the evidence and keep the conflict until the official PDF itself is compared. |

### 3.2 Medium — content gaps inside papers

Machine-detected per paper (see the generated table for all rows):

| Year | Image/diagram placeholders | Questions with no detectable (A)–(D) options | Notes                                                                     |
| ---- | -------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| 2017 | 10                         | 2 (Q97, Q100)                                | Options were diagrammatic; transcription says "options not reproduced".   |
| 2018 | 10                         | 2 (Q89, Q91)                                 | "(Options not reproduced – diagram based)".                               |
| 2019 | 5                          | 4 (Q77, Q90, Q91, Q94)                       | Q77 carries an **editorial bracket note** that is not original exam text. |
| 2021 | 12                         | 2 (Q26, Q35)                                 | "Diagram based" answers.                                                  |
| 2022 | 4                          | 3 (Q49, Q57, Q62)                            | Graph-option questions.                                                   |
| 2024 | 18                         | 5 (Q42, Q66, Q78, Q79, Q89)                  | Includes chemical-structure options.                                      |
| 2025 | 13                         | 6 (Q44, Q51, Q58, Q66, Q85, Q88)             | Includes reaction schemes.                                                |

Every one of these 24 questions is answerable only with the original paper. The
reader shows an inline warning for them (Phase 1 behaviour, verified by test).

### 3.3 Medium — mislabelled sections in the transcriptions

In 2017, 2018, 2019 and 2021 the _last_ section heading declares a 20-question
range but the section actually holds 45–65 questions:

- `2017`: `COMPUTER & IT (Q36–55)` holds Q36–Q100.
- `2018`, `2019`, `2021`: `COMPUTER APPLICATION (Q36–55)` holds Q36–Q100.

The historical papers really do have five sections; the transcription dropped the
two later headings (Mechanical/Civil-type sections). The result is a _visible_
subject label that is wrong for ~45 questions in each of those four papers. This
does **not** lose content — all 100 numbers are present — but a student browsing
by subject sees Civil/Mechanical questions under "Computer & IT".

**Not fixed in this phase**: correcting headings is an editorial change to
preserved content and needs the official paper to place the boundaries. Recorded
as issue M-1 and surfaced as a warning in the reader instead.

### 3.4 Low — textual artefacts

- One editorial comment in `2019.md` Q77 ("[Question missing in original scan –
  skip to 80? Actually numbers 77-79 not present in text…]") and one in `2017.md`
  Q83 ("all options same in original? Assuming standard formula"). They are
  transcription notes, not exam content, and are visible to students today.
- No duplicate numbering, no unbalanced maths delimiters, no mojibake, no
  replacement characters, no Bengali text in any paper (checked programmatically).

### 3.5 Low — library-level gaps

- **2023 Paper I is missing** from the library although it is officially
  available. Library shows seven of the eight ET papers between 2017 and 2025.
- The legacy `pyq-index.html` loads `marked` and MathJax from external CDNs; it is
  preserved as an archive and is not linked from the app.

---

## 4. Transcript readability

| Year | Detectable sections | Question-count check          | Structural state                  |
| ---- | ------------------- | ----------------------------- | --------------------------------- |
| 2017 | 3                   | 100 numbered, 5 real sections | Readable; labels incomplete (M-1) |
| 2018 | 4                   | 100                           | Readable; labels incomplete (M-1) |
| 2019 | 4                   | 98 (78–79 absent)             | Readable with labelled gap        |
| 2021 | 4                   | 100                           | Readable; labels incomplete (M-1) |
| 2022 | 2                   | 95 (86–90 absent)             | Readable with labelled gap        |
| 2024 | 6                   | 97 (60–62 absent)             | Readable with labelled gap        |
| 2025 | 11                  | 100                           | Readable; 13 diagram placeholders |

---

## 5. Eligibility matrix (final for this phase)

| Year | Readable | Transcription verified | Key verified | Scored practice | Full mock |
| ---- | -------- | ---------------------- | ------------ | --------------- | --------- |
| 2017 | yes      | **no**                 | no           | no              | no        |
| 2018 | yes      | **no**                 | no           | no              | no        |
| 2019 | yes      | **no**                 | no           | no              | no        |
| 2021 | yes      | **no**                 | no           | no              | no        |
| 2022 | yes      | no (sampled only)      | no           | no              | no        |
| 2024 | yes      | **no**                 | no           | no              | no        |
| 2025 | yes      | **no**                 | no           | no              | no        |

`src/audit/audit.test.ts` asserts that every row stays readable-but-ineligible, so
a future change cannot quietly promote a paper to "verified".

---

## 6. Issue register

| ID  | Severity | Issue                                                           | Owner of the fix              | Excluded from                     | Re-check                        |
| --- | -------- | --------------------------------------------------------------- | ----------------------------- | --------------------------------- | ------------------------------- |
| H-1 | High     | No answer keys                                                  | Content owner                 | All scoring                       | Phase 3 gate                    |
| H-2 | High     | No PDF comparison                                               | Content owner (needs network) | "Verified" labels                 | Before Phase 3                  |
| H-3 | High     | Condensed wording                                               | Content owner                 | Wording-critical use              | Phase 3 gate                    |
| H-4 | High     | 2019 title conflict                                             | Content owner                 | Confidence in year label          | After PDF check                 |
| M-1 | Medium   | Wrong last-section labels (2017, 2018, 2019, 2021)              | Content owner                 | Subject-filtered study of Q56–100 | After PDF check                 |
| M-2 | Medium   | 72 diagram/reaction-dependent questions lack reproduced figures | Content owner + rights        | Answering those questions         | Phase 3/4                       |
| L-1 | Low      | Editorial bracket notes visible in 2017 Q83, 2019 Q77           | Content owner                 | Accuracy claims                   | Any content edit                |
| L-2 | Low      | 2023 Paper I not transcribed                                    | Content owner                 | Coverage claims                   | When supplied                   |
| L-3 | Low      | 2022/2024 files are multi-stream; app shows ET only             | Product owner                 | Stream claims                     | If B.Sc/Pharmacy scope is added |
| L-4 | Low      | `syllabus.md` eligibility/reservation summary unverified        | Product owner                 | App navigation (not exposed)      | Before any exam-guidance screen |

---

## 7. What this phase changed in the website

Nothing in the reader's content or the preserved files. The audit is evidence and
tooling:

- `scripts/content-audit.mjs` + `npm run audit:content` produce the inventory.
- `npm run audit:check` fails if the committed inventory is stale.
- `src/audit/sources.ts` records the official source, listing status, retrieval
  date and review state for every paper.
- `src/audit/audit.test.ts` (11 tests) ties the inventory, the runtime parser and
  the source register together.

An optional UI surfacing of these findings (source register on `/about`) is
proposed but not implemented here, because it changes what students see and the
current labels already state "unverified".

---

## 8. Honest limits of this audit

1. No official PDF text was compared. Everything above is structural or comes
   from the repository text itself.
2. Two spot checks relied on a secondary mirror's images, not WBJEEB's own file.
3. "No options detected" is a heuristic: a question might have options rendered as
   an image, in which case the reader shows the question with no choices — which is
   itself the honest state.
4. Rights and licensing are **not** resolved by this document; see
   `docs/LICENSING.md`.
5. The audit cannot tell whether a question's _mathematics_ is transcribed
   correctly — only that delimiters are balanced and that KaTeX renders it.
