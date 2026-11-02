/**
 * Versioned backup envelope and import planning.
 *
 * Everything here is pure: no IndexedDB, no DOM. That makes the risky part of
 * import (what will change, what conflicts, what is orphaned) testable without
 * a browser, and lets the UI show the effect of an import before writing.
 */
import {
  CONTENT_VERSION,
  paperFromQuestionId,
  papers,
  type Paper,
} from "../content";
import { topicById } from "../syllabus-data";
import {
  LIMITS,
  RecordValidationError,
  validateBookmark,
  validateHistory,
  validateNote,
  validatePosition,
  validateTopic,
  type BookmarkRecord,
  type HistoryRecord,
  type NoteRecord,
  type PositionRecord,
  type StudySnapshot,
  type TopicRecord,
} from "./records";

export const BACKUP_APP = "jelet-prep";
export const BACKUP_KIND = "study-workspace-backup";
export const BACKUP_SCHEMA_VERSION = 1;

export interface BackupEnvelope {
  app: typeof BACKUP_APP;
  kind: typeof BACKUP_KIND;
  schemaVersion: number;
  exportedAt: string;
  contentVersion: string;
  data: StudySnapshot;
}

export type BackupIssueLevel = "warning";

export interface BackupIssue {
  level: BackupIssueLevel;
  message: string;
}

export class BackupValidationError extends Error {
  constructor(
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = "BackupValidationError";
  }
}

export type MergeMode = "merge" | "replace";

export interface StoreDiff {
  /** Incoming records that do not exist locally. */
  add: number;
  /** Incoming records that are newer and will replace the local record. */
  update: number;
  /** Local records that are newer or identical; they stay as they are. */
  keep: number;
}

export interface ImportPlan {
  envelope: BackupEnvelope;
  /** Records actually written: the merge result, or the incoming set. */
  records: StudySnapshot;
  mergeDiffs: Record<keyof StudySnapshot, StoreDiff>;
  issues: BackupIssue[];
  orphans: OrphanReport;
  existingCount: number;
  incomingCount: number;
}

export function createBackup(
  snapshot: StudySnapshot,
  exportedAt = new Date().toISOString(),
): BackupEnvelope {
  return {
    app: BACKUP_APP,
    kind: BACKUP_KIND,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt,
    contentVersion: CONTENT_VERSION,
    data: sortSnapshot(snapshot),
  };
}

export function serializeBackup(envelope: BackupEnvelope) {
  return `${JSON.stringify(envelope, null, 2)}\n`;
}

