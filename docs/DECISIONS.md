# Decisions and approval register

## Confirmed owner requirements
Recorded 2026-11-02 (session-local date).

| ID | Decision | Source |
| --- | --- | --- |
| O-01 | Continue the existing JELET-prep repository for West Bengal diploma students. | Owner's initial request |
| O-02 | Build a complete modern working website, not a UI template. | Owner's clarification |
| O-03 | Plan before implementation. | Owner's clarification |
| O-04 | Create the website's docs folder first. | Owner's latest instruction |
| O-05 | Check repository exam information against useful online resources. | Owner's initial request |

## Documentation expansion — 2026-11-02
- O-06: Owner requested detailed, substantial phase descriptions and full preparation before coding.
- Action: expand all six phase specifications; add architecture, risk register and readiness gates. This authorizes planning detail only, not implementation or previously unanswered product proposals.
- Existing phase count and proposed v1 boundary are retained. Greater detail is not a commitment to a longer schedule or extra backend/platform features.

## Proposed, not owner-approved
- English exam content with Bengali/English interface and guidance.
- Free/no ads for the first release.
- Four-week target, dependent on content verification.
- Engineering/Technology Paper I focus; no accounts/backend in v1.
- Practice, notes, progress export/import and offline downloads as described in the roadmap.
- React + TypeScript + Vite, Tailwind, IndexedDB, Vitest and Playwright. These are candidates, not installed dependencies.

Do not describe these as recorded owner answers. Resolve product-shaping proposals in a single approval batch before implementation; do not re-ask confirmed requirements.

## Reversible planning choices
- Preserve existing HTML and Markdown while planning migration.
- Build production screens directly; UI-REFERENCE is a specification, not a throwaway prototype.
- Require verified complete papers and matched keys for scored full-paper mocks.
- Show missing content explicitly; never synthesize missing exam questions, keys or diagrams.

## Playbook adaptation and provenance
Reference inspected: https://github.com/pabi277/AppFlow/tree/57597b3332ad578614a0d9d5609f9cf8a278ee8a

The original prompt left the SHA unspecified. This SHA was resolved during research, not explicitly selected by the owner. Use the playbook as planning provenance, not a runtime dependency or blanket approval of its Android-specific rules.

The owner's website requirement replaces Android/APK/Play milestones with working web previews, production build artifacts and browser tests. Existing repository/branch are retained. No Android package ID or new repository is required. No formal law waiver or longer-than-four-week budget has been approved.

## Approval boundaries
Historical planning-stage boundary: only documentation work was authorized in that step. See the latest execution entry below for the current scope. Do not infer permission to implement, spend, add ads, deploy, release, open/merge a PR or change repository licensing. Commit/push were not requested. Stay on the assigned session branch and preserve existing work.

## Phase 1 execution — 2026-11-02
- O-07: Owner instructed “start phase 1”. This authorizes library/reader implementation on the assigned branch, not deployment or merging.
- Agent adaptation: phase 0 was not completed. Minimal frontend/build/content inventory prerequisites were included to make phase 1 runnable; the remaining full source audit, formal design approval, licence selection and publication review are not marked complete. This is a documented sequencing deviation, not a claim the owner explicitly waived every prerequisite.
- Reversible choices: React/TypeScript/Vite, plain CSS tokens rather than Tailwind, hash routes for refresh on static hosts, lazy-loaded paper chunks and sanitized Markdown with local KaTeX. See DEPENDENCIES.md for exact installed versions/licence/activity signals.
- English-only first increment preserves supplied content without choosing or rejecting a future bilingual interface. No ads/payment/account/backend work was added. No four-week commitment was inferred.
- Test-only npm-packaged Chromium works around blocked browser-CDN access; extracted shared libraries are temporary, not shipped in the website. Test launcher disables the package's single-process and insecure-web-security flags.
- Theme preference is the only new persisted user setting. Bookmarks, attempts, notes and offline downloads are not implemented.
- Design is presented in the actual working preview; token approval is pending owner review. No PR, commit, push, merge or public deployment requested in this step.

## Phase 1 merge authorization — 2026-11-02
- O-08: Owner instructed “merge it to main”, authorizing the Phase 1 commit, branch push, pull request and merge. This does not authorize public deployment or Phase 2.
- Revalidated before merge: formatting, 18 unit tests, TypeScript/production build, 10 production-preview browser tests and whitespace checks passed locally. Remote CI is not configured.
- Outstanding source-verification/publication gates remain; merge authorization is not recorded as blanket visual-token or content-accuracy approval.

## Public website deployment — 2026-11-02
- O-09: Owner explicitly approved adding the build workflow, merging into main, switching Pages to GitHub Actions and publishing the current reading website.
- Diagnosis: Pages previously used legacy main/root publishing, which does not compile the Vite TypeScript entry point. The new workflow checks/builds the app and publishes only `dist/`.
- Deployment target: https://pabitra27706-oss.github.io/Jelet-prep/ . Existing relative asset paths and hash routes are retained for repository-subpath hosting.
- Pull requests run build checks without deploying. Main pushes/manual dispatch build then deploy through the github-pages environment with job-scoped Pages/OIDC permissions. No custom credentials are stored.
- This authorizes public deployment of the current labelled reader, not verified exam-content status or implementation of Phase 2.
