# Phase 4 — Offline reliability and inclusive use

Status: PLANNED.
Dependencies: reader, persistence and practice are stable; locally bundled assets; service-worker/dependency review complete.

## Outcome
Students can deliberately download supported content and continue studying without connectivity, while understanding what is and is not available.

## 4-A — Download and cache lifecycle
- Define app-shell, immutable/versioned content and runtime cache policies separately.
- Download paper metadata, text, maths resources and required diagrams as a coherent bundle with manifest/version checks.
- Show estimated size where measurable, progress, success, failure, cancellation and removal controls.
- Mark available only after required assets are confirmed cached; incomplete downloads must not claim readiness.
- Handle storage quota/eviction and differentiate removal of downloads from deletion of progress.
- External official PDFs are source links unless separately downloaded with appropriate rights, browser support and clear UI.

## 4-B — Updates, freshness and recovery
- New service workers must not reload an active mock or delete its assets/progress unexpectedly.
- Notify about updates and apply at a safe boundary; retain required prior versions for active attempts.
- Old exam guidance remains year-labelled; offline mode never claims to have checked current notices.
- Handle interrupted download, corrupt/missing cache entries and retry without wiping user work.
- Test real production service-worker build in secure context. Dev-server behaviour alone does not prove offline support.

## 4-C — Accessibility and mobile robustness
- Audit all flows for keyboard focus, screen-reader announcements, accessible names and logical tab order.
- Ensure single/multiple answer semantics are announced; timer updates must not create constant disruptive announcements.
- Check contrast, zoom/reflow, touch targets, reduced motion and themes.
- Test long equations, Bengali strings if selected and diagram descriptions; avoid claiming alternative text makes an incomplete diagram question scoreable.
- Test low-memory/mobile network conditions and repeated route changes; remove unnecessary rendering work.

## Acceptance scenarios
1. After a successful download, close/reopen offline and read the paper with equations and required diagrams.
2. An uncached paper shows unavailable offline, not an endless spinner or misleading blank page.
3. Interrupted download/quota error preserves existing content and progress.
4. Updating app while a mock is active does not reset answers, timing or required content.
5. Clearing a download does not clear notes/history; stale saved-content badges recover from eviction.
6. Core reading/practice/backup flows work via keyboard; manual assistive-technology checks are recorded honestly.

## Tests and handover
Production-preview browser tests with network disabled, version-change/update tests, cache eviction/quota recovery tests and automated accessibility checks plus manual keyboard/screen-reader evidence. Present an offline demonstration and supported browser/context limitations. Installation is optional: an install icon alone is not acceptance.
