# Decisions and approval register

## Confirmed owner requirements

Recorded 2026-11-02 (session-local date).

| ID   | Decision                                                                      | Source                     |
| ---- | ----------------------------------------------------------------------------- | -------------------------- |
| O-01 | Continue the existing JELET-prep repository for West Bengal diploma students. | Owner's initial request    |
| O-02 | Build a complete modern working website, not a UI template.                   | Owner's clarification      |
| O-03 | Plan before implementation.                                                   | Owner's clarification      |
| O-04 | Create the website's docs folder first.                                       | Owner's latest instruction |
| O-05 | Check repository exam information against useful online resources.            | Owner's initial request    |

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

## Phase 2 execution — 2026-11-02

- O-10: Owner instructed “START PHASE 2 — PERSISTENT STUDY WORKSPACE” with the
  eight numbered requirements, the content limits and the explicit instruction to
  stop before opening/merging a PR or deploying. This authorizes Phase 2
  implementation and local validation on the assigned branch only.
- Reversible technical choices (recorded, not owner questions):
  - IndexedDB used directly through a thin, versioned adapter instead of an
    `idb`/Dexie dependency. Rationale: one fewer runtime dependency, migrations
    visible in-repo, browser semantics unchanged. See `docs/STUDY-DATA.md`.
  - Six object stores, one per record type, with derived deterministic keys
    (one position per paper, one note per question, history keyed by timestamp).
  - Content IDs are year-based (`jelet-et-p1-<year>:q<n>`) rather than
    array-index based, so adding a paper cannot renumber existing references. A
    pinned corpus fingerprint plus `CONTENT_VERSION` guards unreviewed edits.
  - Absence of a topic record means "not started"; only `studying` and `revised`
    are stored, so a cleared status and a never-set status cannot diverge.
  - Multi-tab: `BroadcastChannel` re-read of committed state, `visibilitychange`
    refresh, explicit note conflict choice, and merge re-read inside the import
    transaction. Reading positions are documented last-write-wins markers.
  - Import merge rule: newest `createdAt`/`updatedAt` wins, ties keep the local
    record; re-import is idempotent. Replace requires typing `REPLACE` and stores
    a pre-replace safety copy in `meta`. Import is atomic per transaction.
  - Notes are plain text (2000-character limit) and are never rendered as markup.
  - Phase 1 dark theme had a page-canvas contrast defect (light canvas, light
    text); fixed by setting the canvas in the dark `:root`. Light palette and
    layout are unchanged. This is the "documented adjustment" allowed for an
    accessibility defect.
  - New dev-only dependency `fake-indexeddb` (Apache-2.0) to test the real
    adapter/migrations in Node, and `@types/node` for the test fingerprint hash.
    No runtime dependency was added.
- Not done and not claimed: scored practice, answer keys, attempts, offline
  downloads, accounts, cloud sync, analytics, ads, payments, PR/merge/deploy,
  manual screen-reader audit, cross-browser matrix, full source verification.

## Phase 2 merge and deployment authorization — 2026-11-02

- O-11: Owner instructed “Ok merge it and run the workflow to update the
  website.” This authorizes the Phase 2 commit, branch push, pull request,
  merge into `main` and the resulting GitHub Pages deployment of Phase 2.
- Remote CI before merge: PR #4 run 41398800142 — “Check and build” passed in
  20s (formatting, 56 unit tests, TypeScript + production build); the Pages job
  correctly reported `skipping` for a pull request.
- Merge: PR #4 squashed? No — merged with `--merge` at 2026-11-02T06:16:29Z,
  merge commit `e7b99b3`.
- Deployment: `main` push run 41398880485 (“Check and build” 24s, “Publish to
  GitHub Pages” 21s) succeeded. GitHub deployment 7485622720 has state
  `success` for ref `main` at `e7b99b3` with environment URL
  https://pabitra27706-oss.github.io/Jelet-prep/ . Pages remains configured with
  `build_type: workflow` (GitHub Actions), no custom domain.
- Verification limit: this sandbox can only reach GitHub/npm/PyPI hosts, so the
  live `pages.github.io` URL could not be fetched from here. Live-state evidence
  is the deployment status plus the green build/deploy jobs, not a page fetch.
- This authorizes deployment of the labelled Phase 2 workspace only. Content
  verification, answer keys, rights review and Phase 3 remain unauthorized work.

## Phase 0 completion — 2026-11-02

- O-12: Owner instructed “Ok complete phase 0.” This authorizes closing the
  remaining Phase 0 evidence/architecture/design-foundation work on the assigned
  session branch. It does not authorize starting Phase 3, publishing new content,
  changing the licence, or any deployment beyond the already-approved Phase 2
  build.
