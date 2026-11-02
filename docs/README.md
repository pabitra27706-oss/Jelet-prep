# JELET-prep website documentation

This folder plans a complete working JELET preparation website for West Bengal diploma students. It is not an Android application or a disposable UI template.

## Read in order

1. [DECISIONS.md](DECISIONS.md) — confirmed requirements, proposals and approval boundaries.
2. [RESEARCH.md](RESEARCH.md) — repository audit, official sources and verification gaps.
3. [ROADMAP.md](ROADMAP.md) — implementation phases and acceptance criteria.
4. [UI-REFERENCE.md](UI-REFERENCE.md) — production screen/state specification.
5. [CONTENT-SCHEMA.md](CONTENT-SCHEMA.md) — content provenance and local progress model.
6. [QUALITY.md](QUALITY.md) — testing, accessibility, privacy and release gates.

7. [ARCHITECTURE.md](ARCHITECTURE.md) — layers, routes, data flows and technical decision backlog.
8. [STUDY-DATA.md](STUDY-DATA.md) — implemented local study-data contract (IndexedDB stores, validation, migrations, multi-tab, backup/import, reset).
9. [PRE-CODE-READINESS.md](PRE-CODE-READINESS.md) — approval gates, risk register and start/exit checklists.
10. [Detailed phase specifications](ROADMAP.md#detailed-phase-work-packages) — substantial work packages for all six phases.

## Current status

Phase 1 (library and reader) is merged into `main` and published at
https://pabitra27706-oss.github.io/Jelet-prep/ . Phase 2 (persistent study
workspace) is merged (PR #4) and deployed through the same workflow; its execution
record has the checks, deployment record and remaining limits. Full phase-0
audit (official-source verification, key availability, rights) and owner approval
of the new workspace screens remain open. Nothing beyond Phase 2 is implied.

Detailed planned phase specifications now live in `phases/`; append actual execution evidence there only after implementation. Keep this documentation self-contained and update it alongside implementation.

## Phase 0 evidence (2026-11-02)

- [Content audit report](audits/CONTENT-AUDIT-REPORT.md) — findings by severity, issue register, eligibility matrix, honest limits.
- [Generated content inventory](audits/content-audit.md) — per-paper coverage, missing numbers, placeholders, hashes (regenerate with `npm run audit:content`).
- [Licensing review](LICENSING.md) — code licence vs content rights, open owner decision.
- [Architecture decision record](decisions/ADR-0001-architecture.md) — stack, routing, maths, storage, browser support, scoring contract.

## Implementation evidence

- [Phase 1 evidence](phases/01-library-and-reader.md) — library, reader, syllabus, checks.
- [Phase 2 evidence](phases/02-study-workspace.md) — persistence, backup/import, tests, limits.
- [Study data contract](STUDY-DATA.md) — schema v1, limits, merge rules, multi-tab policy.
- [Content inventory](CONTENT-INVENTORY.md) — actual question-number coverage and source-file hashes.
- [Dependency register](DEPENDENCIES.md) — installed versions, licence and registry activity metadata.
