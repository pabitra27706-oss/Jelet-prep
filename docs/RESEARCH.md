# Research and content audit

## Scope and evidence standard
Research supports an existing JELET website; unrelated Android opportunity discovery and Play Store review analysis are out of scope. No market-demand or retention evidence has been collected. Product benefits below are hypotheses, not proven demand.

Sources were retrieved in the preceding research turn. That response labelled its check date 2026-11-01; this documentation is recorded on session-local date 2026-11-02. Source retrieval has not been repeated in this docs-only step.

## Sources
- S1: WBJEEB JELET-2026 Information Bulletin, released 18 March 2026: https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/2026/03/20260318287108702.pdf
- S2: Official current events and subsequent notices: https://wbjeeb.nic.in/current-events-jelet/
- S3: Official historical question-paper archive: https://wbjeeb.nic.in/jelet-old-question-papers/

S1 is a year-specific baseline. Later official notices can supersede it. Do not infer any 2027 dates or eligibility from 2026 material.

## Repository baseline
- `pyq-index.html`: existing HTML/CSS/JavaScript reader; loads marked and MathJax from external CDNs, fetches local Markdown and inserts rendered HTML.
- `syllabus.md`: 2026 syllabus summary, pattern, eligibility, fees and reservation guidance.
- `pyq-md/`: transcriptions for 2017, 2018, 2019, 2021, 2022, 2024 and 2025.
- No build/test setup or root licence file observed during initial inspection.

### Known content gaps
- 2022 explicitly omits questions 86–90.
- 2024 explicitly omits questions 60–62.
- Older content includes diagram placeholders/unreproduced options; exact per-paper coverage requires audit.
- 2025 contains 100 numbered questions, but numbering alone does not establish accuracy or completeness.
- No source-verified answer-key dataset was identified.
- Full original-PDF comparison and a line-by-line syllabus audit remain incomplete.

### Bulletin checks completed
| Claim | Finding | Source location |
| --- | --- | --- |
| 13 June 2026, 11 a.m.–1 p.m. | Matches published schedule; historical, not upcoming | S1 §2.1, p6 |
| Paper I: 100 questions, 120 marks | Matches; Maths 40/50, Physics 30/35, Chemistry 20/25, FEEE 10/10 | S1 §2.2, pp6–7 |
| Category I | +1 correct, −0.25 incorrect/multiple selections, 0 unanswered | S1 §2.4, p7 |
| Category II | 2 × correct selected / total correct, only if no wrong option selected; otherwise 0 | S1 §2.4, p7 |
| Fee table | Matches reviewed bulletin | S1 p3 |
| Paper I tie-breaking | Matches reviewed bulletin | S1 §2.7, p8 |
| Diploma age limit summary | Marine Engineering exception must remain prominent | S1 §3.1, p9 |
| Jadavpur concession | Name SC/ST/OBC-A/OBC-B/PwD explicitly, not blanket reserved categories; qualification exclusions also apply | S1 §3.2, pp9–10 |
| OBC/reservation guidance | Not fully verified against subsequent notices; do not publish as definitive | S2; S1 §§5–10 |

Historical archive entries distinguish year and candidate stream. Do not automatically classify old papers as current-pattern mocks.

## Scope alternatives
| Option | Value hypothesis | Decision status |
| --- | --- | --- |
| Trusted syllabus/PYQ library | Easier access to source-linked, labelled material | Foundation proposed |
| Practice companion | Library plus verified practice and local revision progress | Recommended, not approved |
| Full platform | Lessons, accounts, rankings and counselling tooling | Defer: content/privacy/maintenance burden |

Niche verdict: a source-transparent, mobile-friendly JELET study companion is a plausible fit for the supplied repository; student demand and repeat use remain unvalidated. Existing content is an asset, not proof of accuracy or a claimed owner marketing advantage.

## Pre-result validation test (proposed)
With 10 consenting target students, at least 8 should find a paper and resume a saved session independently; at least 5 should return within 7 days. If the threshold fails, improve the core flow before expanding scope. No results exist. Keep participant identities out of Git; do not add analytics without an explicit privacy decision.

## Reuse map — preliminary, not dependency clearance
| Capability | Candidate | Verdict | Outstanding evidence |
| --- | --- | --- | --- |
| Existing content/reader | Repository Markdown and HTML | ADAPT after audit | Per-file provenance/rights; sanitization; accuracy |
| Architecture | React + TypeScript + Vite | STUDY | Verify exact packages, versions, licences and current maintenance |
| One UI base | Existing reader visual structure + shared design tokens | ADAPT selectively | Accessibility/mobile audit; avoid unreviewed external template code |
| Maths | Locally bundled MathJax or KaTeX | STUDY; choose one after corpus test | Rendering compatibility, licence, version and maintenance |
| Local data | Browser IndexedDB | BUILD thin persistence layer | Schema migrations, failure and export tests; browser support |
| Offline | Service worker tooling such as Workbox | STUDY | Licence/activity/version; update and cache strategy |
| Testing | Vitest and Playwright | STUDY | Licence/activity/version checks |
| Ads/billing | No SDK proposed for initial release | REJECT for now | Monetization not owner-confirmed |
| Accounts/cloud sync | No backend | REJECT for proposed v1 | Revisit only with approved requirement |

No third-party candidate has had licence/activity verification completed in this docs step. Do not present this table as the completed playbook reuse scan. Phase 0 must close these gaps before selecting dependencies or finalizing estimates.
