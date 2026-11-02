# Local study data contract (Phase 2)

Status: implemented 2026-11-02 on the session branch, pending owner review.
Scope: device-local study workspace only. No account, backend, sync, analytics or
offline download exists.

## Ownership in code

| Module                        | Responsibility                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/content.ts`              | Stable `CONTENT_VERSION`, paper/question/topic ID builders                                               |
| `src/study/records.ts`        | Record types, limits, shared validators, note/topic/status rules                                         |
| `src/study/db.ts`             | The only IndexedDB adapter: versioned migrations, transactional writes, error taxonomy                   |
| `src/study/repository.ts`     | The only write path used by features (bookmarks, positions, notes, topics, history, import, reset, meta) |
| `src/study/backup.ts`         | Pure backup envelope, validation, orphan detection, merge/replace planning                               |
| `src/study/StudyProvider.tsx` | React state, honest save feedback, multi-tab refresh                                                     |
| `src/pages/*`                 | Screens; they never touch IndexedDB directly                                                             |

Invariant: a UI "Saved on this device" message is only shown after the IndexedDB
transaction's `oncomplete` fired. A rejected write is reported as **Not saved**,
and the text the student typed stays in the editor.

## Database

- Database name `jelet-prep-study`, version `1`.
- Object stores and key paths:
  - `bookmarks` → `questionId`
  - `positions` → `paperId` (one saved position per paper)
  - `notes` → `noteId` (`note:<questionId>`, one note per question)
  - `topics` → `topicId`
  - `history` → `entryId` (`<kind>:<targetId>:<ISO timestamp>`)
  - `meta` → `key` (only the pre-replace safety copy uses it today)
- Indexes: `notes.questionId`, `history.at`.
- Migrations are an ordered map (`MIGRATIONS[n]` upgrades `n-1` → `n`). A future
  release appends a step and bumps `DB_VERSION`; existing records are preserved.
  An older tab that meets a newer database reports _"study data from a newer
  version"_ instead of corrupting it (`VersionError`), and a tab whose database
  is being upgraded closes on `versionchange` so the upgrade is not blocked.

## Records and limits

All timestamps are ISO-8601 UTC strings. All IDs are derived, not random.

| Record   | Content                                                                      | Validated                                                               |
| -------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Bookmark | question ID, paper ID, question number, created                              | ID format, paper/question agreement, number 1–100                       |
| Position | paper ID, question number, updated                                           | paper ID format, number 1–100                                           |
| Note     | note ID, question ID, paper ID, question number, plain text, created/updated | one note per question, text 1–2000 chars after trim, no empty notes     |
| Topic    | topic ID, subject ID, title, status (`studying` \| `revised`), updated       | topic ID format, status in the allowed set. Absence means "not started" |
| History  | entry ID, kind (`paper` \| `syllabus`), target, timestamp                    | entry ID matches its content; 60 most recent entries retained           |

No name, email, phone, roll number, rank card or device identifier is stored.
Notes are never rendered as Markdown or HTML: they are plain text in a textarea
and then in a `white-space: pre-wrap` element.

## Write, retry and error policy

- Every mutation runs in one transaction; `runTransaction` resolves on
  `complete`, rejects on `error`/`abort`, and classifies failures as
  `unavailable`, `denied`, `quota`, `blocked`, `version`, `validation` or
  `unknown` with a plain-language message.
- There is no silent retry loop. A blocked/full/quota write surfaces as unsaved
  and the student retries deliberately (the export/reset guidance appears in the
  quota message).
- Validation happens before the write and again inside the transaction for
  imports, so a foreign record shape can never be persisted.
- Reads filter records through the same validators; anything that fails is
  excluded from state and counted, so the progress screen can say _"N stored
  record(s) were skipped"_ instead of silently showing invented data.

## Multi-tab behaviour

- A `BroadcastChannel` (`jelet-prep-study-sync`) announces every committed
  change; other tabs re-read committed state. A `visibilitychange` refresh
  covers tabs that were backgrounded.
- Notes carry the `updatedAt` the editor was based on. Saving with a stale
  baseline throws `NoteConflictError`: the UI keeps the local draft and asks the
  student to either load the other tab's version or deliberately keep their own.
  Nothing is overwritten implicitly.
- Import merge re-reads current records _inside_ the import transaction, so a
  concurrent tab cannot be overwritten with a stale preview.
- Reading positions are last-write-wins by design (they are a place marker, not
  user prose); the newest `updatedAt` wins and the dashboard shows that paper.

## Backup envelope

```json
{
  "app": "jelet-prep",
  "kind": "study-workspace-backup",
  "schemaVersion": 1,
  "exportedAt": "2026-11-02T10:00:00.000Z",
  "contentVersion": "2026-11-02.1",
  "data": {
    "bookmarks": [],
    "positions": [],
    "notes": [],
    "topics": [],
    "history": []
  }
}
```

Import rules:

1. Reject files over 2 MB before reading, and reject non-JSON, wrong `app`/`kind`,
   missing/invalid `schemaVersion`, `schemaVersion > 1` (newer app) and
   `schemaVersion < 1`.
2. Reject when a store is not a list, exceeds its per-store limit, or when any
   record fails validation — the whole file is refused with up to six reasons.
   A rejected file never changes storage.
3. A missing store section is accepted as empty with a warning. A different
   `contentVersion` only warns.
4. Duplicate keys inside one file collapse to the newest record.
5. The preview shows incoming vs. existing counts and, per store, how many
   records are new / newer / kept as-is, plus orphaned references.
6. **Merge** (default): one record per key; newer `updatedAt` (bookmarks:
   `createdAt`) wins; ties keep the local record. Re-importing the same file is
   idempotent because history keys include their timestamp.
7. **Replace**: requires typing `REPLACE`; clears each store and writes the file
   in the _same_ transaction, so a failure leaves previous data intact. Before
   writing, the current export is stored under `meta/pre-replace-backup` so a
   safety copy can be downloaded afterwards.
8. Orphaned references (paper removed, question number in a known gap, topic
   removed from the syllabus) are preserved and flagged with a remove action.
   Notes are never deleted automatically.

## Reset

Typing `RESET` in a modal dialog clears all six stores, including the safety
copy. Papers, the syllabus, the theme preference and downloaded backup files are
untouched. An empty workspace disables the button instead of pretending to clear.

## Content identity and migration outlook

`CONTENT_VERSION = "2026-11-02.1"` covers the seven paper transcriptions and the
syllabus summary. `src/study/ids.test.ts` pins a SHA-256 fingerprint of the paper
corpus, so an unreviewed content edit fails the unit tests instead of silently
re-pointing saved bookmarks and notes. If content changes deliberately, bump
`CONTENT_VERSION` and add a migration or an orphan report; never renumber the
2019 file to "fix" its year conflict.

## Not covered by this version

Attempts, scores, timers, answer keys, offline downloads, cross-device sync,
multiple named profiles and cloud backup. Scored practice remains blocked on
verified keys; the progress screen says so instead of showing zero-valued scores.
