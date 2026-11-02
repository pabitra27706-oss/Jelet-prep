# Phase 0 — Foundation, evidence and production architecture

Status: **CLOSED 2026-11-02, with named exceptions.** Parts 0-B, 0-C and 0-D are complete and evidenced; part 0-A produced a full structural inventory and a source register, but the _official-PDF comparison_ and _answer-key availability_ could not be performed from this environment and are carried forward as explicit blockers for scoring (Phase 3), not as silent gaps.

Read with: [content audit report](../audits/CONTENT-AUDIT-REPORT.md), [generated inventory](../audits/content-audit.md), [licensing review](../LICENSING.md), [ADR-0001](../decisions/ADR-0001-architecture.md).

## Outcome

A reproducible engineering foundation and a reliable content inventory, not a decorative landing page. Existing files remain recoverable. Production design is established in the actual app, not a throwaway prototype.

## 0-A — Audit and content eligibility

- Inventory all seven Markdown papers, syllabus and HTML reader. Record source year, stream, expected/present questions, diagrams, options, maths and missing ranges.
- Match each paper to its official original and identify booklet/set numbering. Record source URL, pages, retrieval date and review status.
- Locate final official answer keys where available; do not substitute a similarly named paper or provisional key silently.
- Reconcile syllabus/eligibility against the bulletin and subsequent notices, separating 2026 history from future-year unknowns.
- Create a content manifest and issue register: each gap gets severity, affected content, evidence and remediation or exclusion.
- Review paper/diagram redistribution rights and repository licensing needs. Owner chooses the repository licence; code licensing cannot grant rights to exam content.

Deliverable: content eligibility matrix distinguishing readable, transcription-verified, key-verified and full-mock eligible. Missing material remains visible and ineligible where appropriate.

**Delivered**

- `scripts/content-audit.mjs` (reproducible, dependency-free) → `docs/audits/content-audit.{json,md}`. Per paper: SHA-256, byte/line counts, sections and declared ranges, question count, missing numbers, duplicates, out-of-range numbers, image placeholders, questions with no detectable options, maths delimiter balance, mojibake/replacement characters, title-vs-filename check.
- `src/audit/sources.ts` — official title, official PDF URL, session, listing status, retrieval date and review state for all seven papers.
- `docs/audits/CONTENT-AUDIT-REPORT.md` — findings by severity, issue register, eligibility matrix, honest limits.
- `docs/LICENSING.md` — separated code-licence and content-rights questions; four owner options; dependency licence summary.
- Eligibility matrix: **all seven papers readable, none transcription-verified, none key-verified, none eligible for scored practice or full mocks.**

**Not delivered (blocked, recorded)**

- No official PDF was opened or compared: the file CDN is unreachable from the authoring environment (TLS handshake failure) and no PDF toolkit is installed. Carried as issue H-2.
- No answer key exists or was obtained. Carried as issue H-1.
- Two spot checks used a secondary mirror's page images (2019 cover; 2022 Q66–67) and are labelled as such in the report. The 2022 check established that transcribing condensed wording is a real risk (H-3).

## 0-B — Architecture and reuse clearance

- Verify candidate package versions, licences, maintenance and compatibility using official package/repository evidence. Choose one maths renderer after testing representative existing equations.
- Confirm frontend-only/static-hosting boundary; define feature modules and dependency direction in ARCHITECTURE.md.
- Define content, local progress, export and scoring contracts before connecting UI. Stable IDs must not depend on array positions.
- Set routing/base-path strategy, browser-support policy, data-version migration approach and storage-failure behaviour.
- Decide sanitation/rendering policy; minimize raw HTML injection. Record lockfile/version policy and third-party notices.

Deliverable: short architecture decisions with alternatives, reasons, rollback costs and verified dependency register. No package is cleared solely because it was proposed in planning.

**Delivered**

- `docs/decisions/ADR-0001-architecture.md`: seven ADRs (stack, hash routing, KaTeX with corpus evidence, sanitisation, derived IDs + versioned storage, no storage runtime dependency, audit-driven content validation), each with alternatives, consequences and rollback cost.
- Browser-support policy stated, with the honest gap that only Chromium is test-evidenced.
- Scoring contract written down (categories, quarter-mark integer arithmetic, per-paper historic rules, "no key ⇒ no scoring") so Phase 3 cannot drift.
- Storage/versioning/multi-tab/failure contract in `docs/STUDY-DATA.md`; content IDs in `CONTENT-SCHEMA.md`.
- Dependency register regenerated from installed manifests with licences and registry activity (`DEPENDENCIES.md`), including dev-only test dependencies and the note that no package licence covers exam content.

## 0-C — Reproducible build and test foundation

- After implementation approval, establish app entry point, scripts, lockfile, type checking, lint and production build.
- Add unit/content-validation tests and one browser smoke test; wire CI without secrets or public deployment.
- Keep old reader/content until migration parity is proven; no destructive mass conversion.
- Configure preview server for 0.0.0.0 and proxied preview hosts; use relative browser URLs, never sandbox localhost API URLs.
- Document clean install/build/preview commands and failures honestly.

Deliverable: runnable production shell, reproducible build and actual passing baseline checks. CI status is recorded only after a real run.

**Delivered**

