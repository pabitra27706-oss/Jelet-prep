# ADR-0003 — Derived answer keys (solved in-house, not official)

- **Status:** **PROPOSED** — not accepted, not implemented
- **Date:** 2026-11-02
- **Proposed by:** Agent, at owner's suggestion
- **Owner decision required:** yes
- **Related:** `docs/phases/03-verified-practice.md` §3-0.5 (E-1 / E-2),
  `docs/LICENSING.md`, `docs/CONTENT-SCHEMA.md` (key import contract),
  `docs/audits/OFFICIAL-PAPER-VERIFICATION.md` §6

## The problem

Phase 3 is blocked because no answer key exists. Eleven official booklets were
inspected and none contains one. The owner's proposal is to **solve the papers
ourselves** and use the resulting key.

This ADR records the proposal, the measured evidence for and against it, and a
design that makes it safe. It does **not** treat "we can solve it" as equivalent
to "the key is correct".

## What the pilot measured

A contiguous 15-question sample was solved from **rendered official pages**
(JELET-2024 pages 3, 11 and 19), not from the transcription. Eight answers were
then checked by machine rather than by confidence.

| Q        | Topic                                  | Answer             | How it was checked                                   |
| -------- | -------------------------------------- | ------------------ | ---------------------------------------------------- |
| 2024 Q1  | orthogonal matrices, det A + det B = 0 | (A) singular       | 20,000 random orthogonal pairs, zero counterexamples |
| 2024 Q2  | rank of 3×3                            | (C) rank = 2       | numeric rank                                         |
| 2024 Q3  | A^K for given A                        | (A)                | matrix identity verified for K = 1…6                 |
| 2024 Q4  | determinant as polynomial in λ         | (C) 21             | numeric determinant                                  |
| 2024 Q41 | dimensions with v, t, F basic          | (B) FTv⁻¹          | dimensional algebra                                  |
| 2024 Q42 | projectile speed–time graphs           | (A)                | figure reasoning                                     |
| 2024 Q43 | refraction, λ₁ vs λ₂                   | (B)                | Snell + λ ∝ 1/n                                      |
| 2024 Q71 | atoms in 52 g He                       | (C) 7.829×10²⁴     | arithmetic                                           |
| 2024 Q72 | electron filling order                 | (A) Aufbau         | definitional                                         |
| 2024 Q73 | He⁺ most probable radius               | (C) 26.5 pm        | arithmetic                                           |
| 2024 Q74 | NaCl unit cell                         | (C) 144 pm         | arithmetic                                           |
| 2024 Q75 | electrons from 1 A × 10 min            | (A) 3.75×10²¹      | arithmetic                                           |
| 2024 Q76 | phenol + bromine water                 | (D)                | standard reaction                                    |
| 2024 Q77 | stereoisomers of 2,3-dibromobutane     | (B) 3 (incl. meso) | stereochemistry                                      |

15/15, eight of them independently machine-verified.

**This sample is biased and must be read as such.** It was drawn from pages that
are almost entirely text-based, deliberately avoiding figure-dependent questions.
It shows the method works on the easy majority; it says nothing about the hard
tail. It is not evidence for "99%".

## Honest assessment of "99% will be easy"

The corpus has **690 questions**. Breaking it down by difficulty of keying:

| Bucket                                 | Count                            | Difficulty                                                                                                 |
| -------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Text-only, single-answer (Category-I)  | ~570                             | Genuinely solvable; the pilot's domain                                                                     |
| Multi-answer (Category-II)             | 45 (15 each in 2022, 2024, 2025) | Harder: every option must be adjudicated, and "one or more correct" punishes missing a second right answer |
| Figure-dependent                       | 72                               | **Cannot be solved until the figure exists** — blocked on the ADR-0002 redraw work                         |
| Already missing from the transcription | 5 (2022 Q86–90, now recovered)   | Solvable from the official page, needs a corpus fix first                                                  |

So roughly **80%** is the easy bucket, not 99%. Realistic expectation for a single
careful pass: high 80s to low 90s percent. With an independent second pass and
disagreement triage: mid-to-high 90s. **99% as a first-pass claim is optimism, and
shipping on optimism is exactly how a student learns a wrong answer with
confidence.**

### The failure modes that actually bite

1. **Answering a different question than the paper asked.** The transcription is
   not verbatim. 2024 Q6's text is visibly garbled. If you solve the transcription,
   you may solve a problem the examiner never set. **Mitigation is non-negotiable:
   key from the official page render, then map to the corpus question, and flag any
   mismatch instead of silently adopting either.**
