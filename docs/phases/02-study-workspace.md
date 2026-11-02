# Phase 2 — Persistent personal study workspace

Status: MERGED AND DEPLOYED (2026-11-02, PR #4, merge commit `e7b99b3`) — owner review of the workspace screens still pending.
Dependencies: stable paper/question/topic IDs; functioning reader; approved local-only product model.

## Outcome

The website remembers real study work on the same device and provides a safe backup route without asking students to create an account.

## 2-A — Durable storage and state boundaries

- Implement versioned IndexedDB stores for bookmarks, positions, notes, topic status and history.
- Use explicit repository/storage interfaces; UI components must not own schema migrations.
- Define transactions, retry/error reporting, migration and rollback/backup policy.
- Distinguish successful persistence from optimistic UI; never show saved when a write failed.
- Decide multi-tab behaviour: notify/reload or resolve updates deterministically; do not silently overwrite newer work.
- Handle private browsing, denied storage, quota and browser-cleared data with honest notices.

## 2-B — Actual study interactions

- Bookmark/unbookmark stable question IDs from reader and saved list; links return to the correct paper/question.
- Save reading position with sensible write throttling and restore after reload.
- Create/edit/delete plain-text personal notes, with input limits and no executable markup.
- Set topic status to not started/studying/revised. Dashboard progress must be derived from real statuses, not invented mastery scores.
- Show useful empty states and recently opened content. No fake streaks, rankings or rank predictions.

## 2-C — Export, restore and reset

- Define versioned JSON backup envelope with app/schema/content references; avoid unnecessary identifiers.
- Validate structure, size, types and IDs before any write. Reject incompatible versions safely.
- Show counts/conflicts before import; explicitly distinguish merge from replace and define deterministic conflict rules.
- Import atomically; partial failure cannot erase existing progress. Back up before destructive replace/migration where possible.
- Warn about orphaned bookmarks when content changes; preserve recoverable notes.
- Reset requires confirmation and specifies exactly what is cleared; downloaded content and progress must not be confused.

## Acceptance scenarios

- Bookmark, note and topic progress survive page reload and browser reopen.
- Navigation restores the intended reading position without jumping to a different question.
- Export → reset → import restores equivalent user data.
- Invalid/oversized/incompatible backup leaves existing data unchanged.
- Duplicate import does not duplicate bookmarks or attempts.
- Two open tabs do not silently lose newer edits; simulated quota failure reports unsaved status.

## Tests and handover

Unit/integration tests cover persistence contracts, migrations and conflict rules. Browser tests cover restart/backup/restore/reset and storage failures. Preview demonstrates genuine stored data. Privacy text explains device-local storage, browser deletion risk and absence of cross-device sync. Attempt history becomes fully functional with phase 3; do not fabricate results now.

## Execution evidence — 2026-11-02

### Shipped

- **Stable IDs.** `src/content.ts` now derives `jelet-et-p1-<year>` paper IDs,
  `<paper>:q<number>` question IDs and positional
  `jelet-syllabus:<subject>:t<nn>` topic IDs, plus `CONTENT_VERSION`
  (`2026-11-02.1`). `src/study/ids.test.ts` pins a corpus fingerprint so an
  unreviewed content edit cannot silently re-point saved references.
- **Versioned storage.** `src/study/db.ts` owns IndexedDB (`jelet-prep-study`,
  v1, six stores), ordered migrations, transactional commit semantics, an error
  taxonomy and a version-change guard. `src/study/repository.ts` is the only
  write path; features never open a transaction themselves.
- **Real interactions.** Reader: bookmark toggle, saved-position resume with an
  explicit "resumed at question N" notice and a start-again action, throttled
  (600 ms) position writes, and a plain-text note editor with save/delete,
  character limit, conflict handling and unsaved stays-in-the-box reporting.
  Syllabus: per-topic `Studying`/`Revised`/`Not started` controls with visible
  chips. New screens: `/saved` (bookmarks, notes, edit, delete, orphans),
  `/progress` (derived counts, subject bars, recently opened, explicit
  "no scored practice" section) and `/settings` (storage state, counts, export,
  validated import with merge/replace preview, confirmed reset, privacy notes).
  Home shows a workspace summary with a real "continue reading" row.
- **Backup.** Versioned JSON envelope with app/kind/schema/content references,
  2 MB cap, per-store limits, full record validation, orphan report, deterministic
  merge, atomic replace with an on-device safety copy, and idempotent re-import.
- **Multi-tab.** `BroadcastChannel` refresh of committed state, explicit note
  conflict choice, and import re-read inside the transaction. Positions are
  last-write-wins place markers, documented as such.

### Actual checks

- `npm run lint`: passed (Prettier formatting only; not semantic lint).
- `npm test`: **56 tests passed** in 5 files — 18 carried over from Phase 1 plus
  38 new (5 content-identity, 13 backup/merge, 20 persistence/migration/import).
  They run the real adapter and migrations against `fake-indexeddb`.
- `npm run typecheck` and `npm run build`: passed (Vite/rolldown still prints
  harmless Lucide `"use client"` directive notes).
- `npm run test:e2e` against the production preview: **23 tests passed**
  (10 carried over, 13 new) including reload persistence, resume, exact-question
  reopen from `/saved`, progress derived from statuses, export → reset → import
  round trip, rejection of malformed/oversized/newer backups with data intact,
  duplicate import idempotency, replace confirmation and safety copy, two-tab
  live refresh, two-tab note conflict, blocked storage and a simulated quota
  failure that reports the note as unsaved. Full suite re-run with
  `--repeat-each=2` (42 passed) to check for flakiness.
- Accessibility: axe scans now cover 8 routes with seeded saved data and 4 more
  routes in dark theme; no WCAG A/AA violations. This is still automation, not a
  manual screen-reader pass.
- Documented visual fix: dark theme previously left the page canvas light while
  body text turned light (a contrast failure introduced in Phase 1). The `:root`
  dark theme now sets `background: var(--bg)`. The light palette, layout and
  typography are unchanged.

### Deliberate limits

- No scores, keys, timers or attempts; `/progress` states that plainly.
- No cross-device sync, accounts, cloud backup or offline downloads.
- IndexedDB is used directly rather than via a wrapper dependency
  (`idb` was considered and rejected to keep the runtime dependency set and the
  migration code visible in this repository).
- Position throttling is a 600 ms trailing write; a tab closed inside that window
  loses only the most recent move.
- `droppedRecords` reading uses record-level validation, so data written by a
  future schema is reported, not repaired.

### Remaining gates

Phase 0's full source/key audit, rights review, owner design review of the new
workspace screens, manual assistive-technology pass and cross-browser testing
remain open. No PR, merge or deployment was performed in this step.

### Merge and deployment record — 2026-11-02

- Pull request #4 from `arena/5d3e2075-jelet-prep` into `main`; PR run
  41398800142 passed ("Check and build" 20s, Pages job skipped for PRs).
- Merged with a merge commit at 2026-11-02T06:16:29Z → `e7b99b3`.
- `main` push run 41398880485 passed both jobs ("Check and build" 24s,
  "Publish to GitHub Pages" 21s). Deployment 7485622720: state `success`,
  environment `github-pages`, URL https://pabitra27706-oss.github.io/Jelet-prep/ .
- Pages still uses `build_type: workflow`; the workflow file, permissions and
  hosting configuration were not changed.
- Live response headers/HTML could not be fetched from the authoring sandbox
  (network allowlist excludes `pages.github.io`). Confirm the published site in
  a browser; the deployment API reports success, which is not the same as a
  verified page fetch.
