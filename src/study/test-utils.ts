/**
 * Shared test helpers. Not imported by application code.
 * `fake-indexeddb` provides the same IndexedDB API surface in Node, so the
 * real adapter and migrations are exercised rather than a mock.
 */
import "fake-indexeddb/auto";
import { closeDatabase, DB_NAME } from "./db";

export async function freshDatabase() {
  await closeDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}
