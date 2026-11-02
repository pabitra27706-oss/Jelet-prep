# Website roadmap

Status: Phase 1 and Phase 2 merged and deployed (2026-11-02). Full phase-0 audit, content/key verification, rights review and owner design approval of the new workspace screens remain open. Product proposals outside these increments remain unconfirmed. Four weeks is a proposed target, not an owner commitment. Every phase has a working web increment, not an APK.

| Phase                         | Parts (2–4 each)                                                                                                                                                                                       | Done means                                                                                                                                                                            | Status                                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Foundation and audit      | A: source/completeness inventory; B: dependency/licence and architecture checks; C: build/test shell; D: production design foundations                                                                 | Existing content preserved; gaps tracked; dependencies cleared; runnable shell and initial tests; design direction presented within real website and approved before broad UI rollout | Closed 2026-11-02 with exceptions: inventory/source register/ADR/build/tokens done; official-PDF comparison, answer keys, rights choice and owner token approval remain open  |
| 1 — Library and reader        | A: routes/home/library; B: real syllabus and paper reader with maths; C: source/stream/completeness labels and responsive theme                                                                        | Students find/read actual content at mobile/desktop widths; refresh/deep links work; missing/loading/error states tested; working preview + production build artifact                 | Implemented; awaiting owner design review / prerequisite closure                                                                                                              |
| 2 — Study workspace           | A: bookmarks/resume/notes; B: syllabus progress/history; C: validated export/import and reset                                                                                                          | Data survives reload; import cannot silently destroy progress; storage failure recovery tested; preview demonstrates real persistent data                                             | Merged and deployed (PR #4, `e7b99b3`); owner review of workspace screens and content verification remain open                                                                |
| 3 — Verified practice         | 3-0: key-independent foundation (rule model, pure scoring core, eligibility gate, key-import contract); A: reviewed question/key dataset; B: answer controls/timer/resume; C: scoring/results/revision | All scored questions have matched verified keys; unit tests cover category rules; complete verified papers alone enable full mocks; practice runs end to end in preview               | **Blocked for anything that scores.** 3-0 specified 2026-11-02 (marking rules now source-verified for 6 of 7 papers); still no key anywhere (H-1), so no results UI may exist |
| 4 — Offline and accessibility | A: content download/update management; B: offline and failure recovery; C: keyboard/screen-reader and responsive audit                                                                                 | Downloaded content opens after offline restart; un-downloaded content clearly unavailable; stale rules labelled; cache updates do not destroy progress; accessibility checks pass     | Planned                                                                                                                                                                       |
| 5 — Release readiness         | A: browser regression/performance/security; B: final content/legal/privacy review; C: hosting configuration and handover                                                                               | Green production build and documented tests; deploy-ready artifact; known gaps disclosed; independent-site notice; actual deployment requires separate owner approval                 | Planned                                                                                                                                                                       |

## Phase 0 closure (2026-11-02)

Phase 0 is closed with exceptions rather than declared fully done:

- **Evidence produced:** `docs/audits/CONTENT-AUDIT-REPORT.md`, generated
  `docs/audits/content-audit.{json,md}` (690 questions, 10 missing numbers,
  72 diagram placeholders, 24 questions with no detectable options,
  0 duplicates, 0 unbalanced maths), `src/audit/sources.ts` source register,
  independent tooling (`npm run audit:content` / `audit:check`).
- **Architecture cleared:** `docs/decisions/ADR-0001-architecture.md` (7 ADRs with
  alternatives and rollback costs), browser-support policy, scoring contract,
  storage contract (`STUDY-DATA.md`), dependency/licence register.
- **Design foundation:** token register read from the shipped CSS in
  `UI-REFERENCE.md`; owner token approval still pending.
- **Still open and blocking scoring, not reading:** no official-PDF comparison
  (H-2), no answer keys (H-1), condensed rather than verbatim wording (H-3),
  2019 title conflict (H-4), wrong last-section labels in four historical papers
  (M-1), 72 diagram-dependent questions (M-2), missing 2023 Paper I (L-2),
  unresolved content rights/repository licence (`docs/LICENSING.md`).

## Detailed phase work packages

Each phase is a substantial end-to-end capability, with 3–4 parts, data/behaviour requirements, edge cases, acceptance scenarios and evidence requirements:

- [Phase 0 — Foundation and audit](phases/00-foundation-and-audit.md)
- [Phase 1 — Library and reader](phases/01-library-and-reader.md)
- [Phase 2 — Persistent study workspace](phases/02-study-workspace.md)
- [Phase 3 — Verified practice engine](phases/03-verified-practice.md)
- [Phase 4 — Offline and accessibility](phases/04-offline-and-accessibility.md)
- [Phase 5 — Release readiness](phases/05-release-readiness.md)

These files are specifications, not completed phase records. Append actual implementation evidence when execution is authorized. Review [PRE-CODE-READINESS.md](PRE-CODE-READINESS.md) and [ARCHITECTURE.md](ARCHITECTURE.md) first.

## Dependency chain and scope control

Foundation → library → persistent workspace → verified practice → offline hardening → release readiness. Content verification starts in phase 0 and continues before each affected capability. No verified key means no scoring; it does not require inventing content or abandoning a useful reader.

Do not start a successor phase while the predecessor is incomplete unless the owner explicitly holds/reduces it and the dependent capability remains safe. A blocked full-mock dataset must be reported separately from completed reader functionality. Each phase includes testing/documentation, not a later generic “test everything” phase.

“Substantial” means production-ready capability, not adding extra features for volume. Performance, accessibility and security apply throughout; phases 4–5 deepen and regress them rather than introducing them for the first time.

## Scheduling hypothesis

Week 1: phases 0–1. Week 2: phase 2 and content verification. Week 3: phase 3. Week 4: phases 4–5. Re-estimate after reuse and dataset audits. Reduce verified practice coverage rather than bypass verification to meet a date.

## Explicit scope exclusions (proposed)

Accounts, cloud sync, backend, payments, ads, rankings, AI-generated solutions, extensive lesson authoring, college prediction and comprehensive counselling tools. Paper II preparation is not part of the proposed Engineering/Technology-first v1.

## Phase handover

For each phase create `phases/NN-name.md` with parts, changed files, source evidence, actual commands/results, preview behaviour, unresolved risks, decisions and next step. Update this roadmap and decision log. Do not mark phases complete based only on appearance. No fabricated CI URLs, test passes or deployment status.

## Current evidence

See the phase 2 execution record (`phases/02-study-workspace.md`), the local data
contract (`STUDY-DATA.md`), phase 1 evidence, CONTENT-INVENTORY.md and
DEPENDENCIES.md. Phase 2 delivered versioned IndexedDB storage, stable content
IDs, bookmarks, reading-position resume, plain-text notes, syllabus topic status,
a derived progress/dashboard view, a versioned JSON backup with validated
merge/replace import, confirmed reset and defined multi-tab behaviour.

CI before merge: PR #4 "Check and build" passed (formatting, 56 unit tests,
TypeScript + build); `main` push run 41398880485 built and deployed the artifact
(deployment state `success`).

Local results recorded for this increment: formatting check, 56 unit tests,
TypeScript check, production build, 23 production-preview browser tests
(including persistence, backup/restore, duplicate import, blocked storage and
simulated quota failure) and axe scans of 12 screen/theme combinations. No claim
of completed official-paper authentication, verified answer keys, complete
phase 0 or cross-browser verification is made. Phase 2 is merged and published;
the live page could not be fetched from the authoring sandbox, so publication is
evidenced by the successful deployment record rather than a page fetch.
