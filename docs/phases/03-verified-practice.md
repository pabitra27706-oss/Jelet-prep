# Phase 3 — Verified practice and reliable mock engine

Status: PLANNED.
Dependencies: source-matched verified questions/keys and marking rules; durable storage; complete verified papers for full mocks. A missing verified dataset is a blocker, not permission to invent one.

## Outcome

Students answer real eligible questions, resume a session and receive reproducible, source-correct results.

## 3-0 — What can be built before a single answer key exists

Added 2026-11-02 at the owner's direction: specify the key-independent half of
Phase 3 now, so that the phase is ready to move the day a key appears. This
section is a work package, not a claim that any of it is implemented.

**The blunt constraint.** No answer key exists. All 11 official booklets supplied
on 2026-11-02 were checked on their final pages and none contains a key
(`docs/audits/OFFICIAL-PAPER-VERIFICATION.md` §6). Until one exists, Phase 3 can
produce **no score, no correctness indication, no result screen and no mock**. The
gates in 3-A/3-B/3-C that say "verified key required" are not softened by this
section; they are the reason the section is narrow.

What the missing key does _not_ block is the machinery around it. Most of Phase 3
is deterministic engineering that happens to take a key as an input.

### 3-0.1 Verified marking rules — available now, and already checked

The marking rules are printed on each booklet's instruction page. They have been
read from those pages, not inferred, so the scoring core can be written and tested
against real rules today, independently of any key.

| Year | Marks | Category-I                                                                                            | Category-II                                                                                                                                                                                            | Source                                     |
| ---- | ----- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| 2017 | 100   | +1 correct; **−¼** for a wrong answer or for any combination of more than one answer; 0 for no answer | none — all 100 questions are single-answer                                                                                                                                                             | booklet 80116361, p. 1, instruction 2      |
| 2018 | 100   | +1 correct; **−¼** wrong or more than one option                                                      | none                                                                                                                                                                                                   | booklet 88115903, p. 1, instruction 1      |
| 2019 | —     | **unverified** (no booklet supplied)                                                                  | —                                                                                                                                                                                                      | —                                          |
| 2021 | 100   | +1 correct; **−¼** wrong or more than one option                                                      | none                                                                                                                                                                                                   | booklet 1091007537, p. 1, instruction 1    |
| 2022 | 120   | +1 correct; **−¼** wrong or more than one option                                                      | 2 marks; if the selection is a non-empty subset of the correct set, score = **2 × (number marked correct) ÷ (actual number of correct answers)**; any wrong option marked ⇒ 0, **no negative marking** | booklet 2091013057, p. 1, instructions 2–3 |
| 2024 | 120   | as 2022                                                                                               | as 2022                                                                                                                                                                                                | booklet 4091010805, p. 1, instructions 2–3 |
| 2025 | 120   | as 2022                                                                                               | as 2022                                                                                                                                                                                                | p. 1, instructions 2–3                     |

Two things worth recording because they are easy to get wrong:

- **Category-II is a division, not a fixed half-credit step.** "2 × number of
  correct answers marked ÷ actual number of correct answers" means a 3-of-4
  selection on a 4-answer question scores 1.5, not 1 and not 2. Any implementation
  that awards a flat 2 for "all correct" and a fixed fraction otherwise is wrong.
- **An OCR pass of the same 2022 page rendered this formula with a "+" instead of
  a "÷".** The page render settles it. This is exactly why rules get quoted with a
  page citation rather than copied from OCR.

Still missing: 2019, and the 2022 Paper-II variant (120 marks, Category-1 and
Category-2, per its own cover) — neither is needed for the Paper-I practice engine.

### 3-0.2 The key-independent work packages

| Package                             | Deliverable                                                                                                                                            | Why it is safe without a key                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **P-1 Rule model**                  | Marking rules as data, versioned (`ruleVersion`), one entry per row of the table above                                                                 | Rules are already verified; no key involved                                                               |
| **P-2 Scoring core**                | Pure function `score(question, rule, selection) → mark`. No UI, no storage, no clock                                                                   | Testable against the published formula with hand-computed vectors                                         |
| **P-3 Content model extension**     | The Phase-3 fields from `docs/CONTENT-SCHEMA.md`: category, `ruleVersion`, nullable key, verification-state enum, figure reference + description       | Pure schema work; nothing is populated with a key                                                         |
| **P-4 Eligibility gate**            | A computed function, not a hardcoded list: a question is scorable only if it has a reviewed key, reviewed options, and no unresolved figure dependency | Can be written and tested with **zero** eligible questions — the honest current state is the test fixture |
| **P-5 Key import contract**         | File format, parser, validator and rejection reasons for a key file that does not yet exist                                                            | Defining a format requires no data; a dry-run can report "0 keys matched"                                 |
| **P-6 Attempt store (design only)** | Schema v2 design for attempts, answers, timings and rule versions                                                                                      | Design does not require a key; **no migration is written until 3-B is authorised**                        |

