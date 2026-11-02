import { useEffect, useRef, useState, lazy, Suspense } from "react";
import {
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
  ShieldCheck,
  StickyNote,
  Trash2,
} from "lucide-react";
import {
  archive,
  loadPaper,
  missingNumbers,
  paperId as toPaperId,
  papers,
  parsePaper,
} from "./content";
import { LIMITS, type NoteRecord } from "./study/records";
import { useStudy } from "./study/StudyProvider";
import { Link, SourceLink, SaveStatus } from "./ui";

const Markdown = lazy(() => import("./Markdown"));

type NoteStatus =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "saved" }
  | { state: "error"; message: string }
  | { state: "conflict"; latest: NoteRecord };

export default function Reader({ year }: { year: number }) {
  const paper = papers.find((p) => p.year === year);
  const paperKey = toPaperId(year);
  const study = useStudy();
  const [data, setData] = useState<ReturnType<typeof parsePaper> | null>(null);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState<number | null>(null);
  const [resumed, setResumed] = useState(false);
  const [font, setFont] = useState(18);
  const [qSearch, setQSearch] = useState("");
  const [bookmarkMessage, setBookmarkMessage] = useState<{
    state: "idle" | "saving" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });
  const [noteDraft, setNoteDraft] = useState("");
  const [noteBaseline, setNoteBaseline] = useState<string | null>(null);
  const [noteStatus, setNoteStatus] = useState<NoteStatus>({ state: "idle" });
  const article = useRef<HTMLElement>(null);
  const initialised = useRef(false);
  const visited = useRef(false);
  const ready = study.status === "ready";

  // Latest callbacks without re-triggering effects on every snapshot refresh.
  const rememberPosition = useRef(study.rememberPosition);
  rememberPosition.current = study.rememberPosition;
  const rememberVisit = useRef(study.rememberVisit);
  rememberVisit.current = study.rememberVisit;

  useEffect(() => {
    let alive = true;
    setError("");
    setData(null);
    initialised.current = false;
    visited.current = false;
    if (!paper) return;
    loadPaper(year)
      .then((raw) => {
        if (!alive) return;
        setData(parsePaper(raw));
      })
      .catch(() => {
        if (alive)
          setError("We couldn’t load this transcription. Please retry.");
      });
    return () => {
      alive = false;
    };
  }, [year, paper]);

  const question = data?.questions.find((q) => q.number === current);
  const index = data?.questions.findIndex((q) => q.number === current) ?? 0;
  const missing = data
    ? missingNumbers(data.questions)
    : (paper?.missing ?? []);
  const questions = data?.questions;
  const bookmarked = current
    ? study.isBookmarked(`${paperKey}:q${current}`)
    : false;
  const storedNote = current
    ? study.notesByQuestion.get(`${paperKey}:q${current}`)
    : undefined;

  // Decide the opening question once: URL wins, then the saved position.
  useEffect(() => {
    if (!questions?.length || study.status === "loading" || initialised.current)
      return;
    initialised.current = true;
    const asked = Number(
      new URLSearchParams(location.hash.split("?")[1]).get("q"),
    );
    if (questions.some((q) => q.number === asked)) {
      setCurrent(asked);
      setResumed(false);
      return;
    }
    const saved = study.positionFor(paperKey);
    if (saved && questions.some((q) => q.number === saved.questionNumber)) {
      setCurrent(saved.questionNumber);
      setResumed(true);
      return;
    }
    setCurrent(questions[0].number);
    setResumed(false);
    // `study.positionFor` intentionally read once, when storage is known.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, study.status, paperKey]);

  // Record a real reading-history entry once per opened paper.
  useEffect(() => {
    if (!data || !ready || visited.current) return;
    visited.current = true;
    void rememberVisit.current("paper", String(year));
  }, [data, ready, year]);

  // Throttled position write: only the settled question is stored.
  useEffect(() => {
    if (!ready || !data || current === null || !initialised.current) return;
    const timer = setTimeout(() => {
      void rememberPosition.current(paperKey, current);
    }, 600);
    return () => clearTimeout(timer);
  }, [current, data, paperKey, ready]);

  // Load the editor when the question changes. Later changes from another tab
  // deliberately do not overwrite typing: saving detects the conflict instead.
  useEffect(() => {
    setNoteDraft(storedNote?.text ?? "");
    setNoteBaseline(storedNote?.updatedAt ?? null);
    setNoteStatus({ state: "idle" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function choose(n: number) {
    setCurrent(n);
    setResumed(false);
    history.replaceState(null, "", `#/papers/${year}?q=${n}`);
    article.current?.scrollIntoView({ behavior: "instant", block: "start" });
    article.current?.focus();
  }

  async function toggleBookmark() {
    if (current === null) return;
    setBookmarkMessage({ state: "saving" });
    const outcome = await study.toggleBookmark(paperKey, current);
    setBookmarkMessage(
      outcome.ok
        ? { state: "saved" }
        : { state: "error", message: outcome.error },
    );
  }

  async function saveCurrentNote(force = false) {
    if (current === null) return;
    setNoteStatus({ state: "saving" });
    const result = await study.saveNoteDraft({
      questionId: `${paperKey}:q${current}`,
      text: noteDraft,
      expectedUpdatedAt: noteBaseline,
      force,
    });
    if (result.ok) {
      setNoteBaseline(result.note?.updatedAt ?? null);
      setNoteStatus({ state: "saved" });
      return;
    }
    if (result.conflict) {
      setNoteStatus({ state: "conflict", latest: result.conflict });
      return;
    }
    setNoteStatus({ state: "error", message: result.error ?? "Not saved." });
  }

  async function deleteCurrentNote() {
    if (!storedNote) return;
    setNoteStatus({ state: "saving" });
    const outcome = await study.removeNote(storedNote.noteId);
    if (outcome.ok) {
      setNoteDraft("");
      setNoteBaseline(null);
      setNoteStatus({ state: "saved" });
    } else {
      setNoteStatus({
        state: "error",
        message: outcome.error ?? "Not saved.",
      });
    }
  }

  function adoptLatestNote(latest: NoteRecord) {
    setNoteDraft(latest.text);
    setNoteBaseline(latest.updatedAt);
    setNoteStatus({ state: "idle" });
  }

  if (!paper)
    return (
      <div className="empty">
        <AlertTriangle size={35} />
        <h1>That paper is not in this collection.</h1>
        <Link to="/papers" className="button primary">
          Back to library
        </Link>
      </div>
    );

  return (
    <>
      <div className="reader-breadcrumb">
        <Link to="/papers">
          <ChevronLeft size={15} />
          Question library
        </Link>
        <span>/</span>
        <span>{year}</span>
      </div>
      <div className="reader-title">
        <div>
          <div className="eyebrow">
            ENGINEERING & TECHNOLOGY · {paper.era.toUpperCase()}
          </div>
          <h1>
            JELET {year}
            <span className="title-light"> / Question paper</span>
          </h1>
        </div>
        <SourceLink href={paper.source}>
          {paper.source === archive ? "Official archive" : "Official paper PDF"}
        </SourceLink>
      </div>
      <div className="notice warning">
        <AlertTriangle size={19} />
        <p>
          <strong>Unverified study transcription.</strong> {paper.note} No
          verified answers or solutions are supplied.{" "}
          {missing.length > 0 &&
            `Missing question numbers: ${missing.join(", ")}.`}
        </p>
      </div>
      {error ? (
        <div className="empty" role="alert">
          <AlertTriangle size={32} />
          <h2>Something didn’t load.</h2>
          <p>{error}</p>
          <button className="button primary" onClick={() => location.reload()}>
            Retry loading
          </button>
        </div>
      ) : !data ? (
        <div className="loading" role="status">
          Loading question paper…
        </div>
      ) : (
        <div className="reader-layout">
          <aside className="question-nav">
            <div className="question-nav-title">
              <h2>Question index</h2>
              <span>{data.questions.length} present</span>
            </div>
            <label className="search-field small">
              <Search size={16} />
              <input
                aria-label="Find question number"
                placeholder="Find a question…"
                value={qSearch}
                onChange={(e) => setQSearch(e.target.value)}
              />
            </label>
            <div className="question-grid">
              {data.questions
                .filter((q) => !qSearch || String(q.number).includes(qSearch))
                .map((q) => (
                  <button
                    key={q.number}
                    aria-label={`Question ${q.number}`}
                    aria-current={q.number === current ? "true" : undefined}
                    className={
                      (q.number === current ? "selected" : "") +
                      (study.isBookmarked(`${paperKey}:q${q.number}`)
                        ? " bookmarked"
                        : "")
                    }
                    onClick={() => choose(q.number)}
                  >
                    {q.number}
                  </button>
                ))}
            </div>
            {!data.questions.some(
              (q) => !qSearch || String(q.number).includes(qSearch),
            ) && <p className="muted">No matching question.</p>}
            <div className="index-foot">
              <Info size={14} />
              Numbers reflect the transcription, not verification.
            </div>
          </aside>
          <article className="question-panel" ref={article} tabIndex={-1}>
            <div className="question-toolbar">
              <span>
                QUESTION {current}{" "}
                <span className="muted">OF 100 EXPECTED</span>
              </span>
              <div className="question-actions">
                <button
                  className={"chip-button " + (bookmarked ? "active" : "")}
                  aria-pressed={bookmarked}
                  disabled={!ready || !current}
                  onClick={() => void toggleBookmark()}
                  title={
                    ready
                      ? "Save this question to your bookmarks"
                      : "Bookmarks need local storage, which this browser is blocking"
                  }
                >
                  {bookmarked ? (
                    <BookmarkCheck size={15} />
                  ) : (
                    <Bookmark size={15} />
                  )}
                  {bookmarked ? "Bookmarked" : "Bookmark"}
                </button>
                <SaveStatus
                  state={bookmarkMessage.state}
                  message={bookmarkMessage.message}
                />
                <div className="font-controls" aria-label="Reading size">
                  <button
                    aria-label="Decrease font size"
                    disabled={font <= 16}
                    onClick={() => setFont((f) => f - 2)}
                  >
                    A−
                  </button>
                  <button
                    aria-label="Increase font size"
                    disabled={font >= 24}
                    onClick={() => setFont((f) => f + 2)}
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>
            {resumed && current !== null && (
              <div className="notice subtle resume-notice">
                <Bookmark size={16} />
                <p>
                  Resumed at <strong>question {current}</strong> — the position
                  saved on this device.{" "}
                  <button
                    className="link-button"
                    onClick={() => choose(data.questions[0].number)}
                  >
                    Start from question {data.questions[0].number}
                  </button>
                </p>
              </div>
            )}
            {question ? (
              <>
                <div className="question-section">{question.section}</div>
                {question.warning && (
                  <div className="inline-warning">
                    <AlertTriangle size={16} />
                    This question references image-based or missing content.
                    Consult the original PDF.
                  </div>
                )}
                <div className="question-text" style={{ fontSize: font }}>
                  <Suspense
                    fallback={<p role="status">Loading maths renderer…</p>}
                  >
                    <Markdown text={question.text} />
                  </Suspense>
                </div>
                <details className="note-panel" open={Boolean(storedNote)}>
                  <summary>
                    <StickyNote size={15} />
                    Your note
                    {storedNote && <span className="note-present">Saved</span>}
                  </summary>
                  <div className="note-body">
                    <label className="sr-only" htmlFor={`note-${current}`}>
                      Note for question {current}
                    </label>
                    <textarea
                      id={`note-${current}`}
                      value={noteDraft}
                      maxLength={LIMITS.noteLength}
                      placeholder="Write a plain-text note for this question…"
                      onChange={(e) => {
                        setNoteDraft(e.target.value);
                        setNoteStatus({ state: "idle" });
                      }}
                    />
                    <div className="note-actions">
                      <span className="note-meta">
                        {noteDraft.length}/{LIMITS.noteLength} · plain text ·
                        stored on this device only
                      </span>
                      <div>
                        {storedNote && (
                          <button
                            className="button secondary"
                            onClick={() => void deleteCurrentNote()}
                            disabled={noteStatus.state === "saving"}
                          >
                            <Trash2 size={14} />
                            Delete note
                          </button>
                        )}
                        <button
                          className="button primary"
                          disabled={
                            !ready ||
                            !noteDraft.trim() ||
                            noteStatus.state === "saving"
                          }
                          onClick={() => void saveCurrentNote()}
                        >
                          Save note
                        </button>
                      </div>
                    </div>
                    {!ready && (
                      <p className="note-warning" role="status">
                        Notes can’t be saved because this browser is blocking
                        local storage.
                      </p>
                    )}
                    {noteStatus.state === "conflict" && (
                      <div className="note-warning" role="alert">
                        <p>
                          This note was edited in another tab. Choose which
                          version to keep.
                        </p>
                        <div className="note-actions">
                          <button
                            className="button secondary"
                            onClick={() => adoptLatestNote(noteStatus.latest)}
                          >
                            Load the other tab’s version
                          </button>
                          <button
                            className="button primary"
                            onClick={() => {
                              setNoteBaseline(noteStatus.latest.updatedAt);
                              void saveCurrentNote(true);
                            }}
                          >
                            Keep my version
                          </button>
                        </div>
                      </div>
                    )}
                    {noteStatus.state === "error" && (
                      <p className="note-warning" role="alert">
                        {noteStatus.message} Your text is still in the box — try
                        saving again.
                      </p>
                    )}
                    <SaveStatus
                      state={
                        noteStatus.state === "conflict" ||
                        noteStatus.state === "error"
                          ? "idle"
                          : noteStatus.state
                      }
                    />
                  </div>
                </details>
                <div className="reader-bottom">
                  <span>
                    <ShieldCheck size={15} />
                    Read-only · Answer key not verified
                  </span>
                  <div>
                    <button
                      className="button secondary"
                      disabled={index <= 0}
                      onClick={() => choose(data.questions[index - 1].number)}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    <button
                      className="button primary"
                      disabled={index >= data.questions.length - 1}
                      onClick={() => choose(data.questions[index + 1].number)}
                    >
                      Next question
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p>No readable questions were found.</p>
            )}
          </article>
        </div>
      )}
    </>
  );
}
