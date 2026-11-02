import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addBookmark,
  applyImport,
  clearTopicStatus,
  deleteNote,
  loadSnapshot,
  NoteConflictError,
  recordVisit,
  removeBookmark,
  resetWorkspace,
  saveNote,
  savePosition,
  setTopicStatus,
  type SaveNoteInput,
} from "./repository";
import { classifyError, errorMessage, StorageError } from "./db";
import {
  EMPTY_SNAPSHOT,
  type BookmarkRecord,
  type HistoryKind,
  type NoteRecord,
  type PositionRecord,
  type StudySnapshot,
  type TopicRecord,
  type TopicStatus,
} from "./records";
import {
  BackupValidationError,
  createBackup,
  parseBackupText,
  planImport,
  serializeBackup,
  type ImportPlan,
  type MergeMode,
} from "./backup";

const CHANNEL_NAME = "jelet-prep-study-sync";

export type StorageStatus = "loading" | "ready" | "unavailable";

export interface WriteOutcome {
  ok: boolean;
  error?: string;
}

export interface NoteSaveResult extends WriteOutcome {
  note?: NoteRecord | null;
  conflict?: NoteRecord;
}

export interface ImportResult extends WriteOutcome {
  plan?: ImportPlan;
  written?: number;
  mode?: MergeMode;
}

