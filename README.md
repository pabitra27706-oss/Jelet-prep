# JELETprep

A working, mobile-friendly syllabus and previous-year paper library for West Bengal diploma students. Independent from WBJEEB.

## Current increment

<<<<<<< HEAD
Phase 1 (library and reader) is merged and published. Phase 2 (persistent study
workspace) is implemented on a review branch and **not yet deployed**.
=======

Phase 1 (library and reader) and Phase 2 (persistent study workspace) are merged
into `main` and published.

> > > > > > > f63c9fa (Docs: record Phase 2 merge and Pages deployment)

- Seven paper transcriptions with honest source/completeness labels.
- Year/keyword and historical/recent-format filtering, with URL-persisted filters.
- Question-index reader, maths rendering, navigation and font-size controls.
- Four-subject 2026 syllabus explorer with searchable, expandable topic groups.
- Bookmark any question, resume the saved reading position, and write plain-text
  notes — stored in this browser only and reopened from **Saved & notes**.
- Mark syllabus topic groups as studying or revised; **Your progress** derives its
  counts, per-subject bars and recently-opened list from that real activity only.
- **Backup & settings**: versioned JSON export, validated import with a
  merge/replace preview and explicit confirmation, confirmed reset, storage
  state, and honest "not saved" reporting when the browser refuses or is full.

**Not yet included:** scored mocks, attempts, answer keys, timers, offline
downloads, accounts or cloud sync. Scoring is blocked on verified answer keys,
which do not exist yet (see the [content audit report](docs/audits/CONTENT-AUDIT-REPORT.md)). All transcriptions await official-original
verification. The 2019 file has a year conflict; known missing question numbers
are flagged. There is no mastery score, streak or rank estimate anywhere.

Study data contract (stores, limits, migrations, multi-tab and merge rules):
[docs/STUDY-DATA.md](docs/STUDY-DATA.md).

## Run locally

Requires Node 22.12+ and npm. Dependencies are locked.

```sh
npm ci
npm run dev
```

## Validate and preview the production build

```sh
npm run lint       # Prettier formatting checks
npm run typecheck
npm test           # content, rendering, persistence, backup and audit unit tests
npm run audit:check # fails if the committed content inventory is stale
npm run build
npm run preview -- --port 4173
# In a second terminal, while the preview is running:
npm run test:e2e
```

`npm test` runs the content checks, safe-rendering checks and the Phase 2 storage
tests. Those persistence tests use `fake-indexeddb`, so the real database adapter
and migrations run in Node without a browser. `npm run test:e2e` needs the
production preview from the step above.

The browser test configuration uses an npm-packaged Linux Chromium to avoid restricted CDN downloads and extracts its temporary Linux shared libraries. It requires Linux x64/compatible architecture and `tar`; other platforms should adapt the Playwright launch configuration to a locally installed supported browser. `TEST_BASE_URL` can override the test origin. Browser screenshots/results remain ignored.

Routes use hashes (for example `/#/papers/2024?q=2`), allowing refresh without SPA server fallback. Vite uses relative asset paths for static subpath hosting. There is no localhost browser-facing API, backend or public deployment configured. Production output is in `dist/`.

## Source and licence boundaries

Existing raw Markdown and legacy HTML are preserved. The modern runtime bundles its own renderers/fonts; it does not fetch CDN scripts. Repo licence and exam-content publication rights remain owner/publication-review decisions; do not assume a third-party package licence covers question papers.

Start with [documentation](docs/README.md), [roadmap](docs/ROADMAP.md), [phase 2 evidence](docs/phases/02-study-workspace.md), [local data contract](docs/STUDY-DATA.md), [phase 1 evidence](docs/phases/01-library-and-reader.md), [content inventory](docs/CONTENT-INVENTORY.md) and [dependencies](docs/DEPENDENCIES.md).

## Local data and privacy (short version)

Bookmarks, notes, topic statuses, reading positions and reading history are kept
in this browser's IndexedDB. There is no account, server copy, analytics or sync,
so clearing site data or using another browser loses them — export a JSON backup
from **Backup & settings** first. The theme choice is stored separately in
localStorage and is not affected by a study-data reset.

## Public website and deployment

Website: **https://pabitra27706-oss.github.io/Jelet-prep/**

`.github/workflows/pages.yml` installs locked dependencies, checks formatting, runs unit tests and builds Vite. Pull requests only validate; pushes to `main` publish the built `dist/` artifact through GitHub Pages. Pages settings must use **GitHub Actions**, not branch/root publishing. No custom deployment secrets are needed.

Check the **Actions → Build and deploy website** run before assuming a change is live. To retry a deployment, use its manual workflow trigger on `main`. To roll back, revert the problematic change through a reviewed PR; the resulting main push republishes the prior application. Deployment does not erase the original repository content, but only compiled website assets are published.
