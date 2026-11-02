# Figure layer — manifest and redraw standard

Status: **2 of 72 reconstructed** (pilots only). Decision record:
[ADR-0002](../decisions/ADR-0002-figure-reconstruction.md).

The 72 questions listed here reference a figure that the transcription does not
contain. Every one checked against an official booklet was confirmed genuinely
figure-based — the transcription is honest, the questions are just unreadable
without the artwork. This directory is the asset layer that fixes that without
republishing anyone's pixels.

`manifest.json` is the machine-readable source of truth; the table below is
generated from it and must not be edited by hand.

## The redraw standard

A figure ships only when all of these hold. They restate ADR-0002 §Constraints for
whoever is drawing.

1. **Vector primitives only.** No cropped, traced or embedded raster from any
   official PDF or mirror. If it cannot be drawn, it is not done.
2. **Provenance in the file.** An XML comment naming the paper, page and question,
   the redraw date, and any deliberate difference from the source sketch.
3. **Title and description that carry meaning.** `<title>` says what the figure
   shows; `<desc>` says what is in it. "Diagram for Q72" is not a description.
4. **Stated values win over drawn ones.** If the text says 30°, draw 30.0° even
   where the scan looks like 25°, and record that choice.
5. **Compare before committing.** Render the SVG, compare it against a page render
   of the official PDF, and record the outcome in the manifest.
6. **Ambiguity is not guessed.** Too poor to read? Leave it a placeholder and flag
   it. A confident wrong graph changes the answer; a gap does not.
7. **Never scored.** A redraw does not verify a question, and the 19 entries with
   `optionsAreFigures: true` stay excluded from scored practice permanently.

## Naming

`docs/figures/<year>/<year>-q<number>-<slug>.svg`, for example
`docs/figures/pilot/2017-q72-bar-cord.svg`. The `pilot/` directory holds the two
worked examples and will be folded into the per-year layout when real authoring
starts.

## Visual QA

`scripts/render-figures.mjs` renders one or more figures to PNG using the same
headless Chromium the e2e suite uses, so a redraw can be compared against the
official page without a browser install:

    node scripts/render-figures.mjs 2017-q72-bar-cord

It writes `/tmp/render-<name>.png`. Pass a filename stem, not a path.

## Counts

| Year      | Figures | Of which figure-option questions |
| --------- | ------- | -------------------------------- |
| 2017      | 10      | 2                                |
| 2018      | 10      | 1                                |
| 2019      | 5       | 2                                |
| 2021      | 12      | 0                                |
| 2022      | 4       | 3                                |
| 2024      | 18      | 5                                |
| 2025      | 13      | 6                                |
| **Total** | **72**  | **19**                           |

Figure kinds below are machine-guessed from the surrounding text and are
**unreviewed** (`kindReviewed: false` throughout). Treat them as a triage hint, not
a classification.

## Known limits

- **5 entries have no page reference.** 2019 — no booklet was supplied, so the
  page cannot be cited and the figure cannot be redrawn from an original.
- **67 entries cite a page, but for 2017/2018/2021 that page is in the main-stream
  block only.** Those booklets also print alternate renumbered 71–100 blocks for
  Printing, Agricultural and other diploma streams; those blocks are outside the
  transcription's scope and are not in this manifest.
- **Redrawn figures are derived works.** `docs/LICENSING.md` still records that
  whether diagrams may be redrawn is unresolved. ADR-0002 accepts that as a known
  residual risk pending a rights decision; it does not clear it.

## The manifest

