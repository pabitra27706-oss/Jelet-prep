# Proposed website architecture

Status: design only; reversible technical choices pending phase-0 verification. React/TypeScript/Vite and related packages are candidates, not installed or approved dependencies.

## System boundary
A static-hosted browser application with repository-managed content and device-local progress. No backend, authentication, cloud sync, payments or analytics in the proposed v1. Static hosting does not mean a static UI: reading, practice, scoring, persistence and downloads execute in the browser.

## Layers and ownership
| Layer | Responsibility | Must not do |
| --- | --- | --- |
| App shell/routing | Navigation, layout, themes, route errors | Embed scoring rules or invent data |
| Feature modules | Library, reader, syllabus, study workspace, practice, downloads | Write raw database records from arbitrary components |
| Domain | Eligibility, marking, session transitions, import validation | Depend on UI framework or browser rendering |
| Content repository | Read versioned manifests/questions/keys and sources | Equate loaded content with verified content |
| Progress repository | Transactions, migrations, bookmarks, attempts, backup | Report saved before durable success |
| Offline adapter | Cache/download/update lifecycle and availability | Delete progress to clear downloads |
| Build validation | Sources/IDs/schema/eligibility checks | Silently repair unknown exam content |

Dependency direction: screens call feature services; services call domain rules and repository interfaces; browser adapters implement those interfaces. Keep deterministic domain functions testable without a browser.

## Proposed route map
- `/` — home and real local study summary.
- `/papers` — metadata search/filter library.
- `/papers/:paperId` — reader; stable question target in URL.
- `/syllabus` — subject/topic explorer.
- `/practice` — setup and eligibility explanation.
- `/practice/:attemptId` — active/resumable local session.
- `/results/:attemptId` — local results and review.
- `/saved` — bookmarks and notes.
- `/history` — actual attempt history.
- `/downloads` — offline content management.
- `/settings` — theme, backup/import/reset and language if selected.
- `/exam-info`, `/about`, `/privacy` — sourced guidance and trust pages.

Names are proposed, not implemented routes. Host fallback/base-path choice must be verified before fixing clean-path routing; use a documented alternative if the host cannot support refresh. Local attempt IDs are not shareable cloud resources: opening one on another device shows an honest unavailable state.

## Data flows
### Reading
Route ID → content manifest → paper/asset load → safe text/maths rendering → optional reading-position update. Show source/completeness independent of loading success.

### Practice
Eligible manifest + verified key/rules → immutable attempt snapshot → durable selected responses/deadline → idempotent domain submission → atomic result storage → review. Persist explicit content/key versions to avoid silent changes during updates.

### Backup
Versioned progress export → user-controlled file. Import → structural/size/version validation → conflict preview → explicit merge/replace → transaction. Invalid input cannot partially modify storage or execute HTML.

### Offline
Reviewed manifest → asset bundle download → cache integrity/availability confirmation → downloaded badge. Activation/update must respect active attempts and retained snapshot assets. Official external links are not automatically cached.

## Schema version policy
Content version, progress schema version and scoring-rule version are separate. Migrations are tested with fixtures from prior versions. Keep original source/question IDs stable. Content removal leaves recoverable orphan references rather than erasing notes silently. Browser cache and progress database have independent clear/reset paths.

## Error policy
Useful feature-level recovery for missing content, malformed records, storage denial/quota, incompatible imports, math/asset failure and network outage. Preserve user work first. No catch-all that replaces genuine errors with fake success. A readable but uncertain question is not automatically scoreable.

## Proposed budgets to baseline in phase 0
Avoid loading every historical paper/diagram at startup; split heavy reader/practice code; render long papers without excessive browser work; measure initial JS/content sizes and mobile timings. Set numeric budgets from the selected stack and representative content, not invented benchmark scores. Define supported browsers and a reproducible test viewport/network profile before performance acceptance.

## Operations and deployment
Runtime assets locally bundled; content and app builds versioned together. Use relative browser URLs, a compatible hosting base path and tested service-worker scope. Configure dev preview for 0.0.0.0 and preview host acceptance. No public deployment, paid host or domain action without owner permission. Rollback must account for cached app versions and existing local data, not just replacing HTML.

## Open architecture decisions to close in phase 0
One maths renderer; dependency versions/licences; static host/routing strategy; supported browsers; content packaging; plain-text/Markdown rendering policy; IndexedDB adapter; cache tooling; multi-tab coordination; translation format if selected; exact performance budgets. Researchable choices are agent decisions with evidence, not repeated owner questions.

## Implemented subset — 2026-11-02
React + TypeScript + Vite, plain CSS (not Tailwind), hash routes, lazy raw-content chunks and lazy sanitized KaTeX renderer are installed. Exact package versions and licence/activity signals are in DEPENDENCIES.md. Current routes are overview, papers/library, paper reader, syllabus and about/sources. Future study/practice/download routes listed above do not exist yet. Theme alone uses localStorage; IndexedDB and service-worker adapters are deferred. The legacy files remain unchanged. Local tests/build pass; no remote CI or public deployment is claimed.
