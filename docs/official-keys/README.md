# Official answer keys (2023–2026, Paper-I)

These are **transcriptions of WBJEEB's own final answer-key notices**, not derived
answers. They are the only `official`-tier data in the repository.

Validate with `npm run keys:official`.

| Year | Board reference   | Date       | Source table     | Hosted by           |
| ---- | ----------------- | ---------- | ---------------- | ------------------- |
| 2023 | `JEEB/Reg-267/23` | 03-08-2023 | Engg tech & B.Sc | aglasem.com re-host |
| 2024 | `WBE/Ex-71`       | 01-08-2024 | Engg & B.Sc      | board PDF           |
| 2025 | `JEEB/Reg-171/25` | 16-11-2025 | JELET PAPER I    | board PDF           |
| 2026 | `JEEB/Reg-96/26`  | 13-07-2026 | JELET-PAPER I    | aglasem.com re-host |

2023 and 2026 were supplied as aglasem re-hosts, but the pages reproduced are
the board's own notice, carrying its reference number, date and address. They are
treated as official **content** with a noted hosting caveat.

**There is no 2022 key.** No WBJEEB key for 2022 was ever published — all 11
supplied 2022 booklets were checked and contain none. The 2022 key therefore
stays `derived` (see `docs/derived-keys/`).

## How the table is laid out

Each row is one question. Column **A is the master ordering, 1–100**. Columns
B, C and D give the number the _same_ question carries in those series. A single
answer applies to all four series, because JELET shuffles **question order but not
option order**.

So to key a booklet, first find which set it is, then:

- **Set A** — question _n_ is row _n_; read the answer directly.
- **Set B/C/D** — find the row whose `seriesB`/`seriesC`/`seriesD` equals _n_.

Sets are identified by a printed symbol, not a letter:

| Set | Symbol (2024 notice) |
| --- | -------------------- |
| A   | ■ solid square       |
| B   | + plus               |
| C   | ○ circle             |
| D   | (per notice)         |

## `W` means the board voided the question

Ten questions across the four papers have `W` in the answer column:

| Year | Voided            |
| ---- | ----------------- |
| 2023 | Q6, Q46, Q88, Q94 |
| 2024 | Q49, Q58          |
| 2025 | Q41, Q79, Q84     |
| 2026 | Q79               |

`W` is the board's marker for a question it found defective and voided: no option
is keyed, and the marks go to everyone. These are recorded as `"W"` rather than
silently dropped, because they are the strongest evidence available about how
often a JELET paper contains a broken question — about **2–4% of items**.

That figure matters for our own derived work: when the 2022 derivation produced
five "disputed" questions, that was not a sign of a bad process. The board voids a
comparable share of its own questions every year.

## Validation against our derived 2024 pilot

Our 2024 Paper-I booklet (`4091010805`) carries the ■ symbol, so it is Set A and
maps one-to-one. Nineteen answers we derived from page images in the earlier pilot
were compared with this official key:

**18 of 19 matched exactly** — including all five Category-II multi-answer items
and every arithmetic item (Q71–Q77).

The single difference was **Q35**, where we answered `C` and the board keys
`C, D`. That is exactly the ambiguity recorded in ADR-0003 at the time: (D) —
"zero if a, b, c are coplanar" — is also a true statement. We flagged it, the
board marked both. It is a measured instance of the _under-marking_ failure mode,
not a solving error.

## Caveats

1. **Transcription risk is ours, not the board's.** The audit checks that each
   series column is a permutation of 1–100, that `q` runs 1–100, and that answers
   are valid letter strings. It cannot check the letters themselves. Any digit
   misread while typing these tables would survive the audit.
2. **Only Paper-I blocks are transcribed.** Each notice contains a second
   100-question table (Pharmacy / Paper-II); those are out of scope here.
3. **The 2023 and 2026 set symbols were not readable** from the scanned booklets
   we hold, so the series for those papers is still to be confirmed before they
   are keyed against these tables.

## Booklet series, determined rather than assumed

The set symbol printed in our scanned booklets does not reliably match the
notices' legend — the 2023 booklet prints a _hollow_ square, which is not any of
the four legend symbols. Rather than guess, each paper's series was fixed
empirically: solve several questions from the booklet pages, then test all four
candidate columns.

| Paper | Result  | Evidence                                                                                  |
| ----- | ------- | ----------------------------------------------------------------------------------------- |
| 2023  | Set A   | Q1–Q5 solved independently (D, D, C, A, A): 5/5 on column A, 1/5 on B, 3/5 on C, 0/5 on D |
| 2024  | Set A   | the 19 derived pilot answers: 14/14 on the single-answer subset, 18/19 overall            |
| 2025  | Set A   | Q7–Q9 solved independently (D, D, C): 3/3 on column A, 1/3 on B, 2/3 on C, 0/3 on D       |
| 2026  | unknown | no booklet supplied                                                                       |

With every paper on Set A, the key needs no translation: booklet question _n_ is
board question _n_. The complete per-paper answer lists are in
[`ALL-KEYS.md`](ALL-KEYS.md).

## Wired into the app

`src/keys.ts` loads all four files; `/keys` lists them and `/keys/<year>` renders
the full sheet. The reader shows the board's answer under each question for
**2024 and 2025**, the two years that have both a key and a bundled paper.

2023 and 2026 are loaded but not displayed, for different reasons:

- **2023** — the question paper is not in the app's corpus. Its PDF has a usable
  text layer for prose but emits matrix contents in scrambled order, so importing
  it is a page-by-page transcription job, not a mechanical conversion.
- **2026** — no question booklet was supplied at all.
