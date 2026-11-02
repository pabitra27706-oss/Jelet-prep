# JELETprep

A working, mobile-friendly syllabus and previous-year paper library for West Bengal diploma students. Independent from WBJEEB.

## Current increment
- Seven paper transcriptions with honest source/completeness labels.
- Year/keyword and historical/recent-format filtering, with URL-persisted filters.
- Question-index reader, maths rendering, navigation and font-size controls.
- Four-subject 2026 syllabus explorer with searchable, expandable topic groups.
- Responsive navigation, light/dark theme and sources/privacy information.

**Not yet included:** scored mocks, answer keys, bookmarks, study-progress persistence, offline downloads or accounts. All transcriptions await official-original verification. The 2019 file has a year conflict; known missing question numbers are flagged.

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
npm test           # content and safe-rendering unit tests
npm run build
npm run preview -- --port 4173
# In a second terminal, while the preview is running:
npm run test:e2e
```

The browser test configuration uses an npm-packaged Linux Chromium to avoid restricted CDN downloads and extracts its temporary Linux shared libraries. It requires Linux x64/compatible architecture and `tar`; other platforms should adapt the Playwright launch configuration to a locally installed supported browser. `TEST_BASE_URL` can override the test origin. Browser screenshots/results remain ignored.

Routes use hashes (for example `/#/papers/2024?q=2`), allowing refresh without SPA server fallback. Vite uses relative asset paths for static subpath hosting. There is no localhost browser-facing API, backend or public deployment configured. Production output is in `dist/`.

## Source and licence boundaries
Existing raw Markdown and legacy HTML are preserved. The modern runtime bundles its own renderers/fonts; it does not fetch CDN scripts. Repo licence and exam-content publication rights remain owner/publication-review decisions; do not assume a third-party package licence covers question papers.

Start with [documentation](docs/README.md), [roadmap](docs/ROADMAP.md), [phase 1 evidence](docs/phases/01-library-and-reader.md), [content inventory](docs/CONTENT-INVENTORY.md) and [dependencies](docs/DEPENDENCIES.md).

## Public website and deployment

Website: **https://pabitra27706-oss.github.io/Jelet-prep/**

`.github/workflows/pages.yml` installs locked dependencies, checks formatting, runs unit tests and builds Vite. Pull requests only validate; pushes to `main` publish the built `dist/` artifact through GitHub Pages. Pages settings must use **GitHub Actions**, not branch/root publishing. No custom deployment secrets are needed.

Check the **Actions → Build and deploy website** run before assuming a change is live. To retry a deployment, use its manual workflow trigger on `main`. To roll back, revert the problematic change through a reviewed PR; the resulting main push republishes the prior application. Deployment does not erase the original repository content, but only compiled website assets are published.
