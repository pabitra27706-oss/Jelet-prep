# Production website screen and state specification

## Direction

A modern, accessible study workspace, not a promotional template. This document specifies the production website; no disposable reference site is planned. Tokens and visuals remain proposed until owner review within the functioning website.

## Screens and states

| Screen                         | Required states                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Home/dashboard                 | First visit; actual progress; resume available; no history; storage unavailable                                          |
| Paper library                  | Loaded; search/filter; no matches; incomplete/unverified labels; load failure; offline availability                      |
| Paper reader                   | Loading; loaded; maths/diagram rendering failure; missing question/options; bookmarked; source link; offline unavailable |
| Syllabus explorer              | Subjects/topics; search; no matches; not started/studying/revised; stale year warning                                    |
| Practice setup                 | Eligible content; no verified keys; unsupported/incomplete paper; resumable session                                      |
| Active practice                | Single/multiple selection; unanswered; review flag; saved; save failure; timer expired; submit confirmation              |
| Results/revision               | Score and subject breakdown; unanswered; wrong-answer queue; explanation unavailable; empty revision queue               |
| Bookmarks/notes/history        | Empty; saved; editing; deleted; persistence failure                                                                      |
| Downloads/settings             | Not downloaded; downloading; available; failed; update available; storage quota; offline; theme selection                |
| Backup/reset                   | Export success/failure; invalid/incompatible import; merge/replace confirmation; reset confirmation                      |
| Exam information/about/privacy | Source and year; verified/unverified/superseded; unavailable source; independent-site notice                             |
| Global                         | Not found; route error; network error; keyboard focus; reduced motion                                                    |

## Layout and behaviour

- Phone-first; desktop sidebar and compact mobile navigation.
- Comfortable reading width, scalable type and diagrams, no whole-page horizontal overflow.
- Real controls, semantic headings, labelled inputs and visible keyboard focus.
- Light/dark themes; strong contrast; no colour-only status indicators.
- No fabricated metrics, reviews or results. Empty dashboards explain how to start.
- Exact original English question text stays distinguishable from any translated guidance.
- Timer/session restoration semantics must be explicit; background tabs must not reset mocks.

## Token register

Not frozen: primary/accent, surfaces, text/muted/error/success colours, font family and maths font, type scale, spacing scale, radii, shadows, breakpoints, focus ring and motion durations. Select accessible values during phase 0 and record approval before broad visual rollout.

## Screen-to-component mapping

| Screen element | Production component | Token references | Evidence |
| -------------- | -------------------- | ---------------- | -------- |

Populate from implementation, not invented component names.

## Approval record

No visual approval or token freeze has occurred. Language direction remains unconfirmed. No frontend dependencies have been installed.

## Implemented production direction — 2026-11-02 (owner approval pending)

- Warm neutral background `#f8f9f6`, white surfaces, dark green `#2c503e` actions, orange accent `#c87a47`, body `#263d33`, secondary text `#636e66`.
- System sans-serif UI and locally bundled KaTeX fonts; no external web-font requests. CSS book illustration is decorative and hidden from assistive technology.
- Sidebar at desktop widths, collapsible navigation below 650px; reader index stacks below 850px. Overflow tested at 320px on principal routes.
- Real overview/library/reader/syllabus/source screens are available. Future practice/download/persistence screen states above are specifications, not shipped navigation.
- Light/dark theme exists; light-theme axe scan passes on tested screens. Broader dark-state/manual screen-reader review is pending.
- Tokens are not owner-frozen. Review the working preview before further visual rollout.

## Token register — recorded from the shipped implementation (2026-11-02)

Values below are read from `src/style.css`, not proposed. **Owner approval is
still pending**; Phase 2 added screens using these tokens without introducing new
ones, so the direction stays as reviewed in Phase 1.

### Colour (light)

| Token       | Value                  | Used for                                    |
| ----------- | ---------------------- | ------------------------------------------- |
| `--bg`      | `#f8f9f6`              | page canvas, inset surfaces                 |
| `--surface` | `#ffffff`              | cards, panels, reader                       |
| `--text`    | `#263d33`              | body copy                                   |
| `--muted`   | `#636e66`              | secondary text, metadata (≥4.5:1 on `--bg`) |
| `--border`  | `#e5e9e2`              | hairlines, card outlines                    |
| `--green`   | `#2c503e`              | primary actions, active navigation          |
| `--soft`    | `#eaf0e7`              | selected/soft fills, notices                |
| `--orange`  | `#c87a47`              | accent, focus ring                          |
| `--shadow`  | `0 3px 14px #253f3204` | card lift                                   |

### Colour (dark)

`--bg #17231e`, `--surface #1e2d26`, `--text #edf0e8`, `--muted #a4b3a9`,
`--border #34483b`, `--green #a8c8ad`, `--soft #2c4132`, `--orange #e6ad7d`.
The dark theme sets the canvas explicitly; this was the Phase 2 accessibility fix
(page text had been light-on-light outside cards).

### Type

- UI: `Inter, ui-sans-serif, -apple-system, "Segoe UI", sans-serif` — system stack,
  no web-font request.
- Maths: KaTeX, locally bundled fonts (SIL OFL).
- Scale in use: 38/28/24/23/22/19/17 px headings; 13/12/11 px body/secondary;
  10/9/8 px labels and badges. Reader text is user-scalable 16–24 px (A−/A+).
- Body copy ≥11 px at 1.7–1.9 line-height; nothing relies on colour alone
  (status uses text and icon, not just tint).

### Spacing, radii, focus, motion

- Spacing: 4/6/8/10/12/13/15/18/22/24/26/34/39 px steps as used in layout.
- Radii: 4 px (chips), 6 px (buttons/inputs), 8–10 px (cards/panels), 50% (dots).
- Focus: 2 px solid `--orange` for links/buttons/summaries, `--green` for inputs,
  5 px offset; every interactive element is keyboard reachable.
- Motion: transitions only on hover/filter; `prefers-reduced-motion: reduce`
  disables animation and smooth scrolling.
- Breakpoints: 1450 / 1150 / 850 / 650 / 360 px; verified no horizontal overflow
  at 320 px on all principal routes.

### Component → token mapping

| Component                      | File                 | Tokens                                             |
| ------------------------------ | -------------------- | -------------------------------------------------- |
| Sidebar/nav                    | `main.tsx`           | `--surface`, `--border`, `--soft`, `--green`       |
| Paper card                     | `main.tsx`           | `--surface`, `--border`, `--muted`, `--bg`         |
| Reader panel + index           | `Reader.tsx`         | `--surface`, `--border`, `--soft`, `--green`       |
| Study panels/stat cards        | `pages/*`            | `--surface`, `--border`, `--bg`, `--muted`         |
| Notices (info/warning/success) | `style.css`          | `--soft`, `--orange` tints, fixed light/dark pairs |
| Dialog                         | `pages/Settings.tsx` | `--surface`, `--border`, `--shadow`                |

### Accessibility evidence

axe-core WCAG 2.1 A/AA scans pass on 8 routes with seeded data (light) and 4 routes
(dark) in the production build. Automated scans are not a substitute for a manual
screen-reader pass, which remains open.