export function backupFileName(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp =
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}`;
  return `jelet-prep-backup-${stamp}.json`;
}

function sortSnapshot(snapshot: StudySnapshot): StudySnapshot {
  return {
    bookmarks: [...snapshot.bookmarks].sort((a, b) =>
      a.questionId.localeCompare(b.questionId),
    ),
    positions: [...snapshot.positions].sort((a, b) =>
      a.paperId.localeCompare(b.paperId),
    ),
    notes: [...snapshot.notes].sort((a, b) =>
      a.questionId.localeCompare(b.questionId),
    ),
    topics: [...snapshot.topics].sort((a, b) =>
      a.topicId.localeCompare(b.topicId),
    ),
    history: [...snapshot.history].sort((a, b) => b.at.localeCompare(a.at)),
  };
}

export function countSnapshot(snapshot: StudySnapshot) {
  return (
    snapshot.bookmarks.length +
    snapshot.positions.length +
    snapshot.notes.length +
    snapshot.topics.length +
    snapshot.history.length
  );
}

/**
 * Parse and fully validate a backup file. Throws `BackupValidationError` when
 * anything is structurally wrong, so a bad file can never reach a write.
 */
export function parseBackupText(text: string): {
  envelope: BackupEnvelope;
  issues: BackupIssue[];
} {
  if (typeof text !== "string" || !text.trim())
    throw new BackupValidationError("That file is empty.");
  if (new TextEncoder().encode(text).length > LIMITS.backupBytes)
    throw new BackupValidationError(
      "That backup is larger than 2 MB and was not read.",
    );
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupValidationError(
      "That file isn’t valid JSON. Choose a JELETprep backup file.",
    );
  }
  if (!isObject(raw))
    throw new BackupValidationError("That file is not a backup object.");
  if (raw.app !== BACKUP_APP || raw.kind !== BACKUP_KIND)
    throw new BackupValidationError(
      "That file is not a JELETprep study backup.",
    );
  const schemaVersion = raw.schemaVersion;
  if (typeof schemaVersion !== "number" || !Number.isInteger(schemaVersion))
    throw new BackupValidationError(
      "That backup has no usable schema version.",
    );
  if (schemaVersion > BACKUP_SCHEMA_VERSION)
    throw new BackupValidationError(
      `That backup was made by a newer version of JELETprep (format ${schemaVersion}). This version only reads format ${BACKUP_SCHEMA_VERSION}.`,
    );
  if (schemaVersion < 1)
    throw new BackupValidationError("That backup’s format is not supported.");
  if (
    typeof raw.exportedAt !== "string" ||
    Number.isNaN(Date.parse(raw.exportedAt))
  )
    throw new BackupValidationError("That backup has no valid export date.");
  if (typeof raw.contentVersion !== "string")
    throw new BackupValidationError("That backup has no content reference.");

  const data = raw.data;
  if (!isObject(data))
    throw new BackupValidationError("That backup has no study data section.");

  const issues: BackupIssue[] = [];
  if (raw.contentVersion !== CONTENT_VERSION)
    issues.push({
      level: "warning",
      message: `The backup was made with content ${raw.contentVersion}; this app uses ${CONTENT_VERSION}. Some references may no longer match.`,
    });

  const sections = {
    bookmarks: collect(
      data.bookmarks,
      "bookmarks",
      LIMITS.maxBookmarks,
      validateBookmark,
      issues,
    ),
    positions: collect(
      data.positions,
      "reading positions",
      LIMITS.maxPositions,
      validatePosition,
      issues,
    ),
    notes: collect(data.notes, "notes", LIMITS.maxNotes, validateNote, issues),
    topics: collect(
      data.topics,
      "topic statuses",
      LIMITS.maxTopics,
      validateTopic,
      issues,
    ),
    history: collect(
      data.history,
      "history entries",
      LIMITS.maxHistory,
      validateHistory,
      issues,
    ),
  };
  // Report every invalid section at once, then refuse the whole file.
  const recordErrors = Object.values(sections).flatMap(
    (section) => section.errors,
  );
  if (recordErrors.length) {
    throw new BackupValidationError(
      "The backup has invalid entries, so nothing was imported.",
      recordErrors.slice(0, 6),
    );
  }
  const bookmarks = sections.bookmarks.items;
  const positions = sections.positions.items;
  const notes = sections.notes.items;
  const topics = sections.topics.items;
  const history = sections.history.items;

  const total =
    bookmarks.length +
    positions.length +
    notes.length +
    topics.length +
    history.length;
  if (total > LIMITS.maxTotalRecords)
    throw new BackupValidationError(
      `That backup holds ${total} records, above the ${LIMITS.maxTotalRecords} limit. Nothing was imported.`,
    );

  const snapshot: StudySnapshot = dedupe({
    bookmarks,
    positions,
    notes,
    topics,
    history,
  });

  const envelope: BackupEnvelope = {
    app: BACKUP_APP,
    kind: BACKUP_KIND,
    schemaVersion,
    exportedAt: raw.exportedAt,
    contentVersion: raw.contentVersion,
    data: snapshot,
  };
  return { envelope, issues };
}

function collect<T>(
  value: unknown,
  label: string,
  limit: number,
  validate: (input: unknown) => T,
  issues: BackupIssue[],
): { items: T[]; errors: string[] } {
  if (value === undefined) {
    issues.push({
      level: "warning",
      message: `That backup contains no ${label}.`,
    });
    return { items: [], errors: [] };
  }
  if (!Array.isArray(value))
    throw new BackupValidationError(`The ${label} section is not a list.`);
  if (value.length > limit)
    throw new BackupValidationError(
      `The backup lists ${value.length} ${label}; the limit is ${limit}. Nothing was imported.`,
    );
  const out: T[] = [];
  const errors: string[] = [];
  value.forEach((entry, index) => {
    try {
      out.push(validate(entry));
    } catch (error) {
      const reason =
        error instanceof RecordValidationError || error instanceof Error
          ? error.message
          : "unknown problem";
      if (errors.length < 5) errors.push(`${label} #${index + 1}: ${reason}`);
    }
  });
  if (errors.length) {
    const hidden = value.length - out.length - errors.length;
    if (hidden > 0)
      errors.push(`…and ${hidden} more invalid ${label} entries.`);
  }
  return { items: out, errors };
}

/** Drop repeated keys inside one file, keeping the newest version. */
function dedupe(snapshot: StudySnapshot): StudySnapshot {
  return {
    bookmarks: dedupeBy(
      snapshot.bookmarks,
      (r) => r.questionId,
      (r) => r.createdAt,
    ),
    positions: dedupeBy(
      snapshot.positions,
      (r) => r.paperId,
      (r) => r.updatedAt,
    ),
    notes: dedupeBy(
      snapshot.notes,
      (r) => r.noteId,
      (r) => r.updatedAt,
    ),
    topics: dedupeBy(
      snapshot.topics,
      (r) => r.topicId,
      (r) => r.updatedAt,
    ),
    history: dedupeBy(
      snapshot.history,
      (r) => r.entryId,
      (r) => r.at,
    ),
  };
}

function dedupeBy<T>(
  records: T[],
  key: (r: T) => string,
  stamp: (r: T) => string,
) {
  const map = new Map<string, T>();
  for (const record of records) {
    const existing = map.get(key(record));
    if (!existing || stamp(record) > stamp(existing))
      map.set(key(record), record);
  }
  return [...map.values()];
}

