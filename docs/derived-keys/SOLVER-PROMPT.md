# Solver prompt — generating a derived answer key

Status: ready to use. Supports `docs/decisions/ADR-0003-derived-answer-keys.md`.

This is the prompt to hand to a chatbot (Gemini, ChatGPT, Claude, etc.) when asking
it to solve JELET questions. It exists because an open-ended "solve this paper"
request produces confident answers with no evidence, no ambiguity handling, and no
audit trail — which is exactly the failure mode ADR-0003 identifies.

Three prompts:

- **Prompt A** — solve one page. The workhorse.
- **Prompt B** — attack one answer. Use when A's answer is disputed.
- **Prompt C** — cross-check an existing key. Use to verify our own records.

---

## Prompt A — solve one page

Copy everything in the block below. **Attach the page image.** Do not paste our
transcription: the corpus is not verbatim, and a model handed garbled text will
answer a question the examiner never set.

```text
You are producing a verifiable answer key for a West Bengal JELET question paper.
Accuracy matters far more than completeness, and saying "I cannot determine this"
is a correct answer.

STEP 0 — IDENTIFY YOURSELF
Your reply must begin with exactly one line in this form:
SOLVER: <your model name and version> | <today's date> | input: page image

Do not skip this line. Do not guess your name; state it as you know it.

STEP 1 — READ FROM THE IMAGE ONLY
The attached image is one page of the official JELET booklet. Read the questions
from the image. Do not consult, reconstruct, or "correct" anything from memory of
similar papers. If the image text and your expectations disagree, the image wins.

STEP 2 — ESTABLISH THE MARKING RULES
State the paper type you infer from the page header:
- Category-I: exactly one option correct. Score +1, -1/4 for wrong or for marking
  more than one.
- Category-II: one OR MORE options correct. Score = 2 x (number marked correct) /
  (actual number correct), only if no wrong option is marked. A single wrong option
  scores zero.
If the page does not state the category, say so and infer from the section header.

STEP 3 — SOLVE, ONE QUESTION PER BLOCK
For every question on the page, output this exact structure:

  Q<number> [<Category-I | Category-II>]
  ANSWER: <A> | <A, C> | <A, B, C> | UNDETERMINED | AMBIGUOUS
  CONFIDENCE: high | medium | low
  REASONING: 1-3 sentences. Show the actual step — the formula, the substitution,
    the definition applied. Never write "by standard result" or "it is known that".
  VERIFICATION: how the answer can be independently checked
    (e.g. "compute determinant", "dimensional analysis", "numerical search",
    "check 3 random cases"). If nothing can check it, write "none".
  FIGURE: none | read from image | unreadable

STEP 4 — HANDLE THE HARD CASES HONESTLY
These are rules, not preferences.

  a) FIGURE QUESTION: if the question depends on a diagram, describe the diagram
     in one sentence before answering, so a human can catch a misread. If you
     cannot read the figure clearly, output ANSWER: UNDETERMINED and say what is
     unclear. Never invent a plausible geometry.

  b) CATEGORY-II: you must adjudicate EVERY option A, B, C and D individually.
     Add a line per option:
       (A) true  - reason
       (B) false - reason
       (C) true  - reason
       (D) false - reason
     Do not stop at the first correct option. A missed second correct answer is
     the most common Category-II error.

  c) TWO DEFENSIBLE ANSWERS: if more than one option could be defended, output
     ANSWER: AMBIGUOUS, list every defensible option, and explain why the paper is
     unclear. Example shape: "value is [abc]^2 so (C); but (D) 'zero if coplanar'
     is also a true statement, so the intended answer is not determinable."

  d) GARBLED OR DAMAGED TEXT: if a symbol, exponent or option is unreadable,
     output ANSWER: UNDETERMINED and name the unreadable part. Do not repair it
     with a likely guess.

STEP 5 — DO NOT DO THESE
  - Do not search the web for an answer key, and do not use answers from testbook,
    aglasem, freshersnow or similar sites. They are unverified and often wrong.
  - Do not answer the whole paper at once. One page per reply keeps accuracy up;
    a 100-question dump degrades badly after the first few pages.
  - Do not give an answer you cannot justify in one sentence of real working.
  - Do not claim an answer is "verified" or "official". You are producing a
    derived answer, not a publisher's key.

STEP 6 — MACHINE-READABLE SUMMARY
After all question blocks, output a single JSON array and nothing else after it:

[
  {"q": 41, "category": "I",   "answer": ["B"],      "tier": "derived-provisional", "confidence": "high",   "figure": "none"},
  {"q": 66, "category": "II",  "answer": ["A","C"],  "tier": "derived-provisional", "confidence": "medium", "figure": "none"},
  {"q": 42, "category": "I",   "answer": [],         "tier": "disputed",            "confidence": "low",    "figure": "unreadable"}
]

Tier rules for the JSON:
  - "derived-provisional" = you produced a definite answer with reasoning.
  - "disputed"            = AMBIGUOUS or UNDETERMINED, or confidence is low.
  Nothing you output may ever be tiered "official". No official key exists.
```