| Year | Question | Official page | Kind (auto)  | Options are figures | State                 |
| ---- | -------- | ------------- | ------------ | ------------------- | --------------------- |
| 2017 | Q72      | 14            | mechanics    | no                  | reconstructed (pilot) |
| 2017 | Q73      | 15            | unclassified | no                  | not started           |
| 2017 | Q75      | 15            | unclassified | no                  | not started           |
| 2017 | Q81      | 17            | mechanics    | no                  | reconstructed (pilot) |
| 2017 | Q89      | 18            | mechanics    | no                  | not started           |
| 2017 | Q90      | 19            | mechanics    | no                  | not started           |
| 2017 | Q91      | 19            | mechanics    | no                  | not started           |
| 2017 | Q97      | 21            | mechanics    | yes                 | not started           |
| 2017 | Q98      | 22            | mechanics    | no                  | not started           |
| 2017 | Q100     | 23            | mechanics    | yes                 | not started           |
| 2018 | Q27      | 7             | circuit      | no                  | not started           |
| 2018 | Q73      | 15            | mechanics    | no                  | not started           |
| 2018 | Q74      | 16            | unclassified | no                  | not started           |
| 2018 | Q78      | 17            | mechanics    | no                  | not started           |
| 2018 | Q79      | 17            | mechanics    | no                  | not started           |
| 2018 | Q80      | 17            | mechanics    | no                  | not started           |
| 2018 | Q82      | 18            | mechanics    | no                  | not started           |
| 2018 | Q85      | 18            | unclassified | no                  | not started           |
| 2018 | Q89      | 19            | mechanics    | yes                 | not started           |
| 2018 | Q90      | 20            | graph        | no                  | not started           |
| 2019 | Q75      | —             | mechanics    | no                  | not started           |
| 2019 | Q76      | —             | unclassified | no                  | not started           |
| 2019 | Q84      | —             | mechanics    | no                  | not started           |
| 2019 | Q90      | —             | mechanics    | yes                 | not started           |
| 2019 | Q91      | —             | mechanics    | yes                 | not started           |
| 2021 | Q72      | 13            | mechanics    | no                  | not started           |
| 2021 | Q73      | 13            | mechanics    | no                  | not started           |
| 2021 | Q74      | 14            | mechanics    | no                  | not started           |
| 2021 | Q75      | 14            | mechanics    | no                  | not started           |
| 2021 | Q77      | 15            | mechanics    | no                  | not started           |
| 2021 | Q81      | 15            | unclassified | no                  | not started           |
| 2021 | Q84      | 16            | structure    | no                  | not started           |
| 2021 | Q89      | 17            | mechanics    | no                  | not started           |
| 2021 | Q93      | 18            | mechanics    | no                  | not started           |
| 2021 | Q94      | 18            | mechanics    | no                  | not started           |
| 2021 | Q95      | 19            | mechanics    | no                  | not started           |
| 2021 | Q99      | 19            | mechanics    | no                  | not started           |
| 2022 | Q6       | 4             | unclassified | no                  | not started           |
| 2022 | Q49      | 13            | graph        | yes                 | not started           |
| 2022 | Q57      | 14            | graph        | yes                 | not started           |
| 2022 | Q62      | 16            | graph        | yes                 | not started           |
| 2024 | Q6       | 4             | unclassified | no                  | not started           |
| 2024 | Q42      | 11            | graph        | yes                 | not started           |
| 2024 | Q43      | 11            | mechanics    | no                  | not started           |
| 2024 | Q45      | 12            | unclassified | no                  | not started           |
| 2024 | Q49      | 13            | mechanics    | no                  | not started           |
| 2024 | Q54      | 14            | mechanics    | no                  | not started           |
| 2024 | Q57      | 15            | graph        | no                  | not started           |
| 2024 | Q65      | 17            | graph        | no                  | not started           |
| 2024 | Q66      | 17            | graph        | yes                 | not started           |
| 2024 | Q68      | 18            | mechanics    | no                  | not started           |
| 2024 | Q70      | 18            | graph        | no                  | not started           |
| 2024 | Q78      | 20            | structure    | yes                 | not started           |
| 2024 | Q79      | 20            | structure    | yes                 | not started           |
| 2024 | Q89      | 21            | structure    | yes                 | not started           |
| 2024 | Q94      | 22            | circuit      | no                  | not started           |
| 2024 | Q96      | 23            | circuit      | no                  | not started           |
| 2024 | Q97      | 23            | circuit      | no                  | not started           |
| 2024 | Q98      | 23            | circuit      | no                  | not started           |
| 2025 | Q44      | 10            | graph        | yes                 | not started           |
| 2025 | Q46      | 11            | graph        | no                  | not started           |
| 2025 | Q51      | 12            | graph        | yes                 | not started           |
| 2025 | Q54      | 13            | mechanics    | no                  | not started           |
| 2025 | Q55      | 13            | graph        | no                  | not started           |
| 2025 | Q57      | 14            | unclassified | no                  | not started           |
| 2025 | Q58      | 14            | unclassified | yes                 | not started           |
| 2025 | Q62      | 15            | graph        | no                  | not started           |
| 2025 | Q66      | 17            | graph        | yes                 | not started           |
| 2025 | Q85      | 21            | structure    | yes                 | not started           |
| 2025 | Q88      | 22            | structure    | yes                 | not started           |
| 2025 | Q95      | 24            | circuit      | no                  | not started           |
| 2025 | Q100     | 25            | circuit      | no                  | not started           |
| Year | Question | Official page | Kind (auto)  | Options are figures | State                 |
| ---  | ---      | ---           | ---          | ---                 | ---                   |
| 2017 | Q72      | 14            | mechanics    | no                  | reconstructed (pilot) |
| 2017 | Q73      | 15            | unclassified | no                  | not started           |
| 2017 | Q75      | 15            | unclassified | no                  | not started           |
| 2017 | Q81      | 17            | mechanics    | no                  | reconstructed (pilot) |
| 2017 | Q89      | 18            | mechanics    | no                  | not started           |
| 2017 | Q90      | 19            | mechanics    | no                  | not started           |
| 2017 | Q91      | 19            | mechanics    | no                  | not started           |
| 2017 | Q97      | 21            | mechanics    | yes                 | not started           |
| 2017 | Q98      | 22            | mechanics    | no                  | not started           |
| 2017 | Q100     | 23            | mechanics    | yes                 | not started           |
| 2018 | Q27      | 7             | circuit      | no                  | not started           |
| 2018 | Q73      | 15            | mechanics    | no                  | not started           |
| 2018 | Q74      | 16            | unclassified | no                  | not started           |
| 2018 | Q78      | 17            | mechanics    | no                  | not started           |
| 2018 | Q79      | 17            | mechanics    | no                  | not started           |
| 2018 | Q80      | 17            | mechanics    | no                  | not started           |
| 2018 | Q82      | 18            | mechanics    | no                  | not started           |
| 2018 | Q85      | 18            | unclassified | no                  | not started           |
| 2018 | Q89      | 19            | mechanics    | yes                 | not started           |
| 2018 | Q90      | 20            | graph        | no                  | not started           |
| 2019 | Q75      | —             | mechanics    | no                  | not started           |
| 2019 | Q76      | —             | unclassified | no                  | not started           |
| 2019 | Q84      | —             | mechanics    | no                  | not started           |
| 2019 | Q90      | —             | mechanics    | yes                 | not started           |
| 2019 | Q91      | —             | mechanics    | yes                 | not started           |
| 2021 | Q72      | 13            | mechanics    | no                  | not started           |
| 2021 | Q73      | 13            | mechanics    | no                  | not started           |
| 2021 | Q74      | 14            | mechanics    | no                  | not started           |
| 2021 | Q75      | 14            | mechanics    | no                  | not started           |
| 2021 | Q77      | 15            | mechanics    | no                  | not started           |
| 2021 | Q81      | 15            | unclassified | no                  | not started           |
| 2021 | Q84      | 16            | structure    | no                  | not started           |
| 2021 | Q89      | 17            | mechanics    | no                  | not started           |
| 2021 | Q93      | 18            | mechanics    | no                  | not started           |
| 2021 | Q94      | 18            | mechanics    | no                  | not started           |
| 2021 | Q95      | 19            | mechanics    | no                  | not started           |
| 2021 | Q99      | 19            | mechanics    | no                  | not started           |
| 2022 | Q6       | 4             | unclassified | no                  | not started           |
| 2022 | Q49      | 13            | graph        | yes                 | not started           |
| 2022 | Q57      | 14            | graph        | yes                 | not started           |
| 2022 | Q62      | 16            | graph        | yes                 | not started           |
| 2024 | Q6       | 4             | unclassified | no                  | not started           |
| 2024 | Q42      | 11            | graph        | yes                 | not started           |
| 2024 | Q43      | 11            | mechanics    | no                  | reconstructed (pilot) |
| 2024 | Q45      | 12            | unclassified | no                  | not started           |
| 2024 | Q49      | 13            | mechanics    | no                  | not started           |
| 2024 | Q54      | 14            | mechanics    | no                  | not started           |
| 2024 | Q57      | 15            | graph        | no                  | not started           |
| 2024 | Q65      | 17            | graph        | no                  | not started           |
| 2024 | Q66      | 17            | graph        | yes                 | not started           |
| 2024 | Q68      | 18            | mechanics    | no                  | not started           |
| 2024 | Q70      | 18            | graph        | no                  | not started           |
| 2024 | Q78      | 20            | structure    | yes                 | not started           |
| 2024 | Q79      | 20            | structure    | yes                 | not started           |
| 2024 | Q89      | 21            | structure    | yes                 | not started           |
| 2024 | Q94      | 22            | circuit      | no                  | not started           |
| 2024 | Q96      | 23            | circuit      | no                  | not started           |
| 2024 | Q97      | 23            | circuit      | no                  | not started           |
| 2024 | Q98      | 23            | circuit      | no                  | not started           |
| 2025 | Q44      | 10            | graph        | yes                 | not started           |
| 2025 | Q46      | 11            | graph        | no                  | not started           |
| 2025 | Q51      | 12            | graph        | yes                 | not started           |
| 2025 | Q54      | 13            | mechanics    | no                  | not started           |
| 2025 | Q55      | 13            | graph        | no                  | not started           |
| 2025 | Q57      | 14            | unclassified | no                  | not started           |
| 2025 | Q58      | 14            | unclassified | yes                 | not started           |
| 2025 | Q62      | 15            | graph        | no                  | not started           |
| 2025 | Q66      | 17            | graph        | yes                 | not started           |
| 2025 | Q85      | 21            | structure    | yes                 | not started           |
| 2025 | Q88      | 22            | structure    | yes                 | not started           |
| 2025 | Q95      | 24            | circuit      | no                  | not started           |
| 2025 | Q100     | 25            | circuit      | no                  | not started           |
