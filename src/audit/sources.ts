/**
 * Phase 0-A source register.
 *
 * For every paper shipped in the library: the official file it was transcribed
 * from, how far that link has been checked, and what is still unverified.
 * `listingStatus` is deliberately narrow:
 *   - "official-listing": the URL was read from the WBJEEB old-question-paper
 *     index and its title/session matched the year we ship.
 *   - "official-pdf": the PDF itself was opened and its cover/title checked.
 *   - "unverified": no usable official link; do not claim one.
 * None of the transcriptions has been compared line by line with the PDF.
 */
export type ListingStatus = "official-listing" | "official-pdf" | "unverified";

const pdf = (path: string) =>
  `https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/${path}`;

export interface ContentSource {
  year: number;
  /** Official file or archive page used as the reference. */
  url: string;
  /** Official title as published by WBJEEB. */
  officialTitle: string;
  /** WBJEEB session/stream the file belongs to. */
  session: string;
  listingStatus: ListingStatus;
  /** When the link/title was read from the official index. */
  registryRetrievedAt: string | null;
  /** Compared with the official PDF text? */
  transcriptionReview: "not-compared" | "sampled" | "complete";
  /** Notes that must travel with this paper wherever it is shown. */
  notes: string[];
}

export const sourceRegistryRetrievedAt = "2026-11-02";

export const contentSources: ContentSource[] = [
  {
    year: 2017,
    url: pdf("2023/11/2023111594.pdf"),
    officialTitle: "JELET 2017 Engg. & Tech.",
    session: "2017 · Diploma in Engineering & Technology",
    listingStatus: "official-listing",
    registryRetrievedAt: sourceRegistryRetrievedAt,
    transcriptionReview: "not-compared",
    notes: [
      "Official cover not yet inspected; transcription not compared with the PDF.",
      "2022 archive listing also carries a 2023 Paper I, which is not in this library.",
    ],
  },
  {
    year: 2018,
    url: pdf("2023/11/2023111538-1.pdf"),
    officialTitle: "JELET 2018 Engg. & Tech.",
    session: "2018 · Diploma in Engineering & Technology",
    listingStatus: "official-listing",
    registryRetrievedAt: sourceRegistryRetrievedAt,
    transcriptionReview: "not-compared",
    notes: [
      "Official cover not yet inspected; transcription not compared with the PDF.",
    ],
  },
  {
    year: 2019,
    url: pdf("2023/11/2023111582-1.pdf"),
    officialTitle: "JELET 2019 Engg & Tech",
    session: "2019 · Diploma in Engineering & Technology",
    listingStatus: "official-listing",
    registryRetrievedAt: sourceRegistryRetrievedAt,
    transcriptionReview: "not-compared",
    notes: [
      "The repository file's internal title says JELET-2018 while the file is named 2019.",
      "A 2026-11-02 visual check of the 2019 Engineering & Technology booklet's cover (secondary mirror page image, not the WBJEEB PDF) showed the heading 'JELET-2019', supporting the file name rather than the internal title.",
      "Not corrected: the preserved source text is left as-is and the conflict stays labelled until the official PDF itself is compared.",
      "Questions 78–79 are absent; the file also carries an editorial bracket note for question 77 that is not original text.",
    ],
  },
  {
    year: 2021,
    url: pdf("2023/11/2023111536-1.pdf"),
    officialTitle: "JELET 2021 Engg. & Tech.",
    session: "2021 · Diploma in Engineering & Technology",
    listingStatus: "official-listing",
    registryRetrievedAt: sourceRegistryRetrievedAt,
    transcriptionReview: "not-compared",
    notes: [
      "Official cover not yet inspected; transcription not compared with the PDF.",
    ],
  },
  {
    year: 2022,
    url: pdf("2023/11/2023111591-3.pdf"),
    officialTitle: "JELET 2022 Paper I ( Engg Tech/B.Sc)",
    session: "2022 · Paper I (Engineering & Technology / B.Sc.)",
    listingStatus: "official-listing",
    registryRetrievedAt: sourceRegistryRetrievedAt,
    transcriptionReview: "sampled",
    notes: [
      "Questions 86–90 are absent from the transcription.",
      "Two Category-II Physics questions (66–67) were compared against a secondary mirror's page image on 2026-11-02: the substance and every option matched, but the wording is condensed rather than verbatim.",
      "Because wording is not verbatim, do not use this file as a wording-critical source.",
    ],
  },
  {
    year: 2024,
    url: pdf("2024/12/2024120234.pdf"),
    officialTitle: "JELET 2024 Paper 1(ET, B.Sc, B.Voc, D.Voc)",
    session: "2024 · Paper I (Engineering & Technology)",
    listingStatus: "official-listing",
    registryRetrievedAt: sourceRegistryRetrievedAt,
    transcriptionReview: "not-compared",
    notes: [
      "Questions 60–62 are absent from the transcription.",
      "The official index gives this single file for ET/B.Sc/B.Voc/D.Voc; booklet/set codes are not recorded in the transcription.",
      "No official answer key is linked from the WBJEEB index; any third-party 'final key' claim is unverified here.",
    ],
  },
  {
    year: 2025,
    url: pdf("2025/12/202512161802442791.pdf"),
    officialTitle: "JELET 2025 Paper I",
    session: "2025 · Paper I (Engineering & Technology)",
    listingStatus: "official-listing",
    registryRetrievedAt: sourceRegistryRetrievedAt,
    transcriptionReview: "not-compared",
    notes: [
      "All 100 numbers are present; diagram-based questions remain placeholders.",
      "No official answer key is linked from the WBJEEB index.",
    ],
  },
];

export const coveredYears = contentSources.map((entry) => entry.year);

export function sourceFor(year: number) {
  return contentSources.find((entry) => entry.year === year);
}
