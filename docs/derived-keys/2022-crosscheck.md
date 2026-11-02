# JELET-2022 Paper-I — second-solver cross-check

Date: 2026-11-02
Companion to [`2022.md`](2022.md) and [`2022-keys.json`](2022-keys.json).

## What this is

Our first pass solved all 100 questions from the official page images. A second,
independent solver (**Gemini 1.5 Pro**) was given the same page images, no access
to our answers, and asked to solve the whole paper. Its output was diffed against
ours question by question.

Raw result: **74 agree, 26 disagree, 0 undetermined-by-both.**

Every disagreement was then re-adjudicated by re-reading the printed page. The
page decides, never the vote — a two-solver majority would have made Q1 and Q6
"undetermined" and Q49 wrong.

## Outcome

|                                                          | Count      |
| -------------------------------------------------------- | ---------- |
| Agreed outright                                          | 74         |
| Disagreement — **we were wrong, corrected**              | 15         |
| Disagreement — **we were right, second solver wrong**    | 11         |
| Second solver claimed a print defect that does not exist | 2 (Q1, Q6) |

After adjudication: **79 `derived-verified`, 19 `derived-provisional`, 2 `disputed`.**

Sixteen of the original 26 disagreements were _not_ disagreements about physics.
They were option-letter errors or graph-reading errors, ours or theirs.

## We were wrong — 15 corrections

| Q   | Was   | Is        | Why we were wrong                                                                                                                                                 |
| --- | ----- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9   | A     | **C**     | e = c/a = 3/2. We computed 3/2 correctly and then ticked "2".                                                                                                     |
| 13  | A     | **B**     | Work = F·AB = 6. We ticked √6, the _magnitude_, not the work.                                                                                                     |
| 18  | A     | **C**     | 3x² = 3 gives x = +1 **and** −1; both lie on the curve. We wrongly restricted to the open interval and reported one point. The question does not say "between".   |
| 31  | A,B,D | **A,B**   | Option (B) is printed "3 for λ ≠ 0, 2, −1" — the ≠ _is_ there. We read it as "=". (D) is false.                                                                   |
| 32  | A     | **A,B**   | The determinant vanishes when a+b+c = 0 **or** a = b = c. We dropped the second condition.                                                                        |
| 39  | A     | **A,B**   | √2·arcsin u and −√2·arccos u differ by a constant, so both antiderivatives are valid.                                                                             |
| 44  | D     | **A**     | F = 2αx/R ∝ x. Our reasoning said "proportional to x"; the letter said "independent of x". Straight contradiction between our own fields.                         |
| 56  | D     | **C**     | μ = cot(A/2) ⇒ δm = 180° − 2A ⇒ cos δm = −cos 2A. We solved for sin instead of cos.                                                                               |
| 61  | —     | **C**     | Momentum forces v′ = 2√3 while **both** printed speed options read √3, so KE must decide it: 18m → 12m, KE decreases. Now solved, no longer disputed.             |
| 69  | C     | **A,C**   | Lens at u = 30, f = 15 → I₁ 30 cm behind lens = 20 cm behind mirror (virtual object, C true). Mirror returns I₂ 10 cm left of lens (A true). We had missed (A).   |
| 77  | —     | **C**     | Bohr needs exactly one electron. Li²⁺ qualifies; H⁺ and He²⁺ have none and Li⁺ has two. Print is fine; our dispute was unjustified.                               |
| 90  | B,C   | **B,C,D** | CaCO₃ has covalent C–O bonds inside the carbonate ion. We treated it as purely ionic.                                                                             |
| 93  | D     | **A**     | Slip > 1 needs N < 0, i.e. the point **left** of the vertical axis — that is W, not Z. We answered the right physics against the wrong label.                     |
| 98  | A     | **C**     | Reading the drawing: A in series, then [(B+C) ∥ ((D+E)·F)], then G. Option (A) transposes the two parallel branches.                                              |
| 17  | —     | **D**     | Both solvers independently reach (D) under the strict reading: f(a)=f(b) forces 0 into the open interval, where \|x\| has no derivative. Promoted out of dispute. |

## We were right — 11 rejections

| Q   | Ours     | Claimed      | Reason for rejecting                                                                                                                                                                                        |
| --- | -------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15  | C        | B            | Its own working concludes (C) — x = 1 gives 15 = 15 — while its label says (B). Label error.                                                                                                                |
| 25  | D        | B            | Its working totals 22/3, which is (D). Label error.                                                                                                                                                         |
| 27  | A        | B            | It derives x = e^{1−tan(y/x)}, which is (A). Label error.                                                                                                                                                   |
| 29  | A        | B            | It derives 16/72 = 2/9, which is (A). Label error.                                                                                                                                                          |
| 40  | disputed | A            | Its algebra divides y·dy by y² to obtain y·dy = y²·dy — invalid. Correct value 4.97 matches no option. Dispute stands.                                                                                      |
| 48  | D        | undetermined | It called this undetermined because the options omit the square root. That is a real print defect, but 4mg/((2m+M)R) **is** option (D)'s expression, so (D) is what the examiner intended. Defect recorded. |
| 49  | D        | C            | It chose a semicircle that returns to zero. \|V\| = 2Gm/√(x²+a²) decays asymptotically, never reaching zero — panel (D). It misread the graph.                                                              |
| 59  | disputed | D            | Its derivation contradicts itself twice in one paragraph and lands on no consistent value. No option gives 25 cm. Dispute stands.                                                                           |
| 62  | C        | A            | The V–T cycle needs a curve, a horizontal and a vertical. Only panel (C) has all three. It mentions the isotherm in its note and still picks (A).                                                           |
| 1   | A        | undetermined | It reported the matrices as incompatible shapes. Both are printed as complete 3×3 matrices on page 3.                                                                                                       |
| 6   | D        | undetermined | It reported the determinant with two rows. All three rows are on page 4.                                                                                                                                    |

