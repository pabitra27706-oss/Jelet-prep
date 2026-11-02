# Phase 0 — Foundation, evidence and production architecture

Status: PLANNED — implementation not authorized.
Dependencies: owner approves product boundary, language, monetization and budget; read DECISIONS before asking.

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

## 0-B — Architecture and reuse clearance
- Verify candidate package versions, licences, maintenance and compatibility using official package/repository evidence. Choose one maths renderer after testing representative existing equations.
- Confirm frontend-only/static-hosting boundary; define feature modules and dependency direction in ARCHITECTURE.md.
- Define content, local progress, export and scoring contracts before connecting UI. Stable IDs must not depend on array positions.
- Set routing/base-path strategy, browser-support policy, data-version migration approach and storage-failure behaviour.
- Decide sanitation/rendering policy; minimize raw HTML injection. Record lockfile/version policy and third-party notices.

Deliverable: short architecture decisions with alternatives, reasons, rollback costs and verified dependency register. No package is cleared solely because it was proposed in planning.

## 0-C — Reproducible build and test foundation
- After implementation approval, establish app entry point, scripts, lockfile, type checking, lint and production build.
- Add unit/content-validation tests and one browser smoke test; wire CI without secrets or public deployment.
- Keep old reader/content until migration parity is proven; no destructive mass conversion.
- Configure preview server for 0.0.0.0 and proxied preview hosts; use relative browser URLs, never sandbox localhost API URLs.
- Document clean install/build/preview commands and failures honestly.

Deliverable: runnable production shell, reproducible build and actual passing baseline checks. CI status is recorded only after a real run.

## 0-D — Production design foundation
- Implement shared shell, semantic navigation, typography, surfaces, focus states and theme in real production components.
- Sketch mobile dashboard/library/reader flows with existing content and actual routes; do not implement fake feature buttons.
- Establish token values and review with owner before broad rollout. Implement translation structure only once language decision is confirmed.
- Test representative maths, Bengali text if selected, long headings and small screens before freezing typography/layout.

Deliverable: owner-reviewed production design direction and token register; a working shell, not a claim that library/practice already works.

## Acceptance and evidence
- All existing content accounted for; 2022 and 2024 omissions remain tracked.
- At least one representative maths-heavy question and one missing-diagram case render without false completeness claims.
- Clean install, lint, type check, baseline tests and build succeed; evidence includes commands, results and changed paths.
- Dependencies/licences reviewed; future-year facts not invented; unresolved legal/content issues remain explicit blockers.
- Working preview and downloadable production build artifact documented; neither is a public release.

## Risks and stop conditions
Unclear rights block publication of affected material. Unmatched keys block scoring, not the reader. An unapproved product boundary blocks implementation. A failed maths corpus test changes renderer choice before library migration.

## Exit record
Record manifest coverage, architecture decisions, actual test evidence, design approval or hold, known gaps and next phase. Do not mark complete while claiming unchecked content is verified.
