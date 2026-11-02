# Phase 2 — Persistent personal study workspace

Status: PLANNED.
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
