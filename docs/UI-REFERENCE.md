# Production website screen and state specification

## Direction
A modern, accessible study workspace, not a promotional template. This document specifies the production website; no disposable reference site is planned. Tokens and visuals remain proposed until owner review within the functioning website.

## Screens and states
| Screen | Required states |
| --- | --- |
| Home/dashboard | First visit; actual progress; resume available; no history; storage unavailable |
| Paper library | Loaded; search/filter; no matches; incomplete/unverified labels; load failure; offline availability |
| Paper reader | Loading; loaded; maths/diagram rendering failure; missing question/options; bookmarked; source link; offline unavailable |
| Syllabus explorer | Subjects/topics; search; no matches; not started/studying/revised; stale year warning |
| Practice setup | Eligible content; no verified keys; unsupported/incomplete paper; resumable session |
| Active practice | Single/multiple selection; unanswered; review flag; saved; save failure; timer expired; submit confirmation |
| Results/revision | Score and subject breakdown; unanswered; wrong-answer queue; explanation unavailable; empty revision queue |
| Bookmarks/notes/history | Empty; saved; editing; deleted; persistence failure |
| Downloads/settings | Not downloaded; downloading; available; failed; update available; storage quota; offline; theme selection |
| Backup/reset | Export success/failure; invalid/incompatible import; merge/replace confirmation; reset confirmation |
| Exam information/about/privacy | Source and year; verified/unverified/superseded; unavailable source; independent-site notice |
| Global | Not found; route error; network error; keyboard focus; reduced motion |

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
| --- | --- | --- | --- |

Populate from implementation, not invented component names.

## Approval record
No visual approval or token freeze has occurred. Language direction remains unconfirmed. No frontend dependencies have been installed.
