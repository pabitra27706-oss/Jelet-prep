# Phase 1 — Complete library, syllabus and reading experience

Status: PLANNED.
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
