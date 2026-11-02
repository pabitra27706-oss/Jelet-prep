# Official-paper verification — H-2 progress record

Recorded 2026-11-02. This record exists because the Phase 0-A audit
([`CONTENT-AUDIT-REPORT.md`](CONTENT-AUDIT-REPORT.md)) could not open the official
PDFs: the WBJEEB CDN was unreachable from the authoring sandbox. The repository
owner has since supplied 11 official WBJEEB booklets, so the "no paper has been
compared with its official original" caveat in that report is now **partly
outdated** — this file records exactly how far it has been retired.

**Evidence standard for this record.** Every identity below was read off the
printed cover page (rendered from the PDF, not inferred from the filename). Every
content claim below comes from text extracted from the booklet or from OCR of the
scanned page, and names the page it came from. Nothing here is a secondary
source. **No answer key was found in any booklet, so nothing here is
key-verified** — see §6.

**What this record does *not* claim.** Full transcription verification. The
check performed was *structural*: does each booklet contain the question numbers
the corpus claims, and does the official text of a flagged question actually
contain the thing the corpus flagged? Sentences were not compared character by
character.

---

## 1. The 11 supplied booklets, identified

| File | Paper | Stream | MCQ | Marks | Pages | Booklet No. |
| --- | --- | --- | --- | --- | --- | --- |
| `2023111594-1.pdf` | JELET-2017 Paper-I | All Diploma holders, Engg./Tech. | 100 | 100 | 32 | 80116361 |
| `2023111538-1-1.pdf` | JELET-2018 Paper-I | Diploma Engg. & Tech. | 100 | 100 | 32 | 88115903 |
| `2023111536-1-1.pdf` | JELET-2021 Paper-I | Diploma Engg. & Tech. | 100 | 100 | 24 | 1091007537 |
| `2023111591-3-1.pdf` | JELET-2022 Paper-I | Engg./Tech. & B.Sc. | 100 | 120 | 24 | 2091013057 |
| `2023111575-2.pdf` | JELET-2023 Paper-I | Engg./Tech. & B.Sc. | 100 | 120 | 24 | (not printed) |
| `2024120234-1.pdf` | JELET-2024 Paper-I | E.T., B.Sc., B.Voc., D.Voc. | 100 | 120 | 24 | 4091010805 |
| `202512161802442791-1.pdf` | JELET-2025 Paper-I | Paper-I | 100 | 120 | 25 | (not printed) |
| `2023111568.pdf` | JELET-2022 Paper-II | Pharmacy candidates | 100 | 120 | 16 | 2092001321 |
| `2023111513.pdf` | JELET-2023 Paper-II | Pharmacy candidates | 100 | 100 | 16 | (not printed) |
| `2024120274.pdf` | JELET-2024 Paper-II | Pharmacy candidates | 100 | 100 | 16 | 4092001229 |
| `20251215552897409.pdf` | JELET-2025 Paper-II | Pharmacy candidates | 100 | 100 | 20 | (not printed) |

Two files were previously unidentified and are now settled: `2023111568.pdf` is
**JELET-2022 Paper-II (Pharmacy)**, not 2023 Paper-II, and `2023111513.pdf` is
**JELET-2023 Paper-II (Pharmacy)**. All four Paper-II booklets are the Pharmacy
stream and carry **no Category-II section** in 2023, 2024 and 2025 (2022 Paper-II
does have one: Category-1 = 1 mark, Category-2 = 2 marks, 120 marks total).

**No 2019 booklet was supplied.** 2019 therefore remains unverified in this
record, and its corpus gap (Q78–79) is still untested against an original.

---

## 2. Findings against the corpus's recorded gaps

The audit recorded three missing-number gaps. Verified verdicts:

| Gap | Verdict | Evidence |
| --- | --- | --- |
| **2024 Q60–62** | **False alarm — the questions are present.** The audit row `missing: 60, 61, 62` is a transcription-tool artefact, not a content gap. | Q60 (rain/umbrella), Q61 (PE and KE versus time), Q62 (kinematics) all appear in sequence in the official booklet, pp. 16–17. |
| **2022 Q86–90** | **Real gap in the transcription — the questions exist officially.** | Officially they are the Chemistry Category-II block, printed as "CHEMISTRY / Category-II (Q 86 to 90)" on p. 21 with all five stems and options. The corpus has none of them. |
| **2019 Q78–79** | **Unverified.** No 2019 booklet was supplied. | — |