### 3-0.3 Hard prohibitions while H-1 is open

These are not stylistic preferences. Each one would fabricate a correctness claim.

1. **No results screen.** Even one showing "0 correct of 0 questions".
2. **No answer control that records an answer and later reveals correctness.**
   Recording a selection for one's own notes is Phase 2 behaviour and already
   exists; scoring it is not.
3. **No timer that implies an outcome.** A countdown with no scoring is theatre.
4. **No "verified" badge, tick, or green state** on any question or paper.
5. **No inferred or derived keys** — not from option-distractor statistics, not
   from a third-party answer page, not from a model's best guess. A key is a
   sourced artefact or it does not exist.
6. **P-2 and P-4 ship dark.** Unit-tested, never reachable from the UI.

### 3-0.4 Definition of done for 3-0

- Rules table above encoded as data with per-year citations, and a test asserting
  every paper in the library resolves to exactly one rule version or to "unverified".
- Scoring core passing table-driven vectors for both historical and Category-II
  papers, including the 3-of-4 = 1.5 case and the "wrong option ⇒ 0, not negative" case.
- Eligibility gate returning an empty set over the current corpus, with a test that
  documents _why_ it is empty.
- Key import contract written, with a validator that rejects: unknown question IDs,
  option IDs outside the question, duplicate entries, and keys without provenance.
- Nothing user-visible changes.

### 3-0.5 The decision this cannot defer forever

Phase 3's scored half needs a key, and no amount of engineering produces one. Only
two exits exist:

- **E-1 Obtain a key.** WBJEEB's question-paper archive lists none, and none of the
  supplied booklets contains one. The realistic route is a direct request to
  WBJEEB, or an examination of whether an official "final answer key" was ever
  published for these years. Without that, Phase 3 stays blocked.
- **E-2 Decide the product is reader-only.** Drop scored practice from v1, and
  reallocate Phase 3's effort into Phase 4 (offline and accessibility) and the
  figure layer, which need no key at all.

Sitting between the two is the current state: the reader is good, the practice
engine is unbuildable, and 3-0 is the maximum honest progress available in the
meantime. This is an owner call, recorded in `docs/DECISIONS.md`, not something to
resolve by shipping a guess.

## 3-A — Eligibility pipeline and pure scoring

- Validate question text/options, answer keys, paper/set mapping, categories and marking-rule versions.
- Eligible single-question practice and full-paper mocks have different completeness gates. Never fill a 97-question paper to 100 with fabricated items.
- Store content/key/rule version snapshots per attempt. Later corrections must not silently rewrite historical results.
- Keep scoring independent of UI/storage. Support only documented patterns; historical rules require their own verified definitions.
- Category I baseline: +1 correct; −0.25 wrong or multiple selected; 0 unanswered.
- Category II baseline: 2 for all correct only; proportional credit for a correct subset without wrong selections; 0 for any wrong selection or unanswered.
- Use exact fractional calculations or a documented precision strategy; round for display only.

## 3-B — Session state machine and controls

- Define draft → active → submitted; full timed mocks may additionally expire. Submission must be idempotent.
- Setup shows source/year/pattern, eligible count, duration and key status before starting.
- Correct single/multiple-answer controls, question palette, marked-for-review, clear response, previous/next and submit confirmation.
- Persist answers and timing state without losing an edit during route changes.
- Timed mocks use an absolute deadline, not decrement-only intervals; reload/background/sleep cannot reset time.
- On expiry, preserve answers and finalize exactly once. Local device time is not tamper-proof; no competitive/exam-security claim.
- Prevent conflicting edits from multiple tabs with a session lock or explicit read-only conflict state.

## 3-C — Results and useful revision

- Show score/max, answered/unanswered, correctness/partial credit and subject breakdown.
- Show selected options against verified correct options with per-question mark details.
- Build wrong-answer revision queue; explanations are optional and explicitly unavailable unless reviewed.
- Keep practice history distinct from formal timed mocks; do not produce percentile/rank predictions from local attempts.
- For corrected keys, show provenance/version and a deliberate re-evaluation path if supported; preserve original result context.

## Acceptance scenarios

- Correct Category II subset earns proportional credit; adding one wrong option yields zero.
- Multiple options in Category I are treated as incorrect even if one is correct.
- Refresh, backgrounding and device sleep preserve answers and respect deadline.
- Double-click submit or two concurrent expiry events cannot create duplicate attempts.
- Missing/unverified key blocks scoring with a clear explanation.
- Full mocks are unavailable for incomplete papers; verified practice subsets remain accurately labelled.
- A content update does not silently change an in-progress question or an old score.

## Tests and handover

Table-driven scoring tests for every rule; randomized invariants where useful; fake-clock tests for timing/expiry; integration tests for atomic submission; end-to-end completed and resumed attempts. Provide audited eligible coverage, known exclusions, working preview and build evidence. If data verification prevents completion, mark phase blocked and keep the reader usable rather than claiming full practice readiness.
