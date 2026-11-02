# Decisions and approval register

## Confirmed owner requirements
Recorded 2026-11-02 (session-local date).

| ID | Decision | Source |
| --- | --- | --- |
| O-01 | Continue the existing JELET-prep repository for West Bengal diploma students. | Owner's initial request |
| O-02 | Build a complete modern working website, not a UI template. | Owner's clarification |
| O-03 | Plan before implementation. | Owner's clarification |
| O-04 | Create the website's docs folder first. | Owner's latest instruction |
| O-05 | Check repository exam information against useful online resources. | Owner's initial request |

## Documentation expansion — 2026-11-02
- O-06: Owner requested detailed, substantial phase descriptions and full preparation before coding.
- Action: expand all six phase specifications; add architecture, risk register and readiness gates. This authorizes planning detail only, not implementation or previously unanswered product proposals.
- Existing phase count and proposed v1 boundary are retained. Greater detail is not a commitment to a longer schedule or extra backend/platform features.

## Proposed, not owner-approved
- English exam content with Bengali/English interface and guidance.
- Free/no ads for the first release.
- Four-week target, dependent on content verification.
- Engineering/Technology Paper I focus; no accounts/backend in v1.
- Practice, notes, progress export/import and offline downloads as described in the roadmap.
- React + TypeScript + Vite, Tailwind, IndexedDB, Vitest and Playwright. These are candidates, not installed dependencies.

Do not describe these as recorded owner answers. Resolve product-shaping proposals in a single approval batch before implementation; do not re-ask confirmed requirements.

## Reversible planning choices
- Preserve existing HTML and Markdown while planning migration.
- Build production screens directly; UI-REFERENCE is a specification, not a throwaway prototype.
- Require verified complete papers and matched keys for scored full-paper mocks.
- Show missing content explicitly; never synthesize missing exam questions, keys or diagrams.

## Playbook adaptation and provenance
Reference inspected: https://github.com/pabi277/AppFlow/tree/57597b3332ad578614a0d9d5609f9cf8a278ee8a

The original prompt left the SHA unspecified. This SHA was resolved during research, not explicitly selected by the owner. Use the playbook as planning provenance, not a runtime dependency or blanket approval of its Android-specific rules.

The owner's website requirement replaces Android/APK/Play milestones with working web previews, production build artifacts and browser tests. Existing repository/branch are retained. No Android package ID or new repository is required. No formal law waiver or longer-than-four-week budget has been approved.

## Approval boundaries
Only documentation work is authorized in this step. Do not infer permission to implement, spend, add ads, deploy, release, open/merge a PR or change repository licensing. Commit/push were not requested. Stay on the assigned session branch and preserve existing work.
