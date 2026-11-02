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

| Q        | Topic                                  | Answer               | How it was checked                                    |
| -------- | -------------------------------------- | -------------------- | ----------------------------------------------------- |
| 2024 Q1  | orthogonal matrices, det A + det B = 0 | (A) singular         | 20,000 random orthogonal pairs, zero counterexamples  |
| 2024 Q2  | rank of 3×3                            | (C) rank = 2         | numeric rank                                          |
| 2024 Q3  | A^K for given A                        | (A)                  | matrix identity verified for K = 1…6                  |
| 2024 Q4  | determinant as polynomial in λ         | (C) 21               | numeric determinant                                   |
| 2024 Q41 | dimensions with v, t, F basic          | (B) FTv⁻¹            | dimensional algebra                                   |
| 2024 Q42 | projectile speed–time graphs           | (A)                  | figure reasoning                                      |
| 2024 Q43 | refraction, λ₁ vs λ₂                   | (B) — **see Errata** | Snell + λ ∝ 1/n; figure re-read at 500 dpi 2026-11-02 |
| 2024 Q71 | atoms in 52 g He                       | (C) 7.829×10²⁴       | arithmetic                                            |
| 2024 Q72 | electron filling order                 | (A) Aufbau           | definitional                                          |
| 2024 Q73 | He⁺ most probable radius               | (C) 26.5 pm          | arithmetic                                            |
| 2024 Q74 | NaCl unit cell                         | (C) 144 pm           | arithmetic                                            |
| 2024 Q75 | electrons from 1 A × 10 min            | (A) 3.75×10²¹        | arithmetic                                            |
| 2024 Q76 | phenol + bromine water                 | (D)                  | standard reaction                                     |
| 2024 Q77 | stereoisomers of 2,3-dibromobutane     | (B) 3 (incl. meso)   | stereochemistry                                       |

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

## Second pilot batch — Category-II multi-answer (2026-11-02)

The first batch was all easy single-answer items, which proved little about the hard
tail. This batch is drawn from JELET-2024 Category-II (page 9), where _one or more_
options are correct and every option must be adjudicated separately.

| Q        | Topic                                 | Answer                                 | Verification                                              |
| -------- | ------------------------------------- | -------------------------------------- | --------------------------------------------------------- |
| 2024 Q31 | A² = A, A + B = I                     | **A, B, C**                            | 3,000 random idempotents: B² = B, AB = 0, BA = 0 all held |
| 2024 Q32 | 3×3 matrix, three rows equal at x = a | **A, B**                               | see note below                                            |
| 2024 Q33 | iZ² − Z̄ = 0, values of \|Z\|          | **A, B** (0 and 1)                     | numerical sweep found exactly {0, 1}                      |
| 2024 Q34 | rectangular hyperbola                 | **A, D**                               | reasoning only — definition plus a = b                    |
| 2024 Q35 | \[a×b, b×c, c×a\]                     | **C** (and D is also a true statement) | identity verified on 20,000 random triples                |

### Q32 — the (x−a)² result, and why it is not obvious

Write each row as rᵢ(x) = v + (x−a)uᵢ(x), which is forced by the three rows being
equal to v at x = a. Expanding the determinant by multilinearity, any term keeping
two or more copies of v has two equal rows and vanishes. The surviving terms carry
at least two factors of (x−a). **Therefore (x−a)² always divides det(A)** — (B) is
true — and (x−a)³ sometimes but not always does, so (C) is false. Since (x−a)²
dividing implies (x−a) divides, (A) is _also_ a true statement, giving A and B.

A careless solver marks (B) alone because it is the "interesting" one. This is a
real, measured instance of the under-marking failure mode described above, and it
was resolved by expanding symbolically rather than by choosing the tidier answer.

### Q35 — a question with two defensible answers

The value is [a b c]², so (C). But (D) — "0 if a, b, c are coplanar" — is also a
true statement, because [a b c] = 0 in that case. Whether the examiner wanted (C)
alone or both is not decidable from the paper. **This is exactly the `disputed`
tier:** it must not be silently resolved by an agent's preference. It goes to
review, and until then it cannot score.

