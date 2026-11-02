/**
 * IndexedDB adapter for the local study workspace.
 *
 * Only this module talks to IndexedDB. Feature code goes through
 * `repository.ts`, so schema changes and retries stay in one place.
 * A transaction resolves only after `oncomplete`, so "saved" in the UI always
 * means the write was committed by the browser.
 */
import type { StudySnapshot } from "./records";

export const DB_NAME = "jelet-prep-study";
export const DB_VERSION = 1;

export type StoreName =
  "bookmarks" | "positions" | "notes" | "topics" | "history" | "meta";

export const STORE_NAMES: StoreName[] = [
  "bookmarks",
  "positions",
  "notes",
  "topics",
  "history",
  "meta",
];

export const STORE_KEY_PATHS: Record<StoreName, string> = {
  bookmarks: "questionId",
  positions: "paperId",
  notes: "noteId",
  topics: "topicId",
  history: "entryId",
  meta: "key",
};

export type StorageErrorKind =
  | "unavailable"
  | "denied"
  | "quota"
  | "blocked"
  | "version"
  | "validation"
  | "unknown";

const KIND_MESSAGES: Record<StorageErrorKind, string> = {
  unavailable:
    "This browser isn’t providing local storage, so study data can’t be saved here.",
  denied:
    "Local storage is blocked for this site, so study data can’t be saved.",
  quota:
    "This device’s storage is full, so that change was not saved. Remove a few notes or export and reset.",
  blocked:
    "The local database is open in another tab with an older version. Close other tabs of this site and reload.",
  version:
    "This browser holds study data from a newer version of the app. Update or reload before saving.",
  validation: "That change was rejected before it was saved.",
  unknown: "The browser couldn’t save that change.",
};

export class StorageError extends Error {
  constructor(
    readonly kind: StorageErrorKind,
    message?: string,
    readonly cause?: unknown,
  ) {
    super(message ?? KIND_MESSAGES[kind]);
    this.name = "StorageError";
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof StorageError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return KIND_MESSAGES.unknown;
}

function isQuota(error: unknown) {
  if (!error) return false;
  const candidate = error as { name?: string; code?: number };
  return (
    candidate.name === "QuotaExceededError" ||
    candidate.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    candidate.code === 22
  );
}

/** Translate browser/storage failures into one honest, user-facing taxonomy. */
export function classifyError(error: unknown): StorageError {
  if (error instanceof StorageError) return error;
  const name = (error as { name?: string })?.name;
  if (isQuota(error)) return new StorageError("quota", undefined, error);
  if (name === "VersionError")
    return new StorageError("version", undefined, error);
  if (name === "InvalidStateError" || name === "SecurityError")
    return new StorageError("denied", undefined, error);
  if (name === "NotAllowedError")
    return new StorageError("denied", undefined, error);
  if (name === "AbortError")
    return new StorageError(
      "unknown",
      "The browser cancelled the save before it finished. Nothing was changed.",
      error,
    );
  return new StorageError("unknown", undefined, error);
}

type Migration = (db: IDBDatabase, tx: IDBTransaction) => void;

/**
 * Sequential schema steps. Each entry upgrades from `version - 1` to
 * `version`. Future releases append a step and bump DB_VERSION; prior data is
 * preserved and the unit tests replay the sequence on fixture databases.
 */
export const MIGRATIONS: Record<number, Migration> = {
  1: (db) => {
    for (const name of STORE_NAMES) {
      if (db.objectStoreNames.contains(name)) continue;
      const store = db.createObjectStore(name, {
        keyPath: STORE_KEY_PATHS[name],
      });
      if (name === "notes") store.createIndex("questionId", "questionId");
      if (name === "history") store.createIndex("at", "at");
    }
  },
};

let cached: Promise<IDBDatabase> | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (cached) return cached;
  const pending = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined" || indexedDB === null) {
      reject(new StorageError("unavailable"));
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (error) {
      reject(classifyError(error));
      return;
    }
    request.onupgradeneeded = (event) => {
      const db = request.result;
      const tx = request.transaction;
      if (!tx) return;
      for (
        let version = event.oldVersion + 1;
        version <= DB_VERSION;
        version++
      ) {
        MIGRATIONS[version]?.(db, tx);
      }
    };
    request.onblocked = () => reject(new StorageError("blocked"));
    request.onerror = () => reject(classifyError(request.error));
    request.onsuccess = () => {
      const db = request.result;
      // Let a newer tab upgrade instead of deadlocking it.
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
  cached = pending.catch((error) => {
    cached = null;
    throw error;
  });
  return cached;
}

/** Test hook and multi-tab recovery path. */
export function closeDatabase() {
  const pending = cached;
  cached = null;
  if (!pending) return Promise.resolve();
  return pending.then(
    (db) => db.close(),
    () => undefined,
  );
}

export function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(classifyError(request.error));
  });
}

/**
 * Run `work` inside one transaction and resolve only after commit.
 * Any throw aborts the transaction, so a failed import cannot half-apply.
 * Only await IndexedDB requests inside `work`; awaiting unrelated promises can
 * let the transaction auto-commit early.
 */
export async function runTransaction<T>(
  stores: StoreName[],
  mode: IDBTransactionMode,
  work: (tx: IDBTransaction) => Promise<T> | T,
): Promise<T> {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(stores, mode);
    } catch (error) {
      reject(classifyError(error));
      return;
    }
    let result: T;
    let settled = false;
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      // Browser/storage failures get the honest taxonomy; application errors
      // (validation, note conflicts) keep their own type and message.
      const isDomFailure =
        error instanceof StorageError ||
        (typeof DOMException !== "undefined" && error instanceof DOMException);
      reject(isDomFailure ? classifyError(error) : error);
    };
    tx.oncomplete = () => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    tx.onerror = () => fail(tx.error);
    tx.onabort = () =>
      fail(
        tx.error ??
          new StorageError(
            "unknown",
            "The browser rolled back that change, so nothing was saved.",
          ),
      );
    Promise.resolve()
      .then(() => work(tx))
      .then((value) => {
        result = value;
      })
      .catch((error) => {
        try {
          tx.abort();
        } catch {
          /* Transaction already finished. */
        }
        fail(error);
      });
  });
}

export function readAll<T>(tx: IDBTransaction, store: StoreName): Promise<T[]> {
  return requestResult(tx.objectStore(store).getAll() as IDBRequest<T[]>);
}

export async function readSnapshotFromDb(): Promise<StudySnapshot> {
  return runTransaction([...STORE_NAMES], "readonly", async (tx) => ({
    bookmarks: await readAll(tx, "bookmarks"),
    positions: await readAll(tx, "positions"),
    notes: await readAll(tx, "notes"),
    topics: await readAll(tx, "topics"),
    history: await readAll(tx, "history"),
  }));
}

/** Estimated device storage, when the browser exposes it. */
export async function estimateUsage(): Promise<{
  usage: number;
  quota: number;
} | null> {
  try {
    if (!navigator.storage?.estimate) return null;
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usage, quota };
  } catch {
    return null;
  }
}
