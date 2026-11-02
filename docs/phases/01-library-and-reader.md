# Phase 1 — Complete library, syllabus and reading experience

Status: IMPLEMENTED FOR PREVIEW REVIEW — design approval and phase-0 audit closure pending.
Dependencies: phase 0 complete; production design approved; content inventory available. Readable material may be explicitly incomplete/unverified.

## Outcome

A student can open the site, locate a real paper or syllabus topic, read it comfortably and understand its source and limitations.

## 1-A — Navigation, discovery and trustworthy home

- Build working home, library, syllabus and paper routes, including direct links and not-found handling.
- Display real paper inventory with year, stream, subjects, completeness and verification labels.
- Search paper metadata and filter by supported facets; preserve filters in the URL and offer clear reset/no-results states.
- Home links to actual available capabilities. Progress widgets remain absent or honest empty states until phase 2.
- Separate historical exam notices from current information. Never derive a future exam countdown from a past date.

## 1-B — Reader and content migration

- Migrate content via reviewed transformation, retaining original numbering, options, equations and source mapping.
- Render maths consistently and avoid markup corruption. Review complex matrices, cases, vectors, integrals, superscripts and chemical notation.
- Provide question index, subject headings, previous/next navigation, readable type controls and original-source links.
- Support diagram assets with captions/alternatives; otherwise show a precise missing-diagram warning.
- Handle long equations with local scrolling rather than full-page overflow. Prevent async content loads from showing the wrong paper after rapid navigation.
- Do not guess missing questions or normalize historical category boundaries without source evidence.

## 1-C — Syllabus and source transparency

- Build subject/chapter/topic hierarchy and search; show year and official reference.
- Present guidance as informational, not a guarantee of eligibility/admission. Link detailed rules instead of compressing exceptions into misleading claims.
- Add explanation of verification badges and separate completeness from accuracy.
- Degrade gracefully when an official external link is unavailable; do not promise offline access to externally hosted PDFs.

## 1-D — Responsive and accessible reading

- Test library/reader at 320px, common mobile/tablet widths and desktop; no hidden essential controls.
- Ensure headings, landmarks, skip link, focus restoration on route change and labelled controls.
- Loading, empty, unavailable, render failure and retry states must be useful and tested.
- Bundle runtime rendering assets locally so the reader does not depend on external script CDNs.

## Acceptance scenarios

1. Fresh visitor finds 2024, sees missing-question notice and reaches original source.
2. Direct paper URL loads after refresh under the selected hosting/base-path strategy.
3. Search with no matches gives recovery; clearing filters restores the inventory.
4. Maths-heavy questions render at narrow widths; missing options/diagrams do not appear complete.
5. Rapid switching between papers cannot put the previous paper under a new title.
6. All current repository papers are accounted for; migration differences are reviewed and logged.

## Tests and handover

Content parity/numbering checks, rendering fixtures and browser flows for discovery/deep-link/error recovery. Capture representative screenshots for regression evidence, not as a substitute for functionality. Provide working preview, production build and a list of readable versus excluded content. Bookmarks and scoring are not falsely advertised before later phases.

## Execution evidence — 2026-11-02

### Shipped

- `src/main.tsx`: real home, filtered paper library, async read-only reader with question index/previous-next/type controls, subject/topic syllabus search, source/privacy information and invalid-route recovery.
- `src/content.ts`: seven-paper manifest, structural question parser, missing-number detection, topic extraction and filter logic. Specific source links retained from prior research; unestablished matches link to the archive.
- `src/Markdown.tsx`: math protection before Markdown parsing, locally bundled KaTeX and DOMPurify sanitation; visible unsupported-equation fallback.
- `src/style.css`: responsive production theme, light/dark mode, focus/skip navigation and reduced-motion handling.
- `package.json`, lockfile, Vite/TypeScript/Vitest/Playwright config: reproducible local tooling. Hash routes refresh on static hosting without a server fallback.
- Existing `pyq-index.html`, `pyq-md/` and `syllabus.md` preserved unchanged.

### Actual checks

- `npm run build`: passed (TypeScript check + production bundle). Vite reports harmless Lucide “use client” directive warnings; no SSR is used.
- `npm run lint`: passed Prettier formatting check. This is formatting lint, not an ESLint semantic/security analysis.
- `npm test`: 18 tests passed, covering corpus numbering parity, known gaps, topic extraction, filters, malicious markup removal, representative maths and all extracted question rendering.
- `npm run test:e2e`: 10 tests passed against the production preview with npm-packaged Chromium. Includes search/filter URL persistence, deep-link refresh, question controls, syllabus search, 320px overflow, theme persistence, missing/invalid routes, load-error recovery, rapid navigation, local-only automatic runtime requests, screenshots and axe scans on five principal screens.
- Accessibility scan found no WCAG A/AA violations in the tested light-theme states after contrast fixes. This is not a manual screen-reader audit or full conformance certification.
- `npm audit --omit=dev`: zero known runtime vulnerabilities at check time; not a security guarantee.
- Production preview: port 4173, bound to 0.0.0.0. Build output: `dist/` (ignored). Packaged artifact: `/home/user/jelet-prep-phase1.zip` (outside Git).

### Remaining gates and limits

Full line-by-line official content audit, final-key verification, rights/licence review, owner design/token approval, translations, manual assistive-technology audit and broader browser coverage remain open. Phase 0 is not falsely marked complete. No scoring, bookmarks, saved sessions, backend, analytics, ads or service worker exists. No public deployment or remote CI run occurred.

### Next step

Owner reviews the real site/design. Close prerequisite audit/design decisions before phase 2; do not silently begin persistence/practice work. Phase 2 remains separately authorized work.
