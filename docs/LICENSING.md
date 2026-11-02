# Licensing and rights review (Phase 0-A)

Status: **open — owner decision required before any further publication of content.**
Recorded 2026-11-02. This document states what is known and what is not. It is not
legal advice and does not grant any right.

## 1. Two separate questions

| Question                                                            | Scope                                                                       | Status                                                                                       |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Code licence** — what others may do with this repository's source | `src/`, `scripts/`, `tests/`, build config, docs                            | **Unselected.** No root `LICENSE` file exists. All rights reserved by default.               |
| **Content rights** — whether the exam text may be redistributed     | `pyq-md/*.md`, `syllabus.md`, `pyq-index.html`, any future diagrams or keys | **Unresolved.** Being publicly available on the WBJEEB site is not a redistribution licence. |

The website is currently published (owner-approved on 2026-11-02) with content
labelled as unverified transcriptions. That decision was the owner's; this
document records that the underlying rights question is still open, so it is not
mistaken for a clearance.

## 2. Facts established

- The question papers and the information bulletin are published by WBJEEB on
  `wbjeeb.nic.in` and its file CDN. The project links to those originals
  (see `src/audit/sources.ts` and the "Official paper PDF" links in the reader).
- The transcriptions in `pyq-md/` were already in the repository before this
  work; this project did not fetch them from the official PDFs.
- Papers are marked "unverified transcription" in the library and reader, and the
  About screen states the site is independent of WBJEEB.
- No answer keys are reproduced because none were obtained.
- 72 questions reference diagrams/reactions that are not reproduced; no image
  assets from the official papers are stored in this repository.

## 3. Facts not established (and therefore not claimed)

- Whether the WBJEEB site's terms permit republication of question text.
- Whether the supplied transcriptions themselves derive from a third party.
- The employment/education position of whoever digitised the text.
- Whether diagrams may be redrawn from the originals.
- Whether reproducing 2026 syllabus text and fee/eligibility summaries is allowed.

## 4. Options for the owner (decision needed, not made by the agent)

| Option                       | What it means                                                                                | Cost                         |
| ---------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------- |
| A. Link-only                 | Keep the reader for their own notes; show official links instead of reproduced question text | Loses the core product value |
| B. Permission-seeking        | Ask WBJEEB for written permission to reproduce question papers                               | Time, may be refused         |
| C. Rely on existing practice | Publish as-is with provenance and correction process                                         | Rights risk unchanged        |
| D. Rewrite/redraw            | Author original practice material instead of reproducing                                     | Large content effort         |

Until the owner chooses, the safe behaviours already implemented stay in force:
provenance labels, no keys, no images, an accessible correction route, and no
claim that the content is verified or licensed.

## 5. Runtime dependency licences

Verified from installed package manifests (full table in
[DEPENDENCIES.md](DEPENDENCIES.md)):

- React/React DOM (MIT), Vite (MIT), TypeScript (Apache-2.0), Vitest (MIT),
  Playwright (Apache-2.0), jsdom (MIT), fake-indexeddb (Apache-2.0),
  `@types/*` (MIT), Prettier (MIT) — development only.
- `marked` (MIT), DOMPurify (MPL-2.0 **or** Apache-2.0), KaTeX (MIT; bundled
  fonts under SIL OFL with their own notices), `lucide-react` (ISC; icon assets
  carry upstream icon terms).
- Test-only Chromium via `@sparticuz/chromium` (MIT wrapper; the browser itself
  carries Chromium and third-party notices) — never shipped to users.

No dependency licence grants rights to exam content.

## 6. What publishing requires before Phase 5

1. A chosen repository code licence (owner).
2. A documented answer to the content-rights question, or an explicit decision to
   publish under the current "unverified, link-to-original" posture.
3. Preservation of third-party notices in any distributable that bundles fonts
   or icons.
4. A corrections/removal route that works — currently the GitHub issue link on the
   About screen.
