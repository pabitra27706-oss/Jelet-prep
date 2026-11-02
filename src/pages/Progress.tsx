import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookOpen,
  Clock,
  Layers,
  StickyNote,
  Target,
} from "lucide-react";
import { papers } from "../content";
import { subjects } from "../syllabus-data";
import { useStudy } from "../study/StudyProvider";
import { Link, PageHeading } from "../ui";
import { formatDateTime } from "./shared";

function statusCounts(
  records: { status: string; topicId: string }[],
  ids: string[],
) {
  const set = new Set(ids);
  const scoped = records.filter((record) => set.has(record.topicId));
  return {
    studying: scoped.filter((record) => record.status === "studying").length,
    revised: scoped.filter((record) => record.status === "revised").length,
  };
}

export default function Progress() {
  const study = useStudy();
  const topicIds = useMemo(
    () =>
      subjects.flatMap((subject) => subject.topics.map((topic) => topic.id)),
    [],
  );
  const counts = statusCounts(study.snapshot.topics, topicIds);
  const notStarted = topicIds.length - counts.studying - counts.revised;
  const recent = study.snapshot.history.slice(0, 8);
  const empty =
    study.snapshot.bookmarks.length === 0 &&
    study.snapshot.notes.length === 0 &&
    study.snapshot.topics.length === 0 &&
    study.snapshot.history.length === 0;

  return (
    <>
      <PageHeading
        eyebrow="YOUR PROGRESS"
        title="Only what you actually did."
        description="These numbers come from your own bookmarks, notes and topic statuses on this device. There is no mastery score, streak or rank estimate here, because none of that could be true yet."
      />
      {study.status === "unavailable" && (
        <div className="notice warning" role="alert">
          <AlertTriangle size={19} />
          <p>
            <strong>Progress can’t be read right now.</strong>{" "}
            {study.storageError?.message} Nothing is estimated or filled in.
          </p>
        </div>
      )}
      {study.status === "loading" && (
        <div className="loading" role="status">
          Loading your saved study data…
        </div>
      )}
      {study.droppedRecords > 0 && (
        <div className="notice warning" role="alert">
          <AlertTriangle size={19} />
          <p>
            <strong>
              {study.droppedRecords} stored record(s) were skipped.
            </strong>{" "}
            They did not match this version’s data format. Export before
            resetting if you want a copy of the raw data.
          </p>
        </div>
      )}
      {empty ? (
        <div className="empty">
          <Target size={36} />
          <h2>No study activity saved yet.</h2>
          <p>
            Mark a syllabus topic as <strong>Studying</strong> or{" "}
            <strong>Revised</strong>, bookmark a question, or write a note. This
            page fills in from that real activity only.
          </p>
          <div className="empty-actions">
            <Link to="/syllabus" className="button primary">
              Open the syllabus <ArrowRight size={15} />
            </Link>
            <Link to="/papers" className="button secondary">
              Browse papers
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="metric-grid">
            <div className="stat-card">
              <span className="stat-icon">
                <Bookmark size={18} />
              </span>
              <strong>{study.snapshot.bookmarks.length}</strong>
              <span>Bookmarked questions</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <StickyNote size={18} />
              </span>
              <strong>{study.snapshot.notes.length}</strong>
              <span>Notes written</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <Target size={18} />
              </span>
              <strong>{counts.studying}</strong>
              <span>Topics marked studying</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <Layers size={18} />
              </span>
              <strong>{counts.revised}</strong>
              <span>Topics marked revised</span>
            </div>
          </div>

          <section className="panel" aria-labelledby="subject-progress">
            <div className="panel-head">
              <h2 id="subject-progress">Topic status by subject</h2>
              <Link to="/syllabus" className="text-link">
                Set statuses <ArrowRight size={14} />
              </Link>
            </div>
            <p className="panel-note">
              Self-reported, from the repository’s 2026 syllabus summary. “Not
              started” is simply every topic group without a saved status.
            </p>
            <ul className="progress-list">
              {subjects.map((subject) => {
                const ids = subject.topics.map((topic) => topic.id);
                const subjectCounts = statusCounts(study.snapshot.topics, ids);
                const subjectNotStarted =
                  ids.length - subjectCounts.studying - subjectCounts.revised;
                return (
                  <li key={subject.id}>
                    <div className="progress-head">
                      <strong>{subject.short}</strong>
                      <span>
                        {subjectCounts.revised} revised ·{" "}
                        {subjectCounts.studying} studying · {subjectNotStarted}{" "}
                        not started
                      </span>
                    </div>
                    <div
                      className="progress-bar"
                      role="img"
                      aria-label={`${subject.short}: ${subjectCounts.revised} of ${ids.length} topic groups revised, ${subjectCounts.studying} studying, ${subjectNotStarted} not started`}
                    >
                      <span
                        className="revised"
                        style={{
                          width: `${(subjectCounts.revised / ids.length) * 100}%`,
                        }}
                      />
                      <span
                        className="studying"
                        style={{
                          width: `${(subjectCounts.studying / ids.length) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel" aria-labelledby="reading-history">
            <div className="panel-head">
              <h2 id="reading-history">
                <Clock size={18} /> Recently opened
              </h2>
              <span>{study.snapshot.history.length} saved visits</span>
            </div>
            {recent.length ? (
              <ul className="history-list">
                {recent.map((entry) => {
                  const paper = papers.find(
                    (candidate) => String(candidate.year) === entry.targetId,
                  );
                  const label =
                    entry.kind === "paper" && paper
                      ? `JELET ${paper.year} question paper`
                      : entry.kind === "paper"
                        ? `JELET ${entry.targetId} (not in the library)`
                        : "Syllabus explorer";
                  return (
                    <li key={entry.entryId}>
                      <BookOpen size={16} />
                      <div>
                        <strong>{label}</strong>
                        <span>{formatDateTime(entry.at)}</span>
                      </div>
                      {entry.kind === "paper" && paper ? (
                        <Link
                          to={`/papers/${paper.year}`}
                          className="text-link"
                        >
                          Reopen <ArrowRight size={14} />
                        </Link>
                      ) : (
                        <Link to="/syllabus" className="text-link">
                          Reopen <ArrowRight size={14} />
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="muted panel-empty">
                No papers opened on this device yet.
              </p>
            )}
            <p className="panel-note">
              Only the most recent {study.snapshot.history.length} visits are
              kept (up to 60). Reading history is not practice performance.
            </p>
          </section>

          <section className="panel" aria-labelledby="practice-status">
            <div className="panel-head">
              <h2 id="practice-status">Practice results</h2>
            </div>
            <p>
              No scored practice exists yet, so there are no attempts, marks or
              accuracy figures to show. Scoring needs verified answer keys,
              which this project does not have. Attempt history becomes real
              with the practice phase; nothing is simulated here.
            </p>
          </section>
        </>
      )}
    </>
  );
}
