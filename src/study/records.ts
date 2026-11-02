/**
 * Local study-workspace records (schema version 1).
 *
 * These are device-local IndexedDB records. They are deliberately small: no
 * name, phone, email, rank-card or other identifying data is stored.
 * Validation helpers in this module are shared by the database layer and by
 * backup import, so a record can only enter storage through one contract.
 */
import { isQuestionId, isTopicId } from "../content";

export const SCHEMA_VERSION = 1;

export const TOPIC_STATUSES = ["studying", "revised"] as const;
export type TopicStatus = (typeof TOPIC_STATUSES)[number];

export interface BookmarkRecord {
  questionId: string;
  paperId: string;
  questionNumber: number;
  createdAt: string;
}

export interface PositionRecord {
  paperId: string;
  questionNumber: number;
  updatedAt: string;
}

export interface NoteRecord {
  noteId: string;
  questionId: string;
  paperId: string;
  questionNumber: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicRecord {
  topicId: string;
  subjectId: string;
  title: string;
  status: TopicStatus;
  updatedAt: string;
}

export type HistoryKind = "paper" | "syllabus";

export interface HistoryRecord {
  entryId: string;
  kind: HistoryKind;
  targetId: string;
  at: string;
}

export interface MetaRecord {
  key: string;
  value: string;
}

export interface StudySnapshot {
  bookmarks: BookmarkRecord[];
  positions: PositionRecord[];
  notes: NoteRecord[];
  topics: TopicRecord[];
  history: HistoryRecord[];
}

export const EMPTY_SNAPSHOT: StudySnapshot = {
  bookmarks: [],
  positions: [],
  notes: [],
  topics: [],
  history: [],
};

/** Hard input limits. Import validation and live editing share these. */
export const LIMITS = {
  noteLength: 2000,
  maxBookmarks: 2000,
  maxPositions: 200,
  maxNotes: 1000,
  maxTopics: 500,
  maxHistory: 200,
  maxTotalRecords: 4000,
  /** Bytes accepted for a backup file before parsing. */
  backupBytes: 2_000_000,
  historyKept: 60,
} as const;

export const MESSAGES = {
  invalidQuestionId: "Question reference is not valid",
  invalidTopicId: "Topic reference is not valid",
  noteEmpty: "Note is empty",
  noteTooLong: `Notes are limited to ${LIMITS.noteLength} characters`,
  badTimestamp: "Date is not valid",
  badStatus: "Topic status is not valid",
} as const;

/** Raised when a record fails the shared contract. Never retried. */
export class RecordValidationError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "RecordValidationError";
  }
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

export function isTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    ISO.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

export function nowIso() {
  return new Date().toISOString();
}

export function isTopicStatus(value: unknown): value is TopicStatus {
  return (
    typeof value === "string" &&
    (TOPIC_STATUSES as readonly string[]).includes(value)
  );
}