2. **Category-II under-marking.** "One or more correct" means a single missed
   second answer turns a right response into a wrong one. Highest-risk bucket.
3. **Qualitative disputes.** Some chemistry and "which statement is true" items
   have defensible competing answers. A key needs an adjudication path, not a
   coin-flip.
4. **Silent drift.** If a key is edited later, historical scores must not move.
   Already required by §3-A, and it matters more, not less, once the key is ours.

## Proposal: a tiered evidence model instead of a binary gate

The current design treats "verified key" as binary, which is why it blocks
everything. Replace it with explicit tiers, and let the product use only the top
ones while labelling honestly.

| Tier                  | Meaning                                                | Scoreable?                                                             |
| --------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `official`            | Publisher-issued key                                   | Reserved — **none exist for these years**                              |
| `derived-verified`    | Machine-verified, **or** two independent solvers agree | **Yes**, labelled "solved by this project, not an official WBJEEB key" |
| `derived-provisional` | One solver, not cross-checked                          | No — may be shown as a hint only if explicitly unlocked                |
| `disputed`            | Solvers disagree, or ambiguity unresolved              | No — excluded, listed for review                                       |

Three properties make this safe rather than a shortcut:

- **`official` stays empty and visibly empty.** Nothing is relabelled as official.
- **The weak tiers cannot score.** The eligibility gate already specified in
  §3-0.2 (P-4) enforces this in code, and its test currently asserts an empty
  eligible set. That test changes only when real keys exist.
- **Every key record carries its evidence.** Which tier, which method, who solved
  it, the official page cited, and the date. A key without evidence is
  `derived-provisional` by definition.

## Rights: this is the one part that gets _clearer_

`docs/LICENSING.md` records that the question text's redistribution status is
unresolved. **A key we solve is our own work product** — it is not copied from
WBJEEB or from any third-party answer site. It is arguably the cleanest asset in
the whole project. That is a real argument in favour of the owner's proposal, and
it is not the usual one.

Third-party keys (testbook, aglasem and similar) must **not** be used as the
source of a key. They are unverified, frequently wrong, and often compiled from
someone else's work. They may be consulted only as a _disagreement trigger_ — if a
third party disagrees with our solved answer, that question gets re-examined.
Consulting them is not copying them.

## Cost

The pilot ran at roughly a question a minute including verification, on easy
material. A full paper is ~100 questions; the hard buckets will be slower.

| Scope                       | Rough effort                    | What it unblocks                            |
| --------------------------- | ------------------------------- | ------------------------------------------- |
| One paper, keyed end to end | 2–4 focused sessions            | Phase 3 scoring, minimally and legitimately |
| All 7 papers                | Several weeks of part-time work | A genuinely complete product                |

**Figures are a prerequisite, not a parallel track.** The 72 figure-dependent
questions cannot be keyed until their figures exist, so ADR-0002's redraw work
must precede keying for that bucket.

## Recommended first paper: 2022

Not 2024 or 2025. Reasoning:

- **Fewest figure blockers: 4** (against 13 in 2025 and 18 in 2024).
- Its 5 transcription gaps (Q86–90) are already recovered from the official p. 21,
  so it can be made complete in one step.
- It is a 120-mark Category-II paper, so it exercises the harder marking rules —
  proving the pipeline on the paper least able to flatter it.

2025 is the alternative if a clean 100/100 corpus matters more than figure count.

## Consequences if accepted

- Phase 3's scoring half stops being blocked on something that cannot be obtained.
- The project takes on **accuracy liability it can no longer attribute to a
  publisher.** A wrong official key is the publisher's error; a wrong derived key is
  ours. This is the real cost and it is not small.
- A correction route becomes mandatory and must be visible: a student must be able
  to report a wrong key, and the report must be able to change the key without
  rewriting anyone's past score.
- The word "verified" in the UI must mean _our_ verification, with the method
  stated. It must never imply WBJEEB endorsement.

## What would make me withdraw this proposal

- If a WBJEEB key turns out to exist for any of these years, `official` wins for
  that paper and derived keys are only a fallback.
- If the owner is unwilling to accept third-party-facing accuracy liability for
  self-authored answers, this is a "no" regardless of effort.

## Decision

**Not made.** This ADR stays `PROPOSED` until the owner accepts or rejects it.
Until then Phase 3 remains blocked and no key of any tier exists in the repository.
