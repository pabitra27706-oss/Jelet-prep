/** Types for the Phase 0-A audit script, used by src/audit/audit.test.ts. */

export interface AuditedQuestion {
  number: number;
  section: string;
  chars: number;
  optionLetters: string[];
  optionCount: number;
  hasMath: boolean;
  balancedMath: boolean;
  imagePlaceholder: boolean;
  missingNotice: boolean;
  excessiveMarkup: boolean;
  replacementChar: boolean;
  mojibake: boolean;
  bengali: boolean;
  blank: boolean;
}

export interface PaperAudit {
  year: number;
  file: string;
  era: string;
  stream: string;
  sha256: string;
  bytes: number;
  lines: number;
  title: string;
  titleYear: number;
  titleMatchesFileName: boolean | null;
  declaredQuestionCount: number;
  sections: { level: number; title: string }[];
  declaredRanges: { title: string; from: number; to: number }[];
  sectionMismatch: { section: string; declared: string; outside: number[] }[];
  questionCount: number;
  missing: number[];
  duplicates: { number: number; occurrences: string[] }[];
  outOfRange: number[];
  questions: AuditedQuestion[];
  stats: {
    imagePlaceholders: number;
    missingNotices: number;
    mathsQuestions: number;
    unbalancedMath: number;
    fewerThanFourOptions: number;
    noOptionsDetected: number;
    unansweredOptionLetters: number[];
    blankQuestions: number;
    replacementChars: number;
    mojibake: number;
    bengaliText: number;
    malformedMarkup: number;
  };
  unknownPlaceholderMarkers: string[];
}

export interface SyllabusAudit {
  file: string;
  sha256: string;
  bytes: number;
  lines: number;
  headings: { level: number; title: string }[];
  subjects: string[];
  subjectCount: number;
  topicGroups: number;
  bulletTopics: number;
  hasEligibilitySection: boolean;
  hasReservationSection: boolean;
  mentionsYear: boolean;
  bengali: boolean;
}

export interface LegacyReaderAudit {
  file: string;
  sha256: string;
  bytes: number;
  externalScripts: string[];
  scriptCount: number;
  fetchesLocalMarkdown: boolean;
}

export interface CorpusAudit {
  generatedBy: string;
  scope: string;
  paperAudits: PaperAudit[];
  syllabus: SyllabusAudit;
  legacyReader: LegacyReaderAudit;
  totals: {
    papers: number;
    questionsPresent: number;
    missingNumbers: number;
    imagePlaceholders: number;
    questionsWithoutDetectedOptions: number;
    questionsWithFewerThanFourOptions: number;
    unbalancedMath: number;
    duplicates: number;
    titleMismatches: number;
  };
}

export interface EligibilityRow {
  year: number;
  readable: boolean;
  transcriptionVerified: boolean;
  keyVerified: boolean;
  fullMockEligible: boolean;
  reason: string;
}

export function sha256(text: string): string;
export function auditPaper(raw: string, year: number): PaperAudit;
export function auditSyllabus(raw: string): SyllabusAudit;
export function auditLegacyReader(html: string): LegacyReaderAudit;
export function auditCorpus(input: {
  papers: Record<number, string>;
  syllabus: string;
  legacyHtml: string;
}): CorpusAudit;
export function eligibilityMatrix(audit: CorpusAudit): EligibilityRow[];
export function renderMarkdown(audit: CorpusAudit): string;
export const PAPER_META: Record<number, { era: string; stream: string }>;
