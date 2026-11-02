# Phase 3 — Verified practice and reliable mock engine

Status: PLANNED.
Dependencies: source-matched verified questions/keys and marking rules; durable storage; complete verified papers for full mocks. A missing verified dataset is a blocker, not permission to invent one.

## Outcome
Students answer real eligible questions, resume a session and receive reproducible, source-correct results.

## 3-A — Eligibility pipeline and pure scoring
- Validate question text/options, answer keys, paper/set mapping, categories and marking-rule versions.
- Eligible single-question practice and full-paper mocks have different completeness gates. Never fill a 97-question paper to 100 with fabricated items.
- Store content/key/rule version snapshots per attempt. Later corrections must not silently rewrite historical results.
- Keep scoring independent of UI/storage. Support only documented patterns; historical rules require their own verified definitions.
- Category I baseline: +1 correct; −0.25 wrong or multiple selected; 0 unanswered.
- Category II baseline: 2 for all correct only; proportional credit for a correct subset without wrong selections; 0 for any wrong selection or unanswered.
- Use exact fractional calculations or a documented precision strategy; round for display only.

## 3-B — Session state machine and controls
- Define draft → active → submitted; full timed mocks may additionally expire. Submission must be idempotent.
- Setup shows source/year/pattern, eligible count, duration and key status before starting.
- Correct single/multiple-answer controls, question palette, marked-for-review, clear response, previous/next and submit confirmation.
- Persist answers and timing state without losing an edit during route changes.
- Timed mocks use an absolute deadline, not decrement-only intervals; reload/background/sleep cannot reset time.
- On expiry, preserve answers and finalize exactly once. Local device time is not tamper-proof; no competitive/exam-security claim.
- Prevent conflicting edits from multiple tabs with a session lock or explicit read-only conflict state.

## 3-C — Results and useful revision
- Show score/max, answered/unanswered, correctness/partial credit and subject breakdown.
- Show selected options against verified correct options with per-question mark details.
- Build wrong-answer revision queue; explanations are optional and explicitly unavailable unless reviewed.
- Keep practice history distinct from formal timed mocks; do not produce percentile/rank predictions from local attempts.
- For corrected keys, show provenance/version and a deliberate re-evaluation path if supported; preserve original result context.

## Acceptance scenarios
- Correct Category II subset earns proportional credit; adding one wrong option yields zero.
- Multiple options in Category I are treated as incorrect even if one is correct.
- Refresh, backgrounding and device sleep preserve answers and respect deadline.
- Double-click submit or two concurrent expiry events cannot create duplicate attempts.
- Missing/unverified key blocks scoring with a clear explanation.
- Full mocks are unavailable for incomplete papers; verified practice subsets remain accurately labelled.
- A content update does not silently change an in-progress question or an old score.

## Tests and handover
Table-driven scoring tests for every rule; randomized invariants where useful; fake-clock tests for timing/expiry; integration tests for atomic submission; end-to-end completed and resumed attempts. Provide audited eligible coverage, known exclusions, working preview and build evidence. If data verification prevents completion, mark phase blocked and keep the reader usable rather than claiming full practice readiness.