- What was accepted as done: content inventory and issue register (machine-checked),
  official source register, licensing review split into code vs content,
  architecture decision record, browser/storage/scoring contracts, design token
  register, reproducible audit tooling wired into lint/tests/CI.
- What is explicitly **not** done and is recorded as an exception rather than a
  silent gap: comparison of any transcription against the official PDF (the file
  CDN is unreachable from the authoring environment and no PDF toolkit exists),
  answer-key sourcing, repository licence selection, content-rights resolution,
  owner approval of the visual tokens, Firefox/Safari evidence, manual
  screen-reader pass.
- Reversible choices made in this step:
  - The audit is a dependency-free Node script plus a typed declaration file
    (`scripts/content-audit.mjs` / `.d.mts`) rather than a PDF pipeline; it
    inspects only repository text and says so in its own output.
  - The generated inventory is committed and `.prettierignore`d, and a CI step
    fails when it goes stale, so documentation cannot drift from content.
  - `pyq-md/` and `pyq-index.html` remain byte-identical; findings (including the
    wrong historical section labels) are documented, not silently corrected,
    because correcting them is an editorial change that needs the official paper.
- Product decisions avoided (not invented): no language/bilingual scope, no
  monetization, no publish/suppress decision about the eligibility summary, no
  decision that transcriptions are licensed.

## Official-paper verification — 2026-11-02

- O-13: Owner supplied 11 official WBJEEB booklets and instructed “Ok check
  these.” This authorizes verification work and writing the findings up; it does
  **not** authorize editing `pyq-md/`, importing new papers, or deploying.
- Result recorded in `docs/audits/OFFICIAL-PAPER-VERIFICATION.md`. Two audit
  findings were corrected in place with dated markers rather than rewritten:
  2024 Q60–62 exist in the official booklet (the "missing" row was a tool
  artefact), and 2022 Q86–90 are genuinely absent from the transcription though
  present officially.
- No eligibility row changed. No paper became transcription-verified at sentence
  level and none became key-verified: all 11 booklets were checked on their final
  pages and contain no answer key. H-1 therefore stays open, with evidence.
- 2019 was not among the supplied booklets, so its Q78–79 gap remains untested.
- The four Paper-II booklets are all Pharmacy and are outside the v1 scope
  recorded in the roadmap; they were identified and key-checked, nothing more.

## Figure reconstruction decision — 2026-11-02

- O-14: Owner was asked what to do about the 72 figure-dependent questions and
  chose **redraw as original SVG line art**, rejecting page-links-only,
  crop-and-self-host and leaving placeholders.
- This knowingly accepts the residual risk that a redraw is a derived work whose
  permissibility is still unresolved in `docs/LICENSING.md`. It is recorded as a
  decision, not a clearance. Cropping official artwork remains explicitly
  rejected; the no-official-pixels constraint is absolute.
- Recorded in `docs/decisions/ADR-0002-figure-reconstruction.md`, with the asset
  standard in `docs/figures/README.md` and the 72-entry inventory in
  `docs/figures/manifest.json` (2 pilots done, 70 not started).
- Nothing in this decision makes a question verified or scoreable.

## Phase 3 groundwork — 2026-11-02

- O-15: Asked “what next?”, the owner chose to spec out Phase 3 without keys
  rather than fix labels, import 2023 Paper-I, or wait.
- Added §3-0 to `docs/phases/03-verified-practice.md`: the key-independent work
  packages (rule model, pure scoring core, content model, eligibility gate, key
  import contract, attempt-store design), the hard prohibitions while H-1 is open,
  and the two exit routes from the key blocker.
- Marking rules are now source-verified per year from the booklets' instruction
  pages — 2017, 2018, 2021 single-answer 100-mark papers; 2022, 2024, 2025
  120-mark papers with a Category-II formula that is a division, not a flat
  half-credit step. 2019 remains unverified (no booklet). An OCR pass misread that
  division as a "+", which is why the rules are quoted with page citations.
- `docs/CONTENT-SCHEMA.md` gained the figure record and an all-or-nothing key
  import contract. No key data exists; no scoring code was written.
- Phase 3 remains **blocked** for anything that produces a score. O-15 authorizes
  specification and, separately, only the work packages listed in §3-0.2.

## Documentation defect repaired — 2026-11-02

- `docs/DECISIONS.md` on `main` contained unresolved merge-conflict markers
  (`<<<<<<< HEAD` / `\=======` / `> > > > > > >`) committed by the PR #6
  cherry-pick. Both sides were legitimate content; the file now keeps both, in
  chronological order (O-11 Phase 2 merge, then O-12 Phase 0 completion), with the
  markers removed. No decision text was altered.