export function normalizeNoteText(text: string) {
  // Plain text only: collapse CRLF, trim outer space, keep interior layout.
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

export function noteIdFor(questionId: string) {
  // One note per question keeps merge/import idempotent and avoids conflicts.
  return `note:${questionId}`;
}

export function sameQuestionPaper(questionId: string, paperId: string) {
  return questionId.startsWith(`${paperId}:q`);
}

export function makeBookmark(
  paperId: string,
  questionNumber: number,
  createdAt = nowIso(),
): BookmarkRecord {
  const questionId = `${paperId}:q${questionNumber}`;
  if (!isQuestionId(questionId))
    throw new RecordValidationError(MESSAGES.invalidQuestionId, "questionId");
  if (!isTimestamp(createdAt))
    throw new RecordValidationError(MESSAGES.badTimestamp, "createdAt");
  return { questionId, paperId, questionNumber, createdAt };
}

export function makeNote(input: {
  questionId: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}): NoteRecord {
  if (!isQuestionId(input.questionId))
    throw new RecordValidationError(MESSAGES.invalidQuestionId, "questionId");
  const text = normalizeNoteText(input.text);
  if (!text) throw new RecordValidationError(MESSAGES.noteEmpty, "text");
  if (text.length > LIMITS.noteLength)
    throw new RecordValidationError(MESSAGES.noteTooLong, "text");
  const [paperId, rawNumber] = input.questionId.split(":q");
  const createdAt = input.createdAt ?? nowIso();
  const updatedAt = input.updatedAt ?? createdAt;
  if (!isTimestamp(createdAt) || !isTimestamp(updatedAt))
    throw new RecordValidationError(MESSAGES.badTimestamp, "updatedAt");
  return {
    noteId: noteIdFor(input.questionId),
    questionId: input.questionId,
    paperId,
    questionNumber: Number(rawNumber),
    text,
    createdAt,
    updatedAt,
  };
}

/**
 * Structural validation for records arriving from storage or a backup file.
 * Returns a typed record or throws with a human-readable reason.
 */
export function validateBookmark(value: unknown): BookmarkRecord {
  const record = asObject(value);
  const questionId = asString(record.questionId);
  if (!isQuestionId(questionId))
    throw new RecordValidationError(MESSAGES.invalidQuestionId, "questionId");
  const paperId = asString(record.paperId);
  if (!sameQuestionPaper(questionId, paperId))
    throw new RecordValidationError(
      "Bookmark paper does not match its question",
      "paperId",
    );
  const questionNumber = asInteger(record.questionNumber, 1, 100);
  if (`${paperId}:q${questionNumber}` !== questionId)
    throw new RecordValidationError(
      "Bookmark question number does not match its ID",
      "questionNumber",
    );
  const createdAt = asTimestamp(record.createdAt, "createdAt");
  return { questionId, paperId, questionNumber, createdAt };
}

export function validatePosition(value: unknown): PositionRecord {
  const record = asObject(value);
  const paperId = asString(record.paperId);
  if (!/^jelet-et-p1-\d{4}$/.test(paperId))
    throw new RecordValidationError("Paper reference is not valid", "paperId");
  return {
    paperId,
    questionNumber: asInteger(record.questionNumber, 1, 100),
    updatedAt: asTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function validateNote(value: unknown): NoteRecord {
  const record = asObject(value);
  const questionId = asString(record.questionId);
  if (!isQuestionId(questionId))
    throw new RecordValidationError(MESSAGES.invalidQuestionId, "questionId");
  const paperId = asString(record.paperId);
  if (!sameQuestionPaper(questionId, paperId))
    throw new RecordValidationError(
      "Note paper does not match its question",
      "paperId",
    );
  const questionNumber = asInteger(record.questionNumber, 1, 100);
  if (`${paperId}:q${questionNumber}` !== questionId)
    throw new RecordValidationError(
      "Note question number does not match its ID",
      "questionNumber",
    );
  const text = normalizeNoteText(asString(record.text));
  if (!text) throw new RecordValidationError(MESSAGES.noteEmpty, "text");
  if (text.length > LIMITS.noteLength)
    throw new RecordValidationError(MESSAGES.noteTooLong, "text");
  const noteId = asString(record.noteId);
  if (noteId !== noteIdFor(questionId))
    throw new RecordValidationError(
      "Note ID does not match its question",
      "noteId",
    );
  return {
    noteId,
    questionId,
    paperId,
    questionNumber,
    text,
    createdAt: asTimestamp(record.createdAt, "createdAt"),
    updatedAt: asTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function validateTopic(value: unknown): TopicRecord {
  const record = asObject(value);
  const topicId = asString(record.topicId);
  if (!isTopicId(topicId))
    throw new RecordValidationError(MESSAGES.invalidTopicId, "topicId");
  const status = record.status;
  if (!isTopicStatus(status))
    throw new RecordValidationError(MESSAGES.badStatus, "status");
  const title = asString(record.title).slice(0, 200);
  if (!title)
    throw new RecordValidationError("Topic title is missing", "title");
  return {
    topicId,
    subjectId: asString(record.subjectId).slice(0, 120),
    title,
    status,
    updatedAt: asTimestamp(record.updatedAt, "updatedAt"),
  };
}

export function validateHistory(value: unknown): HistoryRecord {
  const record = asObject(value);
  const kind = record.kind;
  if (kind !== "paper" && kind !== "syllabus")
    throw new RecordValidationError("History entry type is not valid", "kind");
  const targetId = asString(record.targetId);
  if (!targetId || targetId.length > 120)
    throw new RecordValidationError("History target is not valid", "targetId");
  const at = asTimestamp(record.at, "at");
  const entryId = asString(record.entryId);
  if (entryId !== `${kind}:${targetId}:${at}`)
    throw new RecordValidationError(
      "History entry ID does not match its content",
      "entryId",
    );
  return { entryId, kind, targetId, at };
}

export function historyEntryId(
  kind: HistoryKind,
  targetId: string,
  at: string,
) {
  return `${kind}:${targetId}:${at}`;
}

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new RecordValidationError("Record is not an object");
  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  if (typeof value !== "string")
    throw new RecordValidationError("Value must be text");
  return value;
}

function asTimestamp(value: unknown, field: string) {
  if (!isTimestamp(value))
    throw new RecordValidationError(MESSAGES.badTimestamp, field);
  return value;
}

function asInteger(value: unknown, min: number, max: number) {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  )
    throw new RecordValidationError("Number is outside the allowed range");
  return value;
}
