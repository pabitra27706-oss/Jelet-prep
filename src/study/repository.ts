/**
 * The only write path for study data.
 *
 * Every mutation runs in a single IndexedDB transaction and resolves after the
 * browser commits it. Callers must treat a rejection as "not saved".
 */
import {
  LIMITS,
  makeBookmark,
  makeNote,
  nowIso,
  RecordValidationError,
  validateBookmark,
  validateHistory,
  validateNote,
  validatePosition,
  validateTopic,
  historyEntryId,
  type BookmarkRecord,
  type HistoryKind,
  type NoteRecord,
  type PositionRecord,
  type StudySnapshot,
  type TopicRecord,
  type TopicStatus,
} from "./records";
import {
  readAll,
  requestResult,
  runTransaction,
  STORE_NAMES,
  type StoreName,
} from "./db";
import { mergeRecordList, type ImportPlan, type MergeMode } from "./backup";

export class NoteConflictError extends Error {
  constructor(readonly latest: NoteRecord) {
    super("This note was changed in another tab.");
    this.name = "NoteConflictError";
  }
}

export interface LoadedSnapshot {
  snapshot: StudySnapshot;
  /** Records rejected by the current schema (e.g. hand-edited data). */
  dropped: number;
}

export async function loadSnapshot(): Promise<LoadedSnapshot> {
  const raw = await runTransaction(
    ["bookmarks", "positions", "notes", "topics", "history"],
    "readonly",
    (tx) => readSnapshotFromDbIn(tx),
  );
  const bookmarks = filterValid(raw.bookmarks, validateBookmark);
  const positions = filterValid(raw.positions, validatePosition);
  const notes = filterValid(raw.notes, validateNote);
  const topics = filterValid(raw.topics, validateTopic);
  const history = filterValid(raw.history, validateHistory);
  const snapshot = {
    bookmarks: bookmarks.items.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
    positions: positions.items.sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    ),
    notes: notes.items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    topics: topics.items.sort((a, b) => a.topicId.localeCompare(b.topicId)),
    history: history.items.sort((a, b) => b.at.localeCompare(a.at)),
  };
  return {
    snapshot,
    dropped:
      bookmarks.dropped +
      positions.dropped +
      notes.dropped +
      topics.dropped +
      history.dropped,
  };
}

function filterValid<T>(values: unknown[], validate: (value: unknown) => T) {
  const items: T[] = [];
  for (const value of values) {
    try {
      items.push(validate(value));
    } catch {
      /* Invalid record stays out of the app state; counted for the user. */
    }
  }
  return { items, dropped: values.length - items.length };
}

export function addBookmark(
  paperId: string,
  questionNumber: number,
): Promise<BookmarkRecord> {
  return runTransaction(["bookmarks"], "readwrite", async (tx) => {
    const incoming = makeBookmark(paperId, questionNumber);
    const store = tx.objectStore("bookmarks");
    const existing = await requestResult(
      store.get(incoming.questionId) as IDBRequest<BookmarkRecord | undefined>,
    );
    if (existing) return existing;
    await requestResult(store.put(incoming));
    return incoming;
  });
}

export function removeBookmark(questionId: string) {
  return runTransaction(["bookmarks"], "readwrite", async (tx) => {
    await requestResult(tx.objectStore("bookmarks").delete(questionId));
  });
}

export function savePosition(paperId: string, questionNumber: number) {
  return runTransaction(["positions"], "readwrite", async (tx) => {
    const record: PositionRecord = {
      paperId,
      questionNumber,
      updatedAt: nowIso(),
    };
    validatePosition(record);
    await requestResult(tx.objectStore("positions").put(record));
    return record;
  });
}

export interface SaveNoteInput {
  questionId: string;
  text: string;
  /** `updatedAt` the editor was based on; guards against other tabs. */
  expectedUpdatedAt?: string | null;
  force?: boolean;
}

export function saveNote(input: SaveNoteInput): Promise<NoteRecord | null> {
  return runTransaction(["notes"], "readwrite", async (tx) => {
    const draft = makeNote({ questionId: input.questionId, text: input.text });
    const store = tx.objectStore("notes");
    const existing = await requestResult(
      store.get(draft.noteId) as IDBRequest<NoteRecord | undefined>,
    );
    if (
      existing &&
      !input.force &&
      input.expectedUpdatedAt !== undefined &&
      existing.updatedAt !== input.expectedUpdatedAt
    ) {
      throw new NoteConflictError(existing);
    }
    // Strictly increasing timestamps keep two saves distinguishable even when
    // they land in the same millisecond, so conflict detection stays reliable.
    const now = nowIso();
    const updatedAt =
      existing && existing.updatedAt >= now
        ? new Date(Date.parse(existing.updatedAt) + 1).toISOString()
        : now;
    const record: NoteRecord = {
      ...draft,
      createdAt: existing?.createdAt ?? draft.createdAt,
      updatedAt,
    };
    await requestResult(store.put(record));
    return record;
  });
}

export function deleteNote(noteId: string) {
  return runTransaction(["notes"], "readwrite", async (tx) => {
    await requestResult(tx.objectStore("notes").delete(noteId));
  });
}

export function setTopicStatus(input: {
  topicId: string;
  subjectId: string;
  title: string;
  status: TopicStatus;
}): Promise<TopicRecord> {
  return runTransaction(["topics"], "readwrite", async (tx) => {
    const record: TopicRecord = {
      topicId: input.topicId,
      subjectId: input.subjectId,
      title: input.title,
      status: input.status,
      updatedAt: nowIso(),
    };
    validateTopic(record);
    await requestResult(tx.objectStore("topics").put(record));
    return record;
  });
}

