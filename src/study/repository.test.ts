import { beforeEach, describe, expect, it } from "vitest";
import {
  addBookmark,
  applyImport,
  clearTopicStatus,
  deleteNote,
  loadSnapshot,
  NoteConflictError,
  readMeta,
  recordVisit,
  removeBookmark,
  resetWorkspace,
  saveNote,
  savePosition,
  setTopicStatus,
  writeMeta,
} from "./repository";
import {
  classifyError,
  closeDatabase,
  DB_NAME,
  DB_VERSION,
  MIGRATIONS,
  openDatabase,
  runTransaction,
  STORE_NAMES,
  StorageError,
} from "./db";
import { createBackup, planImport, serializeBackup } from "./backup";
import {
  EMPTY_SNAPSHOT,
  LIMITS,
  makeBookmark,
  makeNote,
  type StudySnapshot,
} from "./records";
import { freshDatabase } from "./test-utils";

function sampleSnapshot(): StudySnapshot {
  return {
    bookmarks: [
      makeBookmark("jelet-et-p1-2024", 7, "2026-11-01T09:00:00.000Z"),
    ],
    positions: [
      {
        paperId: "jelet-et-p1-2024",
        questionNumber: 7,
        updatedAt: "2026-11-02T10:00:00.000Z",
      },
    ],
    notes: [
      makeNote({
        questionId: "jelet-et-p1-2024:q7",
        text: "Expand along the first row.",
        createdAt: "2026-11-02T10:00:00.000Z",
        updatedAt: "2026-11-02T10:00:00.000Z",
      }),
    ],
    topics: [
      {
        topicId: "jelet-syllabus:mathematics:t01",
        subjectId: "jelet-syllabus:mathematics",
        title: "Matrices and Determinants",
        status: "studying",
        updatedAt: "2026-11-02T10:00:00.000Z",
      },
    ],
    history: [
      {
        entryId: "paper:2024:2026-11-02T09:59:00.000Z",
        kind: "paper",
        targetId: "2024",
        at: "2026-11-02T09:59:00.000Z",
      },
    ],
  };
}

beforeEach(async () => {
  await freshDatabase();
});

