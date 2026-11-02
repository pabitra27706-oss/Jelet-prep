import { describe, it, expect } from "vitest";
import {
  BACKUP_SCHEMA_VERSION,
  BackupValidationError,
  createBackup,
  findOrphans,
  parseBackupText,
  planImport,
  serializeBackup,
} from "./backup";
import {
  EMPTY_SNAPSHOT,
  LIMITS,
  makeBookmark,
  makeNote,
  type StudySnapshot,
} from "./records";

const NOW = "2026-11-02T10:00:00.000Z";

export function sampleSnapshot(): StudySnapshot {
  return {
    bookmarks: [
      makeBookmark("jelet-et-p1-2024", 7, "2026-11-01T09:00:00.000Z"),
      makeBookmark("jelet-et-p1-2025", 95, "2026-11-01T10:00:00.000Z"),
    ],
    positions: [
      { paperId: "jelet-et-p1-2024", questionNumber: 7, updatedAt: NOW },
    ],
    notes: [
      makeNote({
        questionId: "jelet-et-p1-2024:q7",
        text: "Remember the determinant expansion order.",
        createdAt: NOW,
        updatedAt: NOW,
      }),
    ],
    topics: [
      {
        topicId: "jelet-syllabus:mathematics:t01",
        subjectId: "jelet-syllabus:mathematics",
        title: "Matrices and Determinants",
        status: "studying",
        updatedAt: NOW,
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

function textWith(mutate: (envelope: Record<string, unknown>) => void) {
  const envelope = JSON.parse(
    serializeBackup(createBackup(sampleSnapshot(), NOW)),
  ) as Record<string, unknown>;
  mutate(envelope);
  return JSON.stringify(envelope);
}

describe("backup envelope", () => {
  it("round-trips valid data with app and version references", () => {
    const text = serializeBackup(createBackup(sampleSnapshot(), NOW));
    const { envelope, issues } = parseBackupText(text);
    expect(envelope.app).toBe("jelet-prep");
    expect(envelope.kind).toBe("study-workspace-backup");
    expect(envelope.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(envelope.exportedAt).toBe(NOW);
    expect(envelope.contentVersion).toBe("2026-11-02.1");
    expect(envelope.data).toEqual(sampleSnapshot());
    expect(issues).toEqual([]);
  });

  it("warns instead of failing when the content version differs", () => {
    const parsed = parseBackupText(
      textWith((envelope) => (envelope.contentVersion = "2025-01-01.1")),
    );
    expect(parsed.issues).toHaveLength(1);
    expect(parsed.issues[0].message).toContain("content 2025-01-01.1");
  });

  it("rejects malformed, foreign and oversized files", () => {
    expect(() => parseBackupText("")).toThrow(BackupValidationError);
    expect(() => parseBackupText("{not json")).toThrow(/valid JSON/);
    expect(() => parseBackupText(JSON.stringify({ hello: "world" }))).toThrow(
      /not a JELETprep study backup/,
    );
    expect(() =>
      parseBackupText(
        textWith((envelope) => {
          envelope.app = "someone-else";
        }),
      ),
    ).toThrow(/not a JELETprep study backup/);
    expect(() => parseBackupText("x".repeat(LIMITS.backupBytes + 1))).toThrow(
      /larger than 2 MB/,
    );
  });

  it("rejects incompatible versions safely", () => {
    expect(() =>
      parseBackupText(textWith((envelope) => (envelope.schemaVersion = 2))),
    ).toThrow(/newer version of JELETprep/);
    expect(() =>
      parseBackupText(textWith((envelope) => (envelope.schemaVersion = 0))),
    ).toThrow(/format is not supported/);
    expect(() =>
      parseBackupText(textWith((envelope) => (envelope.schemaVersion = "1"))),
    ).toThrow(/no usable schema version/);
  });

  it("rejects invalid records with details and writes nothing", () => {
    try {
      parseBackupText(
        textWith((envelope) => {
          const data = envelope.data as StudySnapshot;
          data.bookmarks[0] = {
            ...data.bookmarks[0],
            questionId: "not-a-question",
          } as never;
          data.notes[0] = { ...data.notes[0], text: "x".repeat(5000) } as never;
        }),
      );
      throw new Error("expected a validation failure");
    } catch (error) {
      expect(error).toBeInstanceOf(BackupValidationError);
      const details = (error as BackupValidationError).details.join(" ");
      expect(details).toContain("bookmarks #1");
      expect(details).toContain("notes #1");
    }
  });

  it("rejects mismatched IDs, bad timestamps and unknown statuses", () => {
    const base = JSON.parse(
      serializeBackup(createBackup(sampleSnapshot(), NOW)),
    ) as { data: StudySnapshot };
    const cases: unknown[] = [
      { ...base.data.topics[0], status: "mastered" },
      { ...base.data.bookmarks[0], paperId: "jelet-et-p1-2025" },
      { ...base.data.notes[0], updatedAt: "yesterday" },
      { ...base.data.positions[0], questionNumber: 1000 },
      { ...base.data.history[0], entryId: "wrong" },
    ];
    for (const record of cases) {
      const envelope = JSON.parse(JSON.stringify(base));
      const store: keyof StudySnapshot = (
        ["topics", "bookmarks", "notes", "positions", "history"] as const
      )[cases.indexOf(record)];
      (envelope.data[store] as unknown[])[0] = record;
      expect(() => parseBackupText(JSON.stringify(envelope))).toThrow(
        BackupValidationError,
      );
    }
  });

  it("accepts missing store sections with a warning", () => {
    const parsed = parseBackupText(
      textWith((envelope) => {
        const data = envelope.data as Record<string, unknown>;
        delete data.history;
      }),
    );
    expect(parsed.envelope.data.history).toEqual([]);
    expect(
      parsed.issues.some((issue) => issue.message.includes("history")),
    ).toBe(true);
  });

  it("deduplicates repeated keys inside one file, keeping the newest", () => {
    const parsed = parseBackupText(
      textWith((envelope) => {
        const data = envelope.data as StudySnapshot;
        data.notes.push({
          ...data.notes[0],
          text: "Newer text",
          updatedAt: "2026-11-02T11:00:00.000Z",
        });
      }),
    );
    expect(parsed.envelope.data.notes).toHaveLength(1);
    expect(parsed.envelope.data.notes[0].text).toBe("Newer text");
  });

  it("enforces per-store record limits", () => {
    expect(() =>
      parseBackupText(
        textWith((envelope) => {
          const data = envelope.data as StudySnapshot;
          data.history = Array.from(
            { length: LIMITS.maxHistory + 1 },
            (_, index) => {
              const at = new Date(Date.parse(NOW) + index * 1000).toISOString();
              return {
                entryId: `paper:2024:${at}`,
                kind: "paper" as const,
                targetId: "2024",
                at,
              };
            },
          );
        }),
      ),
    ).toThrow(/limit is/);
  });
});

describe("import planning and merge policy", () => {
  it("merges newer incoming records and keeps newer local ones", () => {
    const local = sampleSnapshot();
    local.notes[0] = {
      ...local.notes[0],
      text: "Local newer text",
      updatedAt: "2026-11-02T12:00:00.000Z",
    };
    const incoming = sampleSnapshot();
    incoming.notes[0] = {
      ...incoming.notes[0],
      text: "Older incoming text",
      updatedAt: "2026-11-02T08:00:00.000Z",
    };
    incoming.bookmarks.push(
      makeBookmark("jelet-et-p1-2017", 3, "2026-11-02T13:00:00.000Z"),
    );
    const envelope = createBackup(incoming, NOW);
    const plan = planImport(local, envelope);
    expect(plan.mergeDiffs.notes).toEqual({ add: 0, update: 0, keep: 1 });
    expect(plan.mergeDiffs.bookmarks).toEqual({ add: 1, update: 0, keep: 2 });
    const mergedNote = plan.records.notes.find(
      (note) => note.questionId === "jelet-et-p1-2024:q7",
    );
    expect(mergedNote?.text).toBe("Local newer text");
  });

  it("keeps the local record when timestamps match", () => {
    const local = sampleSnapshot();
    local.topics[0] = { ...local.topics[0], status: "revised" };
    const plan = planImport(local, createBackup(sampleSnapshot(), NOW));
    expect(
      plan.records.topics.find(
        (topic) => topic.topicId === local.topics[0].topicId,
      )?.status,
    ).toBe("revised");
    expect(plan.mergeDiffs.topics).toEqual({ add: 0, update: 0, keep: 1 });
  });

  it("makes duplicate imports idempotent", () => {
    const envelope = createBackup(sampleSnapshot(), NOW);
    const first = planImport(EMPTY_SNAPSHOT, envelope);
    const second = planImport(first.records, envelope);
    expect(second.records).toEqual(first.records);
    expect(second.mergeDiffs.bookmarks).toEqual({ add: 0, update: 0, keep: 2 });
    expect(second.mergeDiffs.history).toEqual({ add: 0, update: 0, keep: 1 });
  });

  it("flags orphaned references instead of deleting them", () => {
    const orphans = findOrphans({
      bookmarks: [
        makeBookmark("jelet-et-p1-2024", 61), // known gap in 2024
        makeBookmark("jelet-et-p1-2001", 3), // no such paper
        makeBookmark("jelet-et-p1-2024", 1),
      ],
      notes: [
        makeNote({ questionId: "jelet-et-p1-2022:q88", text: "or maybe" }),
      ],
      topics: [
        {
          topicId: "jelet-syllabus:physics:t99",
          subjectId: "jelet-syllabus:physics",
          title: "Removed topic",
          status: "revised",
          updatedAt: NOW,
        },
      ],
    });
    expect(orphans.bookmarks.map((entry) => entry.questionId)).toEqual([
      "jelet-et-p1-2024:q61",
      "jelet-et-p1-2001:q3",
    ]);
    expect(orphans.bookmarks[0].reason).toContain("not present");
    expect(orphans.notes).toHaveLength(1);
    expect(orphans.topics).toHaveLength(1);
    const plan = planImport(
      EMPTY_SNAPSHOT,
      createBackup(sampleSnapshot(), NOW),
    );
    expect(plan.orphans.bookmarks).toEqual([]);
  });
});