interface StudyContextValue {
  status: StorageStatus;
  storageError: StorageError | null;
  droppedRecords: number;
  snapshot: StudySnapshot;
  bookmarksByQuestion: Map<string, BookmarkRecord>;
  notesByQuestion: Map<string, NoteRecord>;
  topicsById: Map<string, TopicRecord>;
  positionFor: (paperId: string) => PositionRecord | undefined;
  isBookmarked: (questionId: string) => boolean;
  toggleBookmark: (
    paperId: string,
    questionNumber: number,
  ) => Promise<WriteOutcome>;
  removeBookmarkById: (questionId: string) => Promise<WriteOutcome>;
  saveNoteDraft: (input: SaveNoteInput) => Promise<NoteSaveResult>;
  removeNote: (noteId: string) => Promise<WriteOutcome>;
  updateTopicStatus: (
    topic: { topicId: string; subjectId: string; title: string },
    status: TopicStatus,
  ) => Promise<WriteOutcome>;
  resetTopicStatus: (topicId: string) => Promise<WriteOutcome>;
  rememberVisit: (kind: HistoryKind, targetId: string) => Promise<void>;
  rememberPosition: (
    paperId: string,
    questionNumber: number,
  ) => Promise<WriteOutcome>;
  previewImport: (
    text: string,
  ) => { plan: ImportPlan } | { error: string; details: string[] };
  commitImport: (plan: ImportPlan, mode: MergeMode) => Promise<ImportResult>;
  exportBackupText: () => string;
  resetAll: () => Promise<WriteOutcome>;
  reload: () => Promise<void>;
}

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<StorageStatus>("loading");
  const [storageError, setStorageError] = useState<StorageError | null>(null);
  const [droppedRecords, setDroppedRecords] = useState(0);
  const [snapshot, setSnapshot] = useState<StudySnapshot>(EMPTY_SNAPSHOT);
  const channel = useRef<BroadcastChannel | null>(null);
  const mounted = useRef(true);

  const reload = useCallback(async () => {
    try {
      const loaded = await loadSnapshot();
      if (!mounted.current) return;
      setSnapshot(loaded.snapshot);
      setDroppedRecords(loaded.dropped);
      setStatus("ready");
      setStorageError(null);
    } catch (error) {
      if (!mounted.current) return;
      setStatus((current) => (current === "ready" ? "ready" : "unavailable"));
      setStorageError(
        error instanceof StorageError ? error : classifyError(error),
      );
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void reload();
    return () => {
      mounted.current = false;
    };
  }, [reload]);

  // Other tabs announce committed changes; this tab re-reads committed truth.
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    let active = true;
    let local: BroadcastChannel | null = null;
    try {
      local = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      return;
    }
    local.onmessage = (event: MessageEvent) => {
      if (!active) return;
      if ((event.data as { type?: string })?.type === "workspace-changed")
        void reload();
    };
    channel.current = local;
    const onVisible = () => {
      if (document.visibilityState === "visible") void reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      local?.close();
      channel.current = null;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [reload]);

  const announce = useCallback(() => {
    channel.current?.postMessage({ type: "workspace-changed" });
  }, []);

  const fail = useCallback((error: unknown): WriteOutcome => {
    const storage =
      error instanceof StorageError ? error : classifyError(error);
    setStorageError(storage);
    return { ok: false, error: storage.message };
  }, []);

  const runWrite = useCallback(
    async (work: () => Promise<unknown>): Promise<WriteOutcome> => {
      try {
        await work();
        await reload();
        announce();
        return { ok: true };
      } catch (error) {
        if (error instanceof NoteConflictError) throw error;
        return fail(error);
      }
    },
    [announce, fail, reload],
  );

  const value = useMemo<StudyContextValue>(() => {
    const bookmarksByQuestion = new Map(
      snapshot.bookmarks.map((record) => [record.questionId, record]),
    );
    const notesByQuestion = new Map(
      snapshot.notes.map((record) => [record.questionId, record]),
    );
    const topicsById = new Map(
      snapshot.topics.map((record) => [record.topicId, record]),
    );
    const positions = new Map(
      snapshot.positions.map((record) => [record.paperId, record]),
    );
    return {
      status,
      storageError,
      droppedRecords,
      snapshot,
      bookmarksByQuestion,
      notesByQuestion,
      topicsById,
      positionFor: (paperId) => positions.get(paperId),
      isBookmarked: (questionId) => bookmarksByQuestion.has(questionId),
      toggleBookmark: async (paperId, questionNumber) => {
        const questionId = `${paperId}:q${questionNumber}`;
        const exists = bookmarksByQuestion.has(questionId);
        if (status !== "ready") return fail(new StorageError("unavailable"));
        return runWrite(() =>
          exists
            ? removeBookmark(questionId)
            : addBookmark(paperId, questionNumber),
        );
      },
      removeBookmarkById: async (questionId) => {
        if (status !== "ready") return fail(new StorageError("unavailable"));
        return runWrite(() => removeBookmark(questionId));
      },
      saveNoteDraft: async (input) => {
        if (status !== "ready") return fail(new StorageError("unavailable"));
        try {
          const note = await saveNote(input);
          await reload();
          announce();
          return { ok: true, note };
        } catch (error) {
          if (error instanceof NoteConflictError)
            return {
              ok: false,
              conflict: error.latest,
              error: "This note changed in another tab.",
            };
          return { ...fail(error) };
        }
      },
      removeNote: async (noteId) => {
        if (status !== "ready") return fail(new StorageError("unavailable"));
        return runWrite(() => deleteNote(noteId));
      },
      updateTopicStatus: async (topic, topicStatus) => {
        if (status !== "ready") return fail(new StorageError("unavailable"));
        return runWrite(() =>
          setTopicStatus({ ...topic, status: topicStatus }),
        );
      },
      resetTopicStatus: async (topicId) => {
        if (status !== "ready") return fail(new StorageError("unavailable"));
        return runWrite(() => clearTopicStatus(topicId));
      },
      rememberVisit: async (kind, targetId) => {
        if (status !== "ready") return;
        try {
          await recordVisit(kind, targetId);
          // History is a background log: refresh quietly after the write.
          await reload();
          announce();
        } catch {
          /* Reading still works; the failure surfaces on the next explicit write. */
        }
      },
      rememberPosition: async (paperId, questionNumber) => {
        if (status !== "ready")
          return { ok: false, error: new StorageError("unavailable").message };
        // Positions are announced for dashboard freshness but never block reading.
        return runWrite(() => savePosition(paperId, questionNumber));
      },
      previewImport: (text) => {
        try {
          const parsed = parseBackupText(text);
          return {
            plan: planImport(snapshot, parsed.envelope, parsed.issues),
          };
        } catch (error) {
          const details =
            error instanceof BackupValidationError ? error.details : [];
          return { error: errorMessage(error), details };
        }
      },
      commitImport: async (plan, mode) => {
        if (status !== "ready")
          return { ok: false, error: new StorageError("unavailable").message };
        try {
          const written = await applyImport(plan, mode);
          await reload();
          announce();
          return {
            ok: true,
            plan,
            mode,
            written:
              written.bookmarks.length +
              written.positions.length +
              written.notes.length +
              written.topics.length +
              written.history.length,
          };
        } catch (error) {
          return { ok: false, error: errorMessage(error) };
        }
      },
      exportBackupText: () => serializeBackup(createBackup(snapshot)),
      resetAll: async () => {
        if (status !== "ready") return fail(new StorageError("unavailable"));
        return runWrite(() => resetWorkspace());
      },
      reload,
    };
  }, [announce, fail, reload, runWrite, snapshot, status, storageError]);

  return (
    <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error("useStudy must be used inside StudyProvider");
  return context;
}

/** Honest one-line status for actions that write to device storage. */
export function writeStatusText(outcome: WriteOutcome | null) {
  if (!outcome) return "";
  return outcome.ok ? "Saved on this device." : (outcome.error ?? "Not saved.");
}
