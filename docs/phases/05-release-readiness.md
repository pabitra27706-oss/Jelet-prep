# Phase 5 — Production hardening and launch preparation

Status: PLANNED.
Dependencies: earlier phases accepted or explicitly reduced by owner; outstanding source/rights issues identified. Deployment requires a separate explicit gate.

## Outcome
A tested, documented, deploy-ready website with truthful limitations and a recoverable release process.

## 5-A — Regression, performance and security
- Run clean install, lint, type check, all unit/content/browser tests and production build; retain actual evidence.
- Verify every primary route, direct-link refresh, base path, 404, search, reader, storage, practice, backup and offline flow.
- Measure agreed mobile performance targets on stated conditions; inspect bundle split, unnecessary dependencies, maths and diagram loading.
- Review Markdown/import sanitization, dependency advisories, storage boundaries, external links and hosting security headers.
- Ensure browser code uses relative URLs and no secrets or sandbox localhost endpoints.
- Remove fake controls, debug output and placeholder metrics. Do not hide serious bugs with styling or broad exception swallowing.

## 5-B — Content, trust and user validation
- Complete publication-level source and rights review for shipped material; retain public unresolved-completeness labels.
- Ensure eligibility/reservation summaries do not erase exceptions; no unverified future-year dates.
- Add about/credits/privacy/correction guidance and independent-from-WBJEEB statement.
- Verify language consistency and avoid implying unofficial translations are original exam wording.
- If consenting student testing is authorized and feasible, run the pre-written validation test. Record results or explicitly state not conducted; no invented reviews.
- Confirm owner licence choice before publication and account for separate third-party/content licences.

## 5-C — Hosting, recovery and handover
- Select hosting/domain with owner; check free-tier constraints without promising permanent zero cost.
- Verify HTTPS, SPA route fallback or chosen alternative, base path, cache headers, service-worker scope and artifact integrity.
- Prepare staged deployment and rollback steps; version code/content together and protect active attempts during update.
- Document how to add/correct a paper, verify a key, revise yearly guidance, run tests and restore a prior release.
- Refresh architecture/decisions/roadmap and produce self-contained next-session handover.
- Keep launch gate explicit: build readiness is not permission to publish, deploy, release, open or merge a PR.

## Release acceptance
- No critical data-loss/security/scoring defects; remaining lower-severity issues disclosed with workarounds.
- Actual automated gates pass and manual mobile/accessibility checks are recorded.
- Shipped scored dataset meets eligibility rules; unsupported content cannot enter mocks.
- Privacy and offline claims match reality; no surprise analytics, ads, accounts or payment code.
- Production artifact is available, preview inspected and rollback procedure documented.
- Public deployment remains pending until explicitly authorized; after authorization verify the live deployment rather than assuming build success proves hosting success.

## Evidence packet
Commands/results, CI link only if a real run exists, build artifact location, source/eligibility coverage, manual test matrix, unresolved issues, measured performance with conditions, content/dependency licences, preview and deployment approval state. Record no secrets or tester personal details.