Two ambiguous items out of five in the hardest bucket is the sobering number. It is
also the strongest argument for the tiering proposal: a system with only
"verified / not verified" would either drop these questions silently or guess.

## Errata — 2024 Q43 (corrected 2026-11-02)

The first pass recorded this answer as **(C)**. That was wrong, and it was wrong
for an instructive reason rather than a slip.

The reasoning offered was "bends toward normal ⇒ n₂ > n₁ ⇒ λ₂ < λ₁ ⇒ (C)". The
premise is what fails. On re-reading the figure at 500 dpi, the refracted ray in
medium 2 stands **further from the normal** than the incident ray in medium 1, so
n₂ < n₁ and λ₂ > λ₁, which is option **(B)**, λ₂ = (sin α₂ / sin α₁) λ₁.

Two things follow, and the second matters more than the first.

1. **The wrong answer came from a misread figure, not a misremembered formula.**
   The optics reasoning was sound; the input was wrong.
2. **The answer does not depend on reading the figure at all.** Whatever the drawn
   angles, (B) is the only option consistent with Snell's law; (C) is its
   reciprocal, and (A) and (D) are inconsistent with a ratio of sines. This
   question was answerable with certainty from the options alone, and the figure
   only supplies confidence.

That is exactly the error class being risked at scale if a key is produced by one
pass. It was caught because the figure was re-examined at higher resolution and
because the reasoning was written down where it could be attacked. A key produced
from remembered conclusions would have shipped it.

It also sets a firm rule for the derived-key work: **a stated answer must record
how it was reached**, so a later checker can attack the reasoning rather than
compare two letters.

## Can third-party chatbots (Gemini, ChatGPT, etc.) be used to solve the papers?

**Yes — as independent solvers, never as the authority.** The owner asked this
directly. The answer is a qualified yes, and the qualifications are the whole
point.

### Where chatbots genuinely help

A second model that has not seen the first model's answer is a real cross-check.
It catches exactly the failure this record already contains one of: a confident,
well-reasoned, wrong answer (2024 Q43, see Errata). Two independent wrong answers
rarely coincide; one wrong answer repeated confidently looks like agreement.

### Four things that make naive chatbot use dangerous

1. **They must be given the page image, not the transcription.** The corpus is not
   verbatim and 2024 Q6's text is visibly garbled. A model handed garbled text will
   answer a question the examiner never set, fluently and with citations. This is
   the single biggest risk and it is caused by _our_ input, not the model's ability.
2. **Agreement is not verification.** Two chatbots frequently share training
   lineage and share the same systematic errors — the same sign slip, the same
   convention, the same misremembered constant. Correlated error survives an
   agreement test that independent solvers would fail. Agreement raises confidence;
   it does not establish correctness.
3. **No audit trail, no reproducibility.** A chat answer is not a record. The same
   question asked twice can produce different letters, and there is nothing to
   attach to the key record. Provenance is required per the schema.
4. **Figures are the usual failure point.** Asked about a diagram described in
   text, a model will invent a plausible geometry — which has already happened
   here once (Q43). Models given the actual image re-rendered at 300–500 dpi do
   much better, which is why the render step is mandatory.

### The protocol this proposes

A question earns `derived-verified` only if all of the following hold:

1. **Solved from the official page image**, not from `pyq-md/`, and the page number
   is recorded.
2. **The reasoning is written down**, per the Errata rule — a conclusion without a
   derivation is not reviewable and counts as `derived-provisional`.
3. **Machine-checked where the question permits it** (arithmetic, matrix identity,
   algebraic identity, numerical search). This beats opinion regardless of how many
   models were consulted.
4. **Two independent solvers agree** where machine-checking is impossible. A human
   and a model count as independent; two instances of the same model do not.
5. **Disagreement ⇒ `disputed`, never a vote.** Q35 above is the worked example:
   two defensible answers, neither provable, so it goes to review and stays
   unscored.

### A caution about who is verifying whom

The agent writing this is one of the solvers, so its own recommendation to use a
second, different model should be read as self-limiting rather than self-serving.
Its advantage in this repository is not superior reasoning — it is that it can
render the official PDF at 500 dpi, run verification code, and commit the record
with provenance attached. A browser chatbot can produce the reasoning but leaves
none of that behind.

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
