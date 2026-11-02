# Website roadmap

Status: DRAFT. Documentation is authorized; execution and product proposals await approval. No phase is complete. Four weeks is a proposed target, not an owner commitment. Every phase has a working web increment, not an APK.

| Phase | Parts (2–4 each) | Done means | Status |
| --- | --- | --- | --- |
| 0 — Foundation and audit | A: source/completeness inventory; B: dependency/licence and architecture checks; C: build/test shell; D: production design foundations | Existing content preserved; gaps tracked; dependencies cleared; runnable shell and initial tests; design direction presented within real website and approved before broad UI rollout | Planned |
| 1 — Library and reader | A: routes/home/library; B: real syllabus and paper reader with maths; C: source/stream/completeness labels and responsive theme | Students find/read actual content at mobile/desktop widths; refresh/deep links work; missing/loading/error states tested; working preview + production build artifact | Planned |
| 2 — Study workspace | A: bookmarks/resume/notes; B: syllabus progress/history; C: validated export/import and reset | Data survives reload; import cannot silently destroy progress; storage failure recovery tested; preview demonstrates real persistent data | Planned |
| 3 — Verified practice | A: reviewed question/key dataset; B: answer controls/timer/resume; C: scoring/results/revision | All scored questions have matched verified keys; unit tests cover category rules; complete verified papers alone enable full mocks; practice runs end to end in preview | Planned |
| 4 — Offline and accessibility | A: content download/update management; B: offline and failure recovery; C: keyboard/screen-reader and responsive audit | Downloaded content opens after offline restart; un-downloaded content clearly unavailable; stale rules labelled; cache updates do not destroy progress; accessibility checks pass | Planned |
| 5 — Release readiness | A: browser regression/performance/security; B: final content/legal/privacy review; C: hosting configuration and handover | Green production build and documented tests; deploy-ready artifact; known gaps disclosed; independent-site notice; actual deployment requires separate owner approval | Planned |

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