## What this cross-check is worth

- **It found 15 real errors in a key that had already been self-reviewed and
  machine-checked.** Every one was reviewed by us against the page.
- **It is not an authority.** It produced 11 wrong claims, including two invented
  print defects and five cases of a wrong answer label over correct working.
- **Agreement is now the promotion criterion**, but only alongside a machine check
  or a page re-read. Nothing was promoted on agreement alone.

## Effect on the process

1. **A second solver is worth the cost** — 15% error correction on a paper that
   one careful pass had already "finished". Keep it in the protocol.
2. **Diff the _labels_, not the reasoning.** Most disagreements were letter-level.
3. **Never let two solvers outvote the page.** Q1, Q6, Q49 and Q62 would all have
   gone the wrong way on a majority rule.
4. **A solver self-correcting mid-answer is a signal to re-read the page**, not a
   reason to prefer its final figure.

---

# Third pass — DeepSeek-V3, 2026-11-02

## What was different about this input

The third solver's own STEP 1 records that it was given **a text extraction, not
page images**. That immediately demotes it: four of the six questions it
declared "undetermined" (Q5, Q6, Q7, Q10, Q11, Q47) were unanswerable because its
input had lost the matrices and option lists, not because the paper is broken.

It also **mis-identified the paper's structure**, reporting that "Q1–Q85 appear
to be Category-I" and answering Q31–Q40 with single letters. The page reads
`Category-II (Q 31 to 40) — one or more options are correct`. That one structural
error accounts for six of its disagreements at a stroke.

Result: **75 agree, 25 disagree** — but of the 25, six are input failures, and
seven are second-options missed for the Category-II reason.

## We were wrong — 2 corrections

| Q   | Was | Is          | Why                                                                                                                                                                                                                                                                                                            |
| --- | --- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 27  | A   | **B**       | Option (B) is printed x = e^{1−tan(y/x)} — exactly what our own reasoning derived. We wrote the right formula and ticked the wrong letter. Third instance of this same failure in this key.                                                                                                                    |
| 69  | A,C | **A,B,C,D** | The second lens pass treats I₂ (10 cm left of the lens) as a **virtual** object: 1/v = 1/15 + 1/10 = 1/6 gives the final image 6 cm left of the lens, i.e. **16 cm from the mirror**. Option (B) prints 16 cm — a number reachable only that way, which is the setter's own arithmetic confirming (B) and (D). |

## Two disputes withdrawn — our derivations were wrong, not the paper

| Q   | Was      | Is       | Why                                                                                                                                                                          |
| --- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 40  | disputed | **A, C** | Correct solution is x = 2y − y², so y(−3) = 3 **or** −1. Q40 is Category-II, so two options is legal. The old note's value 4.97 came from a mis-integration (x = y(1−ln y)). |
| 59  | disputed | **C**    | 1/F = 1/f_lens + 1/f_liquid = (2−μ)/10 = 1/25 gives μ = 1.6 exactly. The old note used the doubling convention, which cannot produce 25 cm for any option.                   |

**The key now has no disputed questions.** Both disputes were my arithmetic error
wearing a defect label — worth remembering next time a question "has no correct
option".

## Upheld — 12 rejections

| Q                   | Ours  | Claimed      | Reason for rejecting                                                                                                          |
| ------------------- | ----- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 5, 6, 7, 10, 11, 47 | keyed | undetermined | Its text dump lost the matrices and option lists. All six are legible on pages 3–5 and 12.                                    |
| 31                  | A,B   | B            | Missed (A): rank is 2 exactly at λ = 0.                                                                                       |
| 32                  | A,B   | A            | Its own prose says "both (A) and (B) are correct… I'll choose (A)".                                                           |
| 33                  | A,C   | C            | Both x/y + y/x = 2cos(θ−φ) and xy + 1/xy = 2cos(θ+φ) hold.                                                                    |
| 34                  | A,C   | A            | (√5+1)/2 ≈ 1.62 is also "less than 2".                                                                                        |
| 35                  | B,C   | B            | a×(b×c) is coplanar with b, c **and** perpendicular to a.                                                                     |
| 36                  | A,B,D | D            | y is defined for all x, continuous at 0, and dy/dx = 1/3 for x < 0.                                                           |
| 37                  | A,D   | A            | Both y = x+5 and y = x−5 are tangents; its own prose says so then picks one.                                                  |
| 38                  | C,D   | D            | f is continuous at the origin as well as having both partials zero.                                                           |
| 39                  | A,B   | A            | −√2·arccos u differentiates to the same integrand.                                                                            |
| 62                  | C     | D            | Panel (D) draws the isotherm as a straight line. Only (C) has a horizontal isobar, a vertical isochore and a curved isotherm. |
| 64                  | C     | D            | v ∝ R√ρ: R_W = 9^(1/3)R_P ≈ 2.08 R_P beats R_Q = 2R_P, so V_W > V_Q > V_P.                                                    |

Q18 was flagged again (it says (A), we key (C)) and Q100 (it says (A), we key
(B)). Both were re-read on the page and both stand; see the notes in the JSON.

## What three passes have shown

1. **Agreement between solvers is not evidence.** The only two corrections this
   pass produced came from _disagreement_; the 75 agreements included items both
   of us could have had wrong.
2. **Option-letter errors are the dominant failure mode** — 17 in total across
   three passes, almost all with correct physics behind them.
3. **A solver fed text instead of page images degrades in a specific way**: it
   invents "unreadable" and it misreads the paper's category structure. It also
   still found two real errors, so it was worth running.
4. **A question with "no correct option" is more likely my error than the
   paper's.** Both disputes dissolved under a re-derivation.