The 2022 corpus note ("Questions 86–90 are missing from the provided PDF text")
is *accurate about the transcription* and honest, but it invited the reading that
the paper was short. It was not: the gap is in the transcription only.

### 2.1 The five missing 2022 questions, from the official booklet (p. 21)

Recorded here so the owner can decide whether to add them. **They have not been
added to `pyq-md/2022.md`** — that is an editorial change, not an audit action.
Read from OCR of a scanned page, so wording is corrected against context and is
close to, but not certified as, verbatim.

- **86.** Which of the following aqueous solutions of metal chlorides is neutral?
  (A) AlCl₃ (B) BeCl₂ (C) BaCl₂ (D) RbCl
- **87.** Which of the chemical conversion(s) as given below show(s) the highest
  degree of redox change? (A) Phosphoric acid to phosphine (B) Nitric acid to
  molecular nitrogen (C) Sulphuric acid to elemental sulphur (D) Borax to diborane
- **88.** A chemical change will be spontaneous at constant pressure and
  temperature under the set(s) of conditions (A) ΔH = −ve, ΔS = −ve, |ΔH| > |TΔS|
  (B) ΔH = +ve, ΔS = +ve, |ΔH| < |TΔS| (C) ΔH = −ve, ΔS = −ve, |ΔH| = |TΔS|
  (D) ΔH = +ve, ΔS = +ve, |ΔH| > |TΔS|
- **89.** Which of the following statement(s) is/are true? — statements about how
  K of a reaction shifts with temperature for exothermic and endothermic cases
  (four options, two of each).
- **90.** Which of the following compounds have covalent bonds?
  (A) NaCl (B) H₂O (C) CH₄ (D) CaCO₃

---

## 3. "No options" flags are legitimate, not defects

The audit flagged 24 questions with fewer than two options. Every one that was
checked is a **figure-based question**, where the official booklet prints the four
options as graphs, circuits, stress blocks or chemical structures — "(A) (B) (C)
(D)" with pictures only. Supplying text options for these would be invention.

Checked and confirmed figure-based: 2017 Q97, Q100; 2018 Q89, Q91; 2021 Q26, Q35;
2022 Q49, Q57, Q62; 2024 Q42, Q66, Q79, Q89; 2025 Q44, Q51, Q58, Q66, Q85, Q88.
Example: 2024 Q42 officially reads "…Which of the following represents the
speed-time graphs…" followed by four graphs; 2021 Q26 asks which curve depicts
terminal voltage versus load current, again four curves.

**Consequence:** the "24 no-option" figure in the audit should be read as
"24 figure-based questions", not as 24 transcription defects. The diag
placeholders attached to them are correct behaviour.

---

## 4. Structural fact the audit missed: historical papers are multi-stream

2017, 2018 and 2021 are **not** single-stream 100-question papers. Each booklet
prints the common core, then a *separate* numbered block for other diploma
streams, reusing numbers 71–100. Confirmed section headings:

| Paper | Common core | Alternate stream blocks |
| --- | --- | --- |
| 2017 | MATHEMATICS (1–20), ELECTRICAL TECHNOLOGY (21–35), COMPUTER APPLICATION (36–55), ENVIRONMENTAL ENGINEERING (56–70), ENGINEERING MECHANICS (71–100) | BASIC ENGINEERING (p. 24); PRINTING MATERIAL SCIENCE (p. 26); SOIL & WATER ENGINEERING (p. 29); FOOD PROCESS & POST HARVEST ENGINEERING (p. 30) |
| 2018 | same five sections | Basic Engineering (p. 22); Printing Material Science (p. 24); Soil and Water Engineering (p. 27); Food Processes and Post-Harvest Engineering (p. 30) |
| 2021 | same five sections | Basic Engineering (p. 20); Printing Material Science (p. 21); Soil & Water Engineering (p. 22); Food Processes & Post Harvest Engineering (p. 23) |

So each of these booklets contains far more than 100 questions — 100 for the
main stream plus roughly 30 per alternate stream. This explains two things that
were previously recorded as unexplained:

1. **M-1, the "declared-range mismatch".** The transcriptions do contain all five
   sections, but only the first three are marked as headings; "ENGINEERING
   MECHANICS (Q71–85)" and "ENVIRONMENTAL ENGINEERING" appear as inline text, so
   the audit's heading detector saw 3 sections around a 100-question body. The
   content is right; the *labels* are what is wrong (and 2017's inline label says
   Q71–85 when the block runs to Q100).
