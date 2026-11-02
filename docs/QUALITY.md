# Quality and release gates

## Automated checks

- Type check, lint and production build.
- Content validation: IDs, references, completeness, source metadata, key/set matching.
- Scoring units: correct/wrong/unanswered Category I; multiple selections in Category I; all/partial/no correct selections in Category II; any wrong selection; no rounding drift.
- Historic patterns use source-specific scoring, not assumed current rules.
- Persistence/migration/export/import/reset tests, including malformed files and quota/storage failures.
- Browser tests: find/read paper, deep-link refresh, bookmark/resume, progress, practice/submit/results, backup/restore and offline restart.

## Accessibility and responsive checks

Narrow mobile through desktop; keyboard-only flows; semantic landmarks/headings; accessible names; visible focus; contrast; reduced motion; readable equations and diagram alternatives. Use automated checks plus a documented manual screen-reader/keyboard pass; do not claim automation proves full accessibility.

## Offline and update checks

Show what is actually downloaded. Test a fresh offline visit separately from an offline restart after download. Uncached content must not pretend to load. Version caches, disclose stale guidance and avoid losing attempts during updates. Test deployment under the chosen base path and refresh fallback.

## Security and privacy

Sanitize rendered content; no arbitrary script execution from Markdown/imports. Bundle runtime dependencies rather than relying on unpinned CDNs. Review licence/maintenance/version before adoption. No credentials or participant identities in Git. No analytics, ads, payments or backend without explicit decisions and truthful privacy documentation. External links must remain distinguishable from cached content.

## Release checklist

- Required tests/build actually run; commands and outcomes recorded.
- Source, completeness and verification labels reflect actual audit results.
- Dependency and content rights reviewed; repository licence chosen by owner before publication.
- Official-source links, credits, privacy and independent-site statement present.
- No dead controls, fake stats, fabricated explanations or hidden placeholder features.
- Local-only claims match behaviour: storage denial/quota produces an explicit
  "not saved" state, the dashboard shows only derived counts, and scored practice
  is described as absent rather than displayed as zeros.
- Working preview and production artifact inspected; unresolved risks disclosed.
- Hosting/domain configuration verified; public deployment separately authorized.

Performance targets are to be baselined in phase 0 and measured against representative mobile conditions. Do not invent Lighthouse scores, CI status or user validation results.