---

## Prompt B — attack one answer

Use this when a human or another model disagrees with an answer. The point is to
attack the reasoning, not to re-run the same question hoping for a different
letter.

```text
You are reviewing a single answer for a JELET question key. Your job is to try to
break it, not to agree with it.

Begin with: REVIEWER: <your model name and version> | <today's date>

The question (from the attached official page image, question number <N>):
<copy the question text from the image, or describe the figure>

The proposed answer: <answer>
The reasoning offered: <reasoning>

Do the following, in order:
1. Restate what the question is actually asking, in one sentence.
2. Check the reasoning for a specific defect: wrong formula, sign error, wrong
   convention, misread figure, or an assumption that is not stated.
3. Solve it independently, without looking at the proposed answer while working.
4. State whether you agree, disagree, or consider it ambiguous.
5. If you disagree, give the answer you believe correct and the single check that
   would settle the dispute (an arithmetic computation, a specific substitution, a
   measurement from the figure).

If the reasoning and the conclusion disagree with each other, say so explicitly —
that is the most valuable thing you can find.
```

---

## Prompt C — cross-check an existing key

```text
Begin with: CROSSCHECK: <your model name and version> | <today's date>

Attached is one page of an official JELET booklet, and the answers this project has
recorded for it.

Recorded answers:
<list, e.g. 41:B  42:A  43:B  ...>

For each question, output one line:
  Q<n>: AGREE | DISAGREE | CANNOT-CHECK  - <one sentence of actual working>

Rules:
- Solve from the image yourself before comparing. Do not reason backwards from the
  recorded answer to justify it.
- "CANNOT-CHECK" is expected for figure questions you cannot read clearly. Use it
  instead of guessing.
- If the recorded answer and your reading of the figure differ, say which part of
  the figure you read differently. That is the useful output.

End with a single line listing only the question numbers where you DISAGREE.
```

---

## What to send back

Only these need action:

| Output           | What it means             | What happens                                                         |
| ---------------- | ------------------------- | -------------------------------------------------------------------- |
| `DISAGREE` lines | A real conflict           | Goes to Prompt B, then human review                                  |
| `AMBIGUOUS`      | The paper is unclear      | Enters the `disputed` list, stays unscored                           |
| `UNDETERMINED`   | Figure or text unreadable | Stays a placeholder; needs a better scan or a redraw                 |
| `AGREE`          | Corroboration             | Raises confidence; does **not** by itself make it `derived-verified` |

## The limits of this prompt

- **It reduces error; it does not eliminate it.** Two models sharing training
  lineage share systematic errors too. Agreement is corroboration, not proof.
- **It cannot fix a bad scan.** If the page image is unreadable, the answer should
  be `UNDETERMINED`, and no amount of prompting changes that.
- **It produces a `derived` key, never an `official` one.** The tier rules in
  Prompt A's JSON make that explicit, and the eligibility gate in
  `docs/phases/03-verified-practice.md` §3-0.2 refuses to score the weak tiers.
- **One page per request.** A whole-paper request produces fluent answers whose
  accuracy falls off sharply after the first few pages.

See also: `docs/decisions/ADR-0003-derived-answer-keys.md` (the decision and its
evidence), `docs/audits/OFFICIAL-PAPER-VERIFICATION.md` §9 (verified marking rules).