2. **Why no duplicate numbers were found** despite the booklets plainly printing
   several Q72s. The corpus transcribes the main-stream block only; the alternate
   stream blocks are absent entirely. The corpus even records this deliberately —
   2017 carries the note `[For all candidates except Printing Technology and
   Agricultural …]`. That is a **documented scope decision, not a gap**, but it is
   not currently stated anywhere a user would read it.

---

## 5. Papers with no gap at all

| Paper | Question numbers found | Sections |
| --- | --- | --- |
| 2023 Paper-I | **100/100, none missing** | MATHEMATICS, PHYSICS, CHEMISTRY, plus the same two-block pattern |
| 2025 Paper-I | 100/100, none missing | 5 sections, identical map to 2024 |

2023 Paper-I passed cleanly on its **own text layer** — no OCR involved, so this
is the strongest evidence in this record.

**2023 Paper-I is not in the corpus at all.** `pyq-md/` holds 2017, 2018, 2019,
2021, 2022, 2024, 2025. The official 2023 Paper-I is now in hand and is the only
complete official booklet with a clean text layer that the library is missing.

---

## 6. Answer keys — H-1 stays open, now with positive evidence

The last two pages of all 11 booklets were inspected (text layer where present,
OCR otherwise). **Every one of them ends in questions or "SPACE FOR ROUGH WORK".**
None contains an answer key, marking scheme, or response sheet. 2017 ends with an
OMR instruction page, 2018/2021/2022/2024/2025 with rough-work pages, and all four
Paper-II booklets with rough work.

This strengthens, but does not close, H-1: it shows *these* booklets carry no key.
It says nothing about whether WBJEEB publishes keys separately — the archive index
was checked earlier and listed no key links.

---

## 7. Effect on eligibility

**No paper's eligibility changes.** Not one row moves.

| Question | Answer |
| --- | --- |
| Any paper now transcription-verified? | **No.** Structural checks only; sentences were not compared. |
| Any paper now key-verified? | **No.** No key exists in any supplied booklet. |
| Any paper now full-mock eligible? | **No.** |
| Did the 2024 row improve? | Yes, factually: 60–62 exist. It still does not meet the verified bar. |

Two audit rows are **factually wrong** and should be corrected in place with a
dated note rather than rewritten silently:

- §1 table and §4 table: 2024 "Missing numbers = 60, 61, 62" → **none**.
- §4 table: 2024 question-count note "(60–62 absent)" → present.

§3.2's gap list should likewise drop 2024 and keep 2022 (real) and 2019
(unverified).

---

## 8. What is still untested

1. **2019** — no booklet supplied; Q78–79 unresolved either way.
2. **Sentence-level fidelity** — the 2017/2018/2021 transcriptions condense and
   paraphrase in places (established earlier from a secondary mirror). Whether a
   given question is verbatim, condensed, or altered has not been measured.
3. **Figure content** — OCR cannot tell whether a described diagram is accurate.
   Placeholder text is honest; diagram fidelity is unknown.
4. **The four Paper-II Pharmacy booklets** — identified and checked for keys, but
   their content was not compared with anything, because no Pharmacy paper exists
   in the corpus.

---

## 9. Marking rules — verified from the instruction pages

The rules that a scoring engine must implement are printed on page 1 of every
booklet and were read there directly. They are recorded in
`docs/phases/03-verified-practice.md` §3-0.1 with per-year citations; the summary
is that 2017, 2018 and 2021 are 100-mark **single-answer** papers (+1, −¼ for a
wrong answer or for marking more than one, 0 for blank), while 2022, 2024 and 2025
are 120-mark papers with single-answer Category-I questions and multi-answer
Category-II questions worth 2 marks with the formula

> score = 2 × (number of correct answers marked) ÷ (actual number of correct answers)

applied only when the selection is a non-empty subset of the correct set; any
wrong option marked scores zero, with no negative marking.

**2019 remains unverified** — no booklet was supplied.

One caution worth keeping: OCR of the 2022 page rendered that division sign as a
plus sign. The page render settles it. Scoring rules must never be transcribed
from OCR without a visual check, which is why every row above cites a page.

This is the one Phase 3 prerequisite that could be closed today without a key. It
does not unblock scoring — knowing how to mark a question is not knowing what the
right answer is.
