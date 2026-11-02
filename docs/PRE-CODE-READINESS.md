# Pre-code readiness and execution contract

Status: Phase 1 merged/deployed; Phase 2 (persistent study workspace) implemented 2026-11-02 for preview review. The original pre-code gates below remain partly open and are not marked complete; see the phase 2 evidence record for current results.

## What “fully prepared” means
Every major capability has a bounded work package, an owner for unresolved decisions, a data contract, failure behaviour, acceptance tests and an exit gate. It does not mean every research uncertainty is resolved or that coding will reveal no new issues.

## Gate A — product decisions (owner)
- [ ] Confirm practice-companion scope versus library-only scope.
- [ ] Confirm interface/guidance languages; preserve original question wording.
- [ ] Confirm monetization model; proposed v1 is free/no ads.
- [ ] Confirm time budget and trade-off priority; four weeks remains proposed.

Use one combined decision batch; do not re-ask confirmed requirements. Complete modern website, existing repository and plan-before-code are already decided.

## Gate B — evidence and architecture (agent work, not questions)
- [ ] Content manifest identifies stream, missing ranges, diagrams and source for every paper.
- [ ] Official final key availability and paper/set mapping are recorded.
- [ ] Syllabus/yearly guidance gaps and superseding notices are tracked.
- [ ] Rights/credit issues are explicit; owner selects repository licence before publication.
- [ ] Candidate dependency versions, licences and maintenance verified; reuse choices recorded.
- [ ] Maths renderer tested against representative repository notation.
- [~] Routing/base path and storage/versioning contracts recorded
  (`docs/ARCHITECTURE.md`, `docs/STUDY-DATA.md`). Browser-support matrix and
  scoring contracts remain open.

These research tasks can be completed during approved phase 0; they must close before the affected implementation or publication. Documentation alone does not claim they are already done.

## Gate C — execution authorization
- [ ] Owner approves roadmap and authorizes phase 0 implementation.
- [ ] Scope excludes unapproved backend/accounts/ads/payment work.
- [ ] Work stays on the assigned session branch; no new branch/repository.
- [ ] Release/deployment/PR/merge and money actions retain independent gates.

## Start-of-phase checklist
1. Read decisions, roadmap, phase specification and prior handover.
2. Check working tree and preserve existing changes.
3. Confirm dependencies and data eligibility; identify blockers before building around them.
4. List this phase's 2–4 parts and exact acceptance scenarios.
5. Execute only approved scope; log reversible implementation decisions.

## End-of-phase checklist
- Demonstrate actual production capability, not screenshots alone.
- Run relevant tests/build; record exact commands and failures as well as passes.
- Publish a local working preview/build artifact without implying public deployment approval.
- Update phase evidence, roadmap, decisions and remaining risks.
- Stop for visual/product/external-action gates where required; do not silently increase scope.

## Risk register
| Risk | Trigger/evidence | Mitigation and release consequence |
| --- | --- | --- |
| Incorrect transcription/diagram | Missing/uncertain text, mismatched options | Compare official original; exclude from scoring until verified |
| Wrong key/set | No final key or uncertain numbering | Block scoring; keep clearly labelled reader available |
| Obsolete eligibility/reservation | New notice or unresolved exception | Year/source labels; reconcile notices; withhold definitive guidance |
| Content rights unclear | No redistribution basis recorded | Resolve or link original; block affected publication |
| Time overrun | Audit bigger than estimate | Reduce verified-paper coverage; never reduce accuracy gates |
| Browser data loss | Storage eviction/clearing/failure | Honest local-only notices, export/import, transactional writes |
| Offline false promise | Incomplete cache or stale metadata | Verified bundles, failure states, versioned safe updates |
| Historic pattern mismatch | Old stream/category differs | Source-specific patterns; no current-rule assumption |
| Scope creep | Accounts, AI lessons, rankings requested mid-phase | Record change; reprice/approve before implementing |

## Phase 2 status note (2026-11-02)
Storage/versioning is now implemented and tested; it does not close Gate B's
content-audit items. Still open: full official-source comparison of all seven
papers, answer-key availability and set mapping, rights/licence review, owner
design approval for the new workspace screens, manual assistive-technology pass,
cross-browser matrix and scoring contracts (Phase 3). Multi-tab and storage-failure
behaviour are now defined and tested rather than deferred.

## What is intentionally not ready yet
Dependencies and local build/test tooling are installed; see DEPENDENCIES.md, phase 1 and phase 2 evidence for actual checks. Full dataset audit/key verification, owner design approval, remote CI/local-only run logs, cross-browser testing and repository/content licence review remain open. Phase 1 is publicly deployed (owner-approved); no further deployment, PR or merge is authorized by the Phase 2 instruction. These are visible tasks, not concealed completion claims.
