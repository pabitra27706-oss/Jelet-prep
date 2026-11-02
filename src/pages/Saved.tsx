import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Pencil,
  Search,
  StickyNote,
  Trash2,
} from "lucide-react";
import { papers } from "../content";
import { findOrphans } from "../study/backup";
import { LIMITS, type NoteRecord } from "../study/records";
import { useStudy } from "../study/StudyProvider";
import { Link, PageHeading, SaveStatus } from "../ui";
import { describeQuestion, formatDateTime } from "./shared";

type ActionStatus = {
  state: "idle" | "saving" | "saved" | "error";
  message?: string;
};

export default function Saved() {
  const study = useStudy();
  const [paperFilter, setPaperFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ActionStatus>({ state: "idle" });
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [editStatus, setEditStatus] = useState<ActionStatus>({ state: "idle" });

  const orphans = useMemo(() => findOrphans(study.snapshot), [study.snapshot]);
  const orphanIds = useMemo(
    () => new Set(orphans.bookmarks.map((entry) => entry.questionId)),
    [orphans],
  );

  const bookmarks = study.snapshot.bookmarks.filter((bookmark) => {
    const year = paperFilter === "all" ? null : Number(paperFilter);
    return (
      !orphanIds.has(bookmark.questionId) &&
      (year === null || bookmark.paperId === `jelet-et-p1-${year}`)
    );
  });
  const notes = study.snapshot.notes.filter((note) => {
    const year = paperFilter === "all" ? null : Number(paperFilter);
    const matchesPaper =
      year === null || note.paperId === `jelet-et-p1-${year}`;
    const matchesQuery =
      !query.trim() ||
      note.text.toLowerCase().includes(query.trim().toLowerCase()) ||
      describeQuestion(note.questionId)
        .label.toLowerCase()
        .includes(query.trim().toLowerCase());
    return matchesPaper && matchesQuery;
  });
  const hasAnything =
    study.snapshot.bookmarks.length + study.snapshot.notes.length > 0;

  async function remove(questionId: string) {
    setStatus({ state: "saving" });
    const outcome = await study.removeBookmarkById(questionId);
    setStatus(
      outcome.ok
        ? { state: "saved" }
        : { state: "error", message: outcome.error },
    );
  }

  async function removeNote(note: NoteRecord) {
    setStatus({ state: "saving" });
    const outcome = await study.removeNote(note.noteId);
    if (outcome.ok && editing === note.noteId) setEditing(null);
    setStatus(
      outcome.ok
        ? { state: "saved" }
        : { state: "error", message: outcome.error },
    );
  }

  function startEditing(note: NoteRecord) {
    setEditing(note.noteId);
    setDraft(note.text);
    setEditStatus({ state: "idle" });
  }

  async function saveEdit(note: NoteRecord) {
    setEditStatus({ state: "saving" });
    const result = await study.saveNoteDraft({
      questionId: note.questionId,
      text: draft,
      expectedUpdatedAt: note.updatedAt,
    });
    if (result.ok) {
      setEditing(null);
      setEditStatus({ state: "saved" });
      setStatus({ state: "saved" });
      return;
    }
    setEditStatus({
      state: "error",
      message: result.conflict
        ? "This note changed in another tab. Reopen it to load the newer text."
        : (result.error ?? "Not saved."),
    });
  }

  return (
    <>
      <PageHeading
        eyebrow="SAVED & NOTES"
        title="The parts worth keeping."
        description="Everything here is stored in this browser only. Bookmarks reopen the exact question; notes are plain text and never leave your device."
      />
      {study.status === "unavailable" && (
        <div className="notice warning" role="alert">
          <AlertTriangle size={19} />
          <p>
            <strong>Local storage is unavailable.</strong>{" "}
            {study.storageError?.message} Reading still works, but nothing on
            this page can be saved.
          </p>
        </div>
      )}
      <div className="library-toolbar saved-toolbar">
        <label className="search-field">
          <Search size={19} />
          <input
            aria-label="Search your notes"
            placeholder="Search your notes…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="filter-field">
          <span className="sr-only">Filter by paper</span>
          <select
            aria-label="Filter saved items by paper"
            value={paperFilter}
            onChange={(event) => setPaperFilter(event.target.value)}
          >
            <option value="all">All papers</option>
            {papers.map((paper) => (
              <option key={paper.year} value={paper.year}>
                JELET {paper.year}
              </option>
            ))}
          </select>
        </label>
        <SaveStatus state={status.state} message={status.message} />
      </div>

      {!hasAnything ? (
        <div className="empty">
          <Bookmark size={36} />
          <h2>Nothing saved yet.</h2>
          <p>
            Open a paper and use <strong>Bookmark</strong> or{" "}
            <strong>Your note</strong> on any question. Saved items appear here
            and survive a reload.
          </p>
          <div className="empty-actions">
            <Link to="/papers" className="button primary">
              Browse papers <ArrowRight size={15} />
            </Link>
            <Link to="/syllabus" className="button secondary">
              Explore the syllabus
            </Link>
          </div>
        </div>
      ) : (
        <div className="saved-layout">
          <section className="panel" aria-labelledby="saved-bookmarks">
            <div className="panel-head">
              <h2 id="saved-bookmarks">
                <Bookmark size={18} /> Bookmarked questions
              </h2>
              <span>{bookmarks.length} shown</span>
            </div>
            {bookmarks.length ? (
              <ul className="saved-list">
                {bookmarks.map((bookmark) => (
                  <li key={bookmark.questionId}>
                    <div>
                      <strong>
                        {describeQuestion(bookmark.questionId).label}
                      </strong>
                      <span>Saved {formatDateTime(bookmark.createdAt)}</span>
                    </div>
                    <div className="saved-actions">
                      <Link
                        to={`/papers/${bookmark.paperId.slice(-4)}?q=${bookmark.questionNumber}`}
                        className="button secondary"
                      >
                        Open question
                      </Link>
                      <button
                        className="icon-button"
                        aria-label={`Remove bookmark for ${describeQuestion(bookmark.questionId).label}`}
                        onClick={() => void remove(bookmark.questionId)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted panel-empty">
                No bookmarks match this filter.
              </p>
            )}
            {orphans.bookmarks.length > 0 && (
              <div className="orphan-block">
                <div className="orphan-head">
                  <AlertTriangle size={16} />
                  <h3>Bookmarks whose question is no longer available</h3>
                </div>
                <p>
                  These were kept instead of being deleted. The paper or
                  question number is not in the current transcription.
                </p>
                <ul className="saved-list">
                  {orphans.bookmarks.map((orphan) => (
                    <li key={orphan.questionId}>
                      <div>
                        <strong>
                          {describeQuestion(orphan.questionId).label}
                        </strong>
                        <span>{orphan.reason}</span>
                      </div>
                      <button
                        className="button secondary"
                        onClick={() => void remove(orphan.questionId)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="panel" aria-labelledby="saved-notes">
            <div className="panel-head">
              <h2 id="saved-notes">
                <StickyNote size={18} /> Your notes
              </h2>
              <span>{notes.length} shown</span>
            </div>
            {notes.length ? (
              <ul className="note-list">
                {notes.map((note) => (
                  <li key={note.noteId}>
                    <div className="note-list-head">
                      <strong>{describeQuestion(note.questionId).label}</strong>
                      <span>Updated {formatDateTime(note.updatedAt)}</span>
                    </div>
                    {editing === note.noteId ? (
                      <div className="note-edit">
                        <label
                          className="sr-only"
                          htmlFor={`edit-${note.noteId}`}
                        >
                          Edit note for{" "}
                          {describeQuestion(note.questionId).label}
                        </label>
                        <textarea
                          id={`edit-${note.noteId}`}
                          value={draft}
                          maxLength={LIMITS.noteLength}
                          onChange={(event) => setDraft(event.target.value)}
                        />
                        <div className="note-actions">
                          <span className="note-meta">
                            {draft.length}/{LIMITS.noteLength}
                          </span>
                          <div>
                            <button
                              className="button secondary"
                              onClick={() => setEditing(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className="button primary"
                              disabled={!draft.trim()}
                              onClick={() => void saveEdit(note)}
                            >
                              Save changes
                            </button>
                          </div>
                        </div>
                        <SaveStatus
                          state={editStatus.state}
                          message={editStatus.message}
                        />
                      </div>
                    ) : (
                      <p className="note-text">{note.text}</p>
                    )}
                    <div className="note-list-actions">
                      <Link
                        to={`/papers/${note.paperId.slice(-4)}?q=${note.questionNumber}`}
                        className="text-link"
                      >
                        Open question <ArrowRight size={14} />
                      </Link>
                      <button
                        className="icon-button"
                        aria-label={`Edit note for ${describeQuestion(note.questionId).label}`}
                        onClick={() => startEditing(note)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Delete note for ${describeQuestion(note.questionId).label}`}
                        onClick={() => void removeNote(note)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {orphans.notes.some(
                      (orphan) => orphan.questionId === note.questionId,
                    ) && (
                      <p className="note-warning">
                        <AlertTriangle size={14} /> This question is not in the
                        current transcription. The note is kept so you don’t
                        lose it.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted panel-empty">
                {study.snapshot.notes.length
                  ? "No notes match this filter."
                  : "No notes yet. Open any question to write one."}
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
