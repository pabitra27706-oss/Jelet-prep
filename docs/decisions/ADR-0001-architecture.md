# Architecture decision record (Phase 0-B)

Status: accepted as reversible implementation decisions, 2026-11-02. These are
engineer decisions with evidence, not product decisions that need owner approval.
Anything that could change what students see, pay for, or what leaves the device
stays an owner question and is listed separately.

---

## ADR-001 — Single-page React/TypeScript app built by Vite, statically hosted

**Context.** The repository already ships content (Markdown + a legacy CDN-based
HTML reader) and must reach students on cheap phones over unreliable networks.

**Decision.** React 19 + TypeScript + Vite, output as static files, no server.

**Alternatives.** (a) Extend `pyq-index.html` with vanilla JS — smallest runtime,
but no types, no test tooling, and the legacy reader is kept only as a preserved
reference. (b) Next.js/SSR — needs a Node server or a hosting-specific runtime and
buys nothing for an app with no per-request personalisation. (c) Preact/Svelte —
smaller bundles, but React's ecosystem (axe tooling, testing) and the team's
existing Phase 1 code outweigh the size difference at this scale.

**Consequences.** No backend means no accounts, sync, or server-side scoring,
which matches the approved product boundary. Rollback cost: low — the content
files are independent of the framework.

**Evidence.** Phase 1/2 builds and tests pass; production bundle is static
(`dist/`), deployed by GitHub Actions to Pages.

---

## ADR-002 — Hash routing instead of clean paths

**Context.** GitHub Pages serves the app from `/Jelet-prep/` and cannot rewrite
unknown paths to `index.html` for a client-side router.

**Decision.** Routes live in the URL hash (`#/papers/2024?q=7`) with
`base: "./"` relative asset paths.

**Alternatives.** History API + `404.html` redirect hack (fragile, loses the
query string on refresh), or a host with SPA rewrites (changes hosting).

**Consequences.** Refreshing or sharing a deep link works on any static host at
any sub-path. Cost: links contain `#`, which some social previews strip. Rollback
cost: medium — every internal link is built through `src/ui.tsx` `Link`, so a
future move to clean paths is one component plus a host decision.

---

## ADR-003 — KaTeX, locally bundled, behind a maths-protection pass

**Context.** The corpus uses LaTeX inline (`\(…\)`), display (`\[…\]`) and dollar
forms. A CDN maths script would break offline, leak requests, and is disallowed by
the quality policy.

**Decision.** KaTeX 0.19.1 with locally bundled fonts. Maths spans are extracted
_before_ Markdown parsing, rendered, then re-inserted, and the result is
sanitised by DOMPurify.

**Alternatives.** MathJax (heavier initial payload, slower first paint, CDN-first
in the legacy reader); server-side rendering (no server); plain-text formulas
(loses matrices and cases).

**Consequences / evidence.** `src/render.test.ts` renders **every extracted
question** in all seven papers (690 questions) without throwing and without
leaking placeholder tokens; matrices, vectors, `cases`, integrals and
superscripts are exercised explicitly; unsupported syntax shows a visible
fallback rather than vanishing. KaTeX is MIT; its fonts are SIL OFL and ship
their own notices (see DEPENDENCIES.md).

**Rollback cost.** Low: one module (`src/Markdown.tsx`) and one dependency.

---

## ADR-004 — Sanitise rendered content, render only repository content

**Decision.** `marked` → `DOMPurify` with an HTML+MathML profile; no raw HTML from
users anywhere. Notes are plain text and are never parsed as Markdown. Imported
backup JSON is validated field by field and never rendered as HTML.

**Evidence.** `src/render.test.ts` asserts that `<script>`, `onerror` and
`javascript:` URLs are removed; `src/study/backup.test.ts` rejects foreign record
shapes before any write.

---

## ADR-005 — Derived content IDs, versioned storage, explicit migrations

**Decision.** Paper/question/topic IDs are derived from the exam year and original
question number, not array positions. `CONTENT_VERSION` names the ID space;
`src/study/ids.test.ts` pins a SHA-256 of the corpus so an unreviewed content edit
fails tests. Local data lives in IndexedDB `jelet-prep-study` v1 with an ordered
migration map, one transaction per mutation, and commit-only success reporting.

**Rationale and full contract.** See `docs/STUDY-DATA.md`.

**Consequences.** Adding a paper or topic never renumbers an existing bookmark.
Removing content surfaces an orphan list instead of deleting student notes.

---

## ADR-006 — No runtime dependency for storage, testing only

**Decision.** Use IndexedDB directly through `src/study/db.ts` rather than adding
`idb`/Dexie. `fake-indexeddb` (Apache-2.0) and `@types/node` are development-only.

**Alternatives.** Dexie (nicer API, +1 runtime dependency, own upgrade model),
localStorage (no transactions, 5 MB, sync API).

**Consequences.** Migration and failure semantics stay visible in this repository
and are unit-tested against a Node implementation of the same API surface.

---

## ADR-007 — Content is validated by a reproducible audit, not by comments

**Decision.** `scripts/content-audit.mjs` produces `docs/audits/content-audit.{json,md}`
from the corpus; `src/audit/audit.test.ts` fails if the committed inventory is
stale, if the audit disagrees with the runtime parser, or if any paper claims a
verification state it has not reached. `npm run audit:check` performs the same
staleness check outside Vitest.

**Consequences.** The inventory can be regenerated and diffed in review; a
content edit without regenerating documentation fails CI.

---

## Browser support policy

**Decision.** Current evergreen Chrome, Edge, Firefox and Safari (desktop + iOS/
Android), plus any Chromium-based browser released in the last 12 months.
Baseline features relied on: ES2022, ES modules, `IntersectionObserver`-free
code, `dialog`, `BroadcastChannel` (graceful no-op when absent), IndexedDB,
`navigator.storage.estimate` (optional, gracefully absent), CSS custom properties.

**Test evidence.** Automated browser tests run on npm-packaged Chromium at 320,
390 and 1440 px. **Firefox and Safari are untested** — recorded as an open risk,
not as supported evidence.

**Graceful degradation.** Missing storage → explicit banner and disabled writes;
missing `BroadcastChannel` → single-tab behaviour with a refresh on tab focus.

---

## Scoring contract (defined, not implemented)

Recorded now so Phase 3 cannot drift. Per the 2026 bulletin (S1 §2.4, p7), and
**only** for the year it describes:

- **Category I:** +1 correct; −0.25 for a wrong answer or more than one selection;
  0 for unanswered.
- **Category II:** if no wrong option is selected, `2 × (correct selected ÷ total
correct)`; otherwise 0.
- Historic papers use their own printed instructions; the app must never apply
  2026 rules to an older paper automatically.
- Nothing may be scored until a question has a verified key and a verified
  transcription. Today **zero** questions qualify, so no scoring UI may exist.
- Scores are integers in quarter-mark units internally to avoid float drift.

---

## Open architecture questions (still unresolved)

1. Whether `syllabus.md`'s eligibility/reservation section is ever published, and
   under which year's notice.
2. Offline/service-worker strategy (Phase 4) — cache budget, update semantics.
3. Diagram handling for the 72 placeholder questions: licence to redraw, or
   permanent "consult the original" labels.
4. Cross-browser support evidence beyond Chromium.
5. Repository licence and content redistribution rights (owner decision).