export function clearTopicStatus(topicId: string) {
  return runTransaction(["topics"], "readwrite", async (tx) => {
    await requestResult(tx.objectStore("topics").delete(topicId));
  });
}

export function recordVisit(
  kind: HistoryKind,
  targetId: string,
  at = nowIso(),
): Promise<void> {
  return runTransaction(["history"], "readwrite", async (tx) => {
    const store = tx.objectStore("history");
    await requestResult(
      store.put({
        entryId: historyEntryId(kind, targetId, at),
        kind,
        targetId,
        at,
      }),
    );
    if (LIMITS.historyKept <= 0) return;
    const all = await readAll<{ at: string; entryId: string }>(tx, "history");
    if (all.length <= LIMITS.historyKept) return;
    const oldestFirst = [...all].sort((a, b) => a.at.localeCompare(b.at));
    for (const stale of oldestFirst.slice(0, all.length - LIMITS.historyKept)) {
      await requestResult(store.delete(stale.entryId));
    }
  });
}

/**
 * Write an import in one transaction.
 *
 * Merge re-reads current records inside the transaction, so a concurrent tab
 * cannot be overwritten with a stale preview. Replace clears first inside the
 * same transaction: a failure restores the previous state.
 */
const STORE_ORDER: Record<
  Exclude<StoreName, "meta">,
  { key: (record: never) => string; stamp: (record: never) => string }
> = {
  bookmarks: {
    key: (record: BookmarkRecord) => record.questionId,
    stamp: (record: BookmarkRecord) => record.createdAt,
  },
  positions: {
    key: (record: PositionRecord) => record.paperId,
    stamp: (record: PositionRecord) => record.updatedAt,
  },
  notes: {
    key: (record: NoteRecord) => record.noteId,
    stamp: (record: NoteRecord) => record.updatedAt,
  },
  topics: {
    key: (record: TopicRecord) => record.topicId,
    stamp: (record: TopicRecord) => record.updatedAt,
  },
  history: {
    key: (record: { entryId: string }) => record.entryId,
    stamp: (record: { at: string }) => record.at,
  },
};

/**
 * Write an import in one transaction.
 *
 * Merge re-reads current records inside the transaction, so a concurrent tab
 * cannot be overwritten with a stale preview. Replace clears first inside the
 * same transaction: a failure restores the previous state.
 */
export function applyImport(
  plan: ImportPlan,
  mode: MergeMode,
): Promise<StudySnapshot> {
  const incoming = plan.envelope.data;
  const stores = Object.keys(STORE_ORDER) as Exclude<StoreName, "meta">[];
  return runTransaction([...stores], "readwrite", async (tx) => {
    for (const store of stores) {
      const target = tx.objectStore(store);
      const { key, stamp } = STORE_ORDER[store];
      if (mode === "replace") {
        await requestResult(target.clear());
        for (const record of incoming[store]) {
          await requestResult(target.put(record));
        }
      } else {
        // Re-validate inside the transaction: never write foreign shapes.
        const current = validateStoreRecords(
          store,
          await readAll<unknown>(tx, store),
        );
        const merged = mergeRecordList(
          current,
          incoming[store] as unknown[],
          key as (record: unknown) => string,
          stamp as (record: unknown) => string,
        );
        for (const record of merged) await requestResult(target.put(record));
      }
    }
    return readSnapshotFromDbIn(tx);
  });
}

function readSnapshotFromDbIn(tx: IDBTransaction): Promise<StudySnapshot> {
  return Promise.all([
    readAll(tx, "bookmarks"),
    readAll(tx, "positions"),
    readAll(tx, "notes"),
    readAll(tx, "topics"),
    readAll(tx, "history"),
  ]).then(([bookmarks, positions, notes, topics, history]) => ({
    bookmarks,
    positions,
    notes,
    topics,
    history,
  })) as Promise<StudySnapshot>;
}

function validateStoreRecords(store: StoreName, values: unknown[]): unknown[] {
  const validators: Partial<Record<StoreName, (value: unknown) => unknown>> = {
    bookmarks: validateBookmark,
    positions: validatePosition,
    notes: validateNote,
    topics: validateTopic,
    history: validateHistory,
  };
  const validate = validators[store];
  if (!validate) return [];
  return values.filter((value) => {
    try {
      validate(value);
      return true;
    } catch (error) {
      if (error instanceof RecordValidationError) return false;
      throw error;
    }
  });
}

/** Clear everything the workspace stores, including any safety copy. */
export function resetWorkspace() {
  return runTransaction([...STORE_NAMES], "readwrite", async (tx) => {
    for (const store of STORE_NAMES) {
      await requestResult(tx.objectStore(store).clear());
    }
  });
}

export function writeMeta(key: string, value: string) {
  return runTransaction(["meta"], "readwrite", async (tx) => {
    await requestResult(tx.objectStore("meta").put({ key, value }));
  });
}

export function readMeta(key: string): Promise<string | null> {
  return runTransaction(["meta"], "readonly", async (tx) => {
    const record = await requestResult(
      tx.objectStore("meta").get(key) as IDBRequest<
        { key: string; value: string } | undefined
      >,
    );
    return record?.value ?? null;
  });
}

export function deleteMeta(key: string) {
  return runTransaction(["meta"], "readwrite", async (tx) => {
    await requestResult(tx.objectStore("meta").delete(key));
  });
}