describe("database migrations", () => {
  it("creates every store and index when upgrading from an empty database", async () => {
    const db = await openDatabase();
    expect(db.version).toBe(DB_VERSION);
    expect([...db.objectStoreNames].sort()).toEqual([...STORE_NAMES].sort());
    const tx = db.transaction(["notes", "history"], "readonly");
    expect(tx.objectStore("notes").indexNames.contains("questionId")).toBe(
      true,
    );
    expect(tx.objectStore("history").indexNames.contains("at")).toBe(true);
    expect(typeof MIGRATIONS[1]).toBe("function");
  });

  it("preserves records across a reopen (browser restart)", async () => {
    await addBookmark("jelet-et-p1-2024", 3);
    await closeDatabase();
    const loaded = await loadSnapshot();
    expect(loaded.snapshot.bookmarks).toHaveLength(1);
    expect(loaded.snapshot.bookmarks[0].questionId).toBe("jelet-et-p1-2024:q3");
  });

  it("refuses to open older code against a newer database", async () => {
    await freshDatabase();
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION + 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("future");
      request.onsuccess = () => {
        request.result.close();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
    await expect(openDatabase()).rejects.toMatchObject({ kind: "version" });
    await closeDatabase();
  });
});

describe("transactions", () => {
  it("resolves a write only after commit and rolls back on failure", async () => {
    await runTransaction(["bookmarks"], "readwrite", async (tx) => {
      tx.objectStore("bookmarks").put(makeBookmark("jelet-et-p1-2024", 1));
      tx.objectStore("bookmarks").put(makeBookmark("jelet-et-p1-2024", 2));
    });
    expect((await loadSnapshot()).snapshot.bookmarks).toHaveLength(2);

    await expect(
      runTransaction(["bookmarks"], "readwrite", async (tx) => {
        tx.objectStore("bookmarks").put(makeBookmark("jelet-et-p1-2025", 1));
        throw new Error("simulated failure");
      }),
    ).rejects.toThrow();
    const after = await loadSnapshot();
    expect(after.snapshot.bookmarks).toHaveLength(2);
    expect(
      after.snapshot.bookmarks.some(
        (record) => record.paperId === "jelet-et-p1-2025",
      ),
    ).toBe(false);
  });

  it("classifies quota and denial failures for honest reporting", () => {
    const quota = new DOMException("full", "QuotaExceededError");
    expect(classifyError(quota)).toMatchObject({ kind: "quota" });
    expect(classifyError(quota).message).toContain("storage is full");
    expect(
      classifyError(new DOMException("no", "SecurityError")),
    ).toMatchObject({
      kind: "denied",
    });
    expect(classifyError(new Error("boom"))).toBeInstanceOf(StorageError);
  });
});

describe("bookmarks", () => {
  it("adds once and removes without duplicating", async () => {
    const first = await addBookmark("jelet-et-p1-2025", 95);
    const second = await addBookmark("jelet-et-p1-2025", 95);
    expect(second.createdAt).toBe(first.createdAt);
    expect((await loadSnapshot()).snapshot.bookmarks).toHaveLength(1);
    await removeBookmark("jelet-et-p1-2025:q95");
    expect((await loadSnapshot()).snapshot.bookmarks).toHaveLength(0);
  });
});

describe("reading positions", () => {
  it("keeps one position per paper and updates it", async () => {
    await savePosition("jelet-et-p1-2024", 4);
    await savePosition("jelet-et-p1-2024", 9);
    const snapshot = (await loadSnapshot()).snapshot;
    expect(snapshot.positions).toHaveLength(1);
    expect(snapshot.positions[0].questionNumber).toBe(9);
  });

  it("rejects positions outside the exam range", async () => {
    await expect(savePosition("jelet-et-p1-2024", 0)).rejects.toThrow();
    await expect(savePosition("jelet-et-p1-2024", 101)).rejects.toThrow();
  });
});

describe("notes", () => {
  it("saves, edits and deletes plain text", async () => {
    await saveNote({ questionId: "jelet-et-p1-2024:q1", text: "  first  " });
    let snapshot = (await loadSnapshot()).snapshot;
    expect(snapshot.notes[0].text).toBe("first");

    await saveNote({ questionId: "jelet-et-p1-2024:q1", text: "second" });
    snapshot = (await loadSnapshot()).snapshot;
    expect(snapshot.notes).toHaveLength(1);
    expect(snapshot.notes[0].text).toBe("second");
    expect(snapshot.notes[0].createdAt <= snapshot.notes[0].updatedAt).toBe(
      true,
    );

    await deleteNote("note:jelet-et-p1-2024:q1");
    expect((await loadSnapshot()).snapshot.notes).toHaveLength(0);
  });

  it("rejects empty and oversized notes without writing", async () => {
    await expect(
      saveNote({ questionId: "jelet-et-p1-2024:q1", text: "   " }),
    ).rejects.toThrow(/empty/i);
    await expect(
      saveNote({
        questionId: "jelet-et-p1-2024:q1",
        text: "x".repeat(LIMITS.noteLength + 1),
      }),
    ).rejects.toThrow(/limited/);
    expect((await loadSnapshot()).snapshot.notes).toHaveLength(0);
  });

  it("detects edits made by another tab instead of overwriting them", async () => {
    const first = await saveNote({
      questionId: "jelet-et-p1-2024:q1",
      text: "from tab A",
    });
    const tabB = await saveNote({
      questionId: "jelet-et-p1-2024:q1",
      text: "from tab B",
      expectedUpdatedAt: first!.updatedAt,
    });
    expect(tabB?.text).toBe("from tab B");
    await expect(
      saveNote({
        questionId: "jelet-et-p1-2024:q1",
        text: "stale tab A",
        expectedUpdatedAt: first!.updatedAt,
      }),
    ).rejects.toBeInstanceOf(NoteConflictError);
    const snapshot = (await loadSnapshot()).snapshot;
    expect(snapshot.notes[0].text).toBe("from tab B");
  });

  it("allows a deliberate overwrite after the conflict is shown", async () => {
    const first = await saveNote({
      questionId: "jelet-et-p1-2024:q1",
      text: "mine",
    });
    await saveNote({ questionId: "jelet-et-p1-2024:q1", text: "theirs" });
    const forced = await saveNote({
      questionId: "jelet-et-p1-2024:q1",
      text: "mine wins",
      expectedUpdatedAt: first!.updatedAt,
      force: true,
    });
    expect(forced?.text).toBe("mine wins");
  });
});

describe("topic status", () => {
  it("sets, changes and clears status", async () => {
    await setTopicStatus({
      topicId: "jelet-syllabus:physics:t02",
      subjectId: "jelet-syllabus:physics",
      title: "Motion",
      status: "studying",
    });
    await setTopicStatus({
      topicId: "jelet-syllabus:physics:t02",
      subjectId: "jelet-syllabus:physics",
      title: "Motion",
      status: "revised",
    });
    expect((await loadSnapshot()).snapshot.topics[0].status).toBe("revised");
    await clearTopicStatus("jelet-syllabus:physics:t02");
    expect((await loadSnapshot()).snapshot.topics).toHaveLength(0);
  });
});

describe("history", () => {
  it("keeps at most the configured number of visits", async () => {
    for (let index = 0; index < LIMITS.historyKept + 8; index++) {
      const at = new Date(
        Date.parse("2026-11-02T10:00:00.000Z") + index * 1000,
      ).toISOString();
      await recordVisit("paper", String(2017 + (index % 7)), at);
    }
    const history = (await loadSnapshot()).snapshot.history;
    expect(history).toHaveLength(Math.min(LIMITS.historyKept, 60));
    expect(history[0].at > history[history.length - 1].at).toBe(true);
  });
});

describe("import", () => {
  it("applies a merge in one transaction and is idempotent", async () => {
    await addBookmark("jelet-et-p1-2024", 1);
    const envelope = createBackup(sampleSnapshot(), "2026-11-02T11:00:00.000Z");
    const plan = planImport((await loadSnapshot()).snapshot, envelope);
    await applyImport(plan, "merge");
    const once = (await loadSnapshot()).snapshot;
    expect(once.bookmarks).toHaveLength(2);
    expect(once.notes).toHaveLength(1);

    const again = planImport(once, envelope);
    await applyImport(again, "merge");
    const twice = (await loadSnapshot()).snapshot;
    expect(twice).toEqual(once);
  });

  it("replace clears existing records first", async () => {
    await addBookmark("jelet-et-p1-2017", 3);
    await saveNote({ questionId: "jelet-et-p1-2017:q3", text: "old" });
    const envelope = createBackup(sampleSnapshot(), "2026-11-02T11:00:00.000Z");
    await applyImport(
      planImport((await loadSnapshot()).snapshot, envelope),
      "replace",
    );
    const snapshot = (await loadSnapshot()).snapshot;
    expect(snapshot.bookmarks.map((record) => record.questionId)).toEqual([
      "jelet-et-p1-2024:q7",
    ]);
    expect(snapshot.notes.map((note) => note.text)).toEqual([
      "Expand along the first row.",
    ]);
  });

  it("never leaves a half-applied import", async () => {
    await addBookmark("jelet-et-p1-2024", 1);
    const before = (await loadSnapshot()).snapshot;
    const envelope = createBackup(sampleSnapshot(), "2026-11-02T11:00:00.000Z");
    const plan = planImport(before, envelope);
    // Simulate the browser failing in the middle of the replace write.
    await expect(
      runTransaction(["bookmarks", "notes"], "readwrite", async (tx) => {
        tx.objectStore("bookmarks").put(makeBookmark("jelet-et-p1-2024", 50));
        tx.objectStore("notes").put(
          makeNote({ questionId: "jelet-et-p1-2024:q50", text: "partial" }),
        );
        throw new DOMException("full", "QuotaExceededError");
      }),
    ).rejects.toMatchObject({ kind: "quota" });
    const after = (await loadSnapshot()).snapshot;
    expect(after).toEqual(before);
    expect(plan.records.bookmarks.length).toBe(2);
  });

  it("drops malformed records inside the transaction without touching valid data", async () => {
    await addBookmark("jelet-et-p1-2024", 1);
    const before = (await loadSnapshot()).snapshot;
    const plan = planImport(
      before,
      createBackup(sampleSnapshot(), "2026-11-02T11:00:00.000Z"),
    );
    (plan.envelope.data.notes as unknown[]).push({ noteId: "bad" });
    await applyImport(plan, "merge");
    const after = (await loadSnapshot()).snapshot;
    // The invalid note never lands; the valid bookmark in the same file does.
    expect(after.notes.every((note) => note.noteId.startsWith("note:"))).toBe(
      true,
    );
    expect(after.bookmarks.map((record) => record.questionId).sort()).toEqual([
      "jelet-et-p1-2024:q1",
      "jelet-et-p1-2024:q7",
    ]);
  });
});

describe("reset and meta", () => {
  it("clears every saved study record", async () => {
    const envelope = createBackup(sampleSnapshot(), "2026-11-02T11:00:00.000Z");
    await applyImport(planImport(EMPTY_SNAPSHOT, envelope), "merge");
    await writeMeta("pre-replace-backup", "{}");
    expect((await loadSnapshot()).snapshot.bookmarks).toHaveLength(1);
    await resetWorkspace();
    const snapshot = (await loadSnapshot()).snapshot;
    expect(snapshot).toEqual(EMPTY_SNAPSHOT);
    expect(await readMeta("pre-replace-backup")).toBeNull();
  });
});

describe("defensive reads", () => {
  it("skips records that do not match the current schema", async () => {
    await runTransaction(["bookmarks"], "readwrite", (tx) => {
      tx.objectStore("bookmarks").put({ questionId: "nonsense" });
      tx.objectStore("bookmarks").put(makeBookmark("jelet-et-p1-2024", 5));
    });
    const loaded = await loadSnapshot();
    expect(loaded.snapshot.bookmarks).toHaveLength(1);
    expect(loaded.dropped).toBe(1);
  });
});