- `npm ci` from a committed lockfile; `lint` (Prettier), `typecheck`, `test` (Vitest), `build` (tsc + Vite), `preview`, `test:e2e` (Playwright), plus new `audit:content` and `audit:check`.
- CI (`.github/workflows/pages.yml`) now runs a content-audit staleness check before the unit tests; the whole pipeline was exercised for real (PR runs 41398800142, 41399058148; main runs 41396056767, 41398880485 — all green).
- Legacy `pyq-index.html`, `pyq-md/*.md` and `syllabus.md` untouched; the modern app reads the same Markdown.
- Preview bound to `0.0.0.0` with `allowedHosts`, relative asset base, hash routes.
- 67 unit tests + 23 browser tests currently pass locally; documented commands are in README.

**Limits recorded**: CI does not run browser tests (they need the packaged Chromium download); Firefox/Safari untested.

## 0-D — Production design foundation

- Implement shared shell, semantic navigation, typography, surfaces, focus states and theme in real production components.
- Sketch mobile dashboard/library/reader flows with existing content and actual routes; do not implement fake feature buttons.
- Establish token values and review with owner before broad rollout. Implement translation structure only once language decision is confirmed.
- Test representative maths, Bengali text if selected, long headings and small screens before freezing typography/layout.

Deliverable: owner-reviewed production design direction and token register; a working shell, not a claim that library/practice already works.

**Delivered**

- Real shell: sidebar/compact navigation, skip link, focus ring, light/dark theme, reader, library, syllabus, saved/progress/settings screens.
- `docs/UI-REFERENCE.md` now carries a token register **read from the shipped CSS** (colour light/dark, type scale, spacing, radii, focus, motion, breakpoints) plus a component→token mapping and the evidence behind it.
- No translation layer: the language decision is still unconfirmed, so none was invented.
- Responsive checks at 320/390/1440 px with no horizontal overflow; maths, long headings and dense reader text verified.
- **Owner approval of the visual direction is still pending** — the site is deployed and looks reviewed, but no formal token freeze has been recorded.

## Acceptance and evidence

- All existing content accounted for; 2022 and 2024 omissions remain tracked. **Done** — 690 questions, 10 missing numbers, all labelled, machine-checked.
- At least one representative maths-heavy question and one missing-diagram case render without false completeness claims. **Done** — Phase 1 tests cover both; 72 placeholders warn inline.
- Clean install, lint, type check, baseline tests and build succeed; evidence includes commands, results and changed paths. **Done** — see below.
- Dependencies/licences reviewed; future-year facts not invented; unresolved legal/content issues remain explicit blockers. **Partly** — dependencies reviewed; content rights explicitly unresolved (`LICENSING.md`) and treated as a blocker for further content publication.
- Working preview and downloadable production build artifact documented; neither is a public release. **Done** — production build in `dist/`, deployed site already live from Phase 2.

## Risks and stop conditions

Unclear rights block publication of affected material. Unmatched keys block scoring, not the reader. An unapproved product boundary blocks implementation. A failed maths corpus test changes renderer choice before library migration.

**Current status of these conditions:** rights remain unclear (publication continues under the owner's earlier decision and the existing labels — not a clearance); unmatched keys block scoring, and the app says so; the maths corpus test passes for all 690 questions.

## Exit record — actual checks (2026-11-02)

| Check                    | Command                              | Result                                 |
| ------------------------ | ------------------------------------ | -------------------------------------- |
| Formatting               | `npm run lint`                       | pass (now also covers `scripts/`)      |
| Content audit freshness  | `npm run audit:check`                | pass — inventory matches corpus        |
| Unit tests               | `npm test`                           | **67 passed** (56 previous + 11 audit) |
| Types + production build | `npm run typecheck`, `npm run build` | pass                                   |
| Browser tests            | `npm run test:e2e`                   | 23 passed (production preview)         |
| CI                       | GitHub Actions runs listed above     | green                                  |

Changed paths in this phase: `scripts/content-audit.mjs`, `scripts/content-audit.d.mts`, `src/audit/sources.ts`, `src/audit/audit.test.ts`, `docs/audits/*`, `docs/audits/CONTENT-AUDIT-REPORT.md`, `docs/LICENSING.md`, `docs/decisions/ADR-0001-architecture.md`, `docs/UI-REFERENCE.md`, `.prettierignore`, `.github/workflows/pages.yml`, `package.json`, plus the updated roadmap/decision/gate documents.

## Known gaps carried into Phase 3+

1. H-1 no answer keys; H-2 no PDF comparison; H-3 condensed wording; H-4 2019 title conflict.
2. M-1 wrong last-section labels in 2017/2018/2019/2021 transcriptions.
3. M-2 72 diagram/reaction-dependent questions.
4. L-2 2023 Paper I missing from the library.
5. Owner decisions still open: repository licence, content-rights posture, visual token approval, bilingual scope.
6. Cross-browser (Firefox/Safari) and manual screen-reader evidence.

## Next phase

Phase 3 (verified practice) **cannot start its scoring half** until H-1 and H-2 close. Its non-scoring building blocks — content model for options/keys, import of a sourced key file, per-paper scoring rules — can be specified, but nothing may be scored or shown as a result until at least one paper has a verified transcription _and_ a sourced key.
