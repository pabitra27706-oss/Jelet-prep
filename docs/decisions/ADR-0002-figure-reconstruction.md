# ADR-0002 — Figure reconstruction for diagram-dependent questions

- **Status:** Accepted (owner decision), with constraints
- **Date:** 2026-11-02
- **Decided by:** Repository owner, in response to a direct question about the
  72 figure-dependent questions
- **Supersedes:** nothing
- **Related:** `docs/LICENSING.md` (content-rights posture, still open),
  `docs/audits/CONTENT-AUDIT-REPORT.md` §3.2, `docs/CONTENT-SCHEMA.md`,
  `docs/audits/OFFICIAL-PAPER-VERIFICATION.md`

## Context

72 of the 690 questions in `pyq-md/` reference a figure that is not reproduced in
the transcription. They store `[Diagram]` or `(diagram)` instead of the original
artwork. The verification pass of 2026-11-02 confirmed every one that was checked
is genuinely figure-based in the official booklet — the transcription is honest,
not defective. The questions are nevertheless dead ends for a student today: the
stem refers to something that is not there.

`docs/LICENSING.md` records that whether diagrams may be reproduced, and whether
they may be redrawn from the originals, are **both unestablished**. Storing crops
of official artwork would settle an open rights question by accident. The owner
was shown four options — page-links to the original, crop-and-self-host, redraw as
SVG, or leave alone — and chose **redraw as original vector artwork**.

## Decision

Figures for diagram-dependent questions will be **reconstructed as original SVG
line art**. No pixel data from any official PDF will be committed to this
repository.

This is a deliberate acceptance of a residual risk, recorded rather than hidden:
a redrawn figure is a **derived work**. Whether that is permitted is still an open
legal question, and this ADR does not resolve it. What it does is pick the option
with the smallest copying footprint and the clearest rollback.

## Constraints

These are not suggestions; a figure that breaks one is not shippable.

1. **No official pixels.** No cropped raster, no traced bitmap, no embedded image
   from the official PDFs or any mirror. Hand-authored SVG primitives only.
2. **Labelled as reconstructed.** Every asset carries an in-file comment naming
   the source paper, page and question, and the reader surface must not present a
   reconstructed figure as official artwork. The provenance comment block is part
   of the asset, not optional metadata.
3. **Accessible description required.** Each SVG carries `<title>` and `<desc>`
   that convey the figure's content, not merely its existence, plus a text
   equivalent in the content model. A figure with no description is not done.
4. **Never scoreable on the strength of a redraw.** A reconstructed figure does
   not verify a question and does not unblock scoring. Questions whose _options_
   are figures (19 of the 72 are also flagged for missing options) stay excluded
   from any future scored practice regardless of how good the drawing is.
5. **Geometry over appearance.** Where the source sketch is visually approximate
   but the text states a value (a 30° angle, an 80 N plateau), draw the stated
   value correctly and say so in the provenance comment. Faithfulness to the
   stated physics beats faithfulness to the scan.
6. **Fidelity is recorded, not assumed.** Each redraw is compared against the
   official page and the comparison result is written into the manifest. An
   unchecked redraw stays `not started` in the manifest's evidence column.
7. **Ambiguity is escalated, not guessed.** Where the scan is too poor to decide
   what the curve or structure actually is, the figure stays a placeholder and the
   question is listed for owner/original review. Inventing a plausible-looking
   graph that changes the answer is worse than an honest gap.
8. **Byte-identical source preserved.** `pyq-md/*.md` is not modified. Figures are
   a separate asset layer referenced by question ID.

## Consequences

**Accepted costs**

- Labour. The two pilots took roughly 15 minutes each including the
  against-original comparison. 72 figures is a real project, not an afternoon.
- Ongoing accuracy liability: a wrong redraw is a content error this project
  authored itself, where a placeholder was merely incomplete.
- Accessibility work is doubled: the figure and its description both need review.

**Benefits**

- Diagram questions become readable without republishing anyone's artwork.
- The SVG layer is resolution-independent, themeable, and dark-mode compatible — a
  cropped JPEG never is.
- Triggered a reusable pipeline: `docs/figures/manifest.json`,
  `scripts/render-figures.mjs` for visual QA, and a documented provenance format.

**Rollback**

Cheap and total. Delete the SVG, set the manifest entry back to `not started`, and
the reader falls back to the existing placeholder. No other artefact depends on a
figure existing.

## Rejected alternatives

| Alternative                                        | Why rejected                                                                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Crop and self-host the official artwork            | Best fidelity, but silently closes an open rights question by storing the publisher's pixels. Also non-resolution-independent and unthemeable. |
| Link only, no redraw                               | Legally safest and nearly free, but leaves 72 questions as dead ends, which is the actual product problem being solved.                        |
| Leave the placeholders alone                       | Honest but punts indefinitely; the owner explicitly declined this.                                                                             |
| Reproduce the stem only, drop the figure questions | Destroys paper completeness and creates new gaps in an otherwise complete paper.                                                               |

The page-link approach is **not** discarded — `docs/figures/manifest.json` records
`officialPage` for 67 of the 72, so a "view the original, p. N" affordance can
still ship as a complement or as a stopgap for the 5 figures that cannot be
redrawn (2019, no booklet supplied). ADR-0002 and the link affordance are
compatible; only the cropped-pixels option is excluded.

## Pilot evidence (2026-11-02)

Two figures redrawn and compared against the official booklets:

| Figure                    | Source                         | Result                                                                                            |
| ------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `2017-q72-bar-cord.svg`   | JELET-2017 Paper-I, p. 14, Q72 | Match. Source sketch is not to scale at 30°; redraw uses exact 30.0° geometry, noted in the file. |
| `2017-q81-force-time.svg` | JELET-2017 Paper-I, p. 17, Q81 | Match. Plateau 80 N from 0–5 s, straight fall to 0 N at 10 s, dashed guide at 5 s.                |

Both were rendered headlessly and inspected against a page render of the official
PDF before being accepted.