export interface OrphanReport {
  bookmarks: { questionId: string; reason: string }[];
  notes: { questionId: string; reason: string }[];
  topics: { topicId: string; title: string }[];
}

/**
 * References that no longer resolve against the bundled content. They are kept
 * (a note must never silently disappear) and surfaced with a remove action.
 */
export function findOrphans(
  snapshot: Pick<StudySnapshot, "bookmarks" | "notes" | "topics">,
): OrphanReport {
  const check = (questionId: string) => {
    const parsed = paperFromQuestionId(questionId);
    if (!parsed) return "Question reference is not recognised";
    const paper = papers.find((entry) => entry.year === parsed.year) as
      Paper | undefined;
    if (!paper) return `The ${parsed.year} paper is no longer in this library`;
    if (paper.missing.includes(parsed.number))
      return `Question ${parsed.number} is not present in the ${parsed.year} transcription`;
    return null;
  };
  const bookmarks: OrphanReport["bookmarks"] = [];
  const notes: OrphanReport["notes"] = [];
  for (const record of snapshot.bookmarks) {
    const reason = check(record.questionId);
    if (reason) bookmarks.push({ questionId: record.questionId, reason });
  }
  for (const record of snapshot.notes) {
    const reason = check(record.questionId);
    if (reason) notes.push({ questionId: record.questionId, reason });
  }
  const topics = snapshot.topics
    .filter((record) => !topicById.has(record.topicId))
    .map((record) => ({ topicId: record.topicId, title: record.title }));
  return { bookmarks, notes, topics };
}

export function countOrphans(orphans: OrphanReport) {
  return (
    orphans.bookmarks.length + orphans.notes.length + orphans.topics.length
  );
}

export function planImport(
  existing: StudySnapshot,
  envelope: BackupEnvelope,
  issues: BackupIssue[] = [],
): ImportPlan {
  const incoming = envelope.data;
  const mergeDiffs = {
    bookmarks: diff(
      existing.bookmarks,
      incoming.bookmarks,
      (r) => r.questionId,
      (r) => r.createdAt,
    ),
    positions: diff(
      existing.positions,
      incoming.positions,
      (r) => r.paperId,
      (r) => r.updatedAt,
    ),
    notes: diff(
      existing.notes,
      incoming.notes,
      (r) => r.noteId,
      (r) => r.updatedAt,
    ),
    topics: diff(
      existing.topics,
      incoming.topics,
      (r) => r.topicId,
      (r) => r.updatedAt,
    ),
    history: diff(
      existing.history,
      incoming.history,
      (r) => r.entryId,
      (r) => r.at,
    ),
  };
  const records = mergeSnapshots(existing, incoming);
  return {
    envelope,
    records: sortSnapshot(records),
    mergeDiffs,
    issues,
    orphans: findOrphans(incoming),
    existingCount: countSnapshot(existing),
    incomingCount: countSnapshot(incoming),
  };
}

function diff<T>(
  existing: T[],
  incoming: T[],
  key: (record: T) => string,
  stamp: (record: T) => string,
): StoreDiff {
  const local = new Map(existing.map((record) => [key(record), record]));
  let add = 0;
  let update = 0;
  let keep = 0;
  for (const record of incoming) {
    const current = local.get(key(record));
    if (!current) add++;
    else if (stamp(record) > stamp(current)) update++;
    else keep++;
  }
  return { add, update, keep };
}

/**
 * Deterministic merge policy: one record per key; the newest `updatedAt`
 * (or `createdAt` for bookmarks) wins; ties keep the local record.
 * History keys include their timestamp, so re-importing the same file cannot
 * duplicate entries.
 */
export function mergeSnapshots(
  existing: StudySnapshot,
  incoming: StudySnapshot,
): StudySnapshot {
  return {
    bookmarks: mergeRecordList(
      existing.bookmarks,
      incoming.bookmarks,
      (r) => r.questionId,
      (r) => r.createdAt,
    ),
    positions: mergeRecordList(
      existing.positions,
      incoming.positions,
      (r) => r.paperId,
      (r) => r.updatedAt,
    ),
    notes: mergeRecordList(
      existing.notes,
      incoming.notes,
      (r) => r.noteId,
      (r) => r.updatedAt,
    ),
    topics: mergeRecordList(
      existing.topics,
      incoming.topics,
      (r) => r.topicId,
      (r) => r.updatedAt,
    ),
    history: mergeRecordList(
      existing.history,
      incoming.history,
      (r) => r.entryId,
      (r) => r.at,
    ),
  };
}

export function mergeRecordList<T>(
  existing: T[],
  incoming: T[],
  key: (record: T) => string,
  stamp: (record: T) => string,
): T[] {
  const map = new Map(existing.map((record) => [key(record), record]));
  for (const record of incoming) {
    const current = map.get(key(record));
    if (!current || stamp(record) > stamp(current))
      map.set(key(record), record);
  }
  return [...map.values()];
}

export type {
  BookmarkRecord,
  HistoryRecord,
  NoteRecord,
  PositionRecord,
  TopicRecord,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
