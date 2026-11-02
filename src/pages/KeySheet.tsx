import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";
import { papers } from "../content";
import { formatAnswer, keyFor, paperKeys } from "../keys";
import { Badge, Link, PageHeading, SourceLink } from "../ui";

const SECTIONS: { label: string; from: number; to: number }[] = [
  { label: "Mathematics · Category-I", from: 1, to: 30 },
  { label: "Mathematics · Category-II", from: 31, to: 40 },
  { label: "Physics · Category-I", from: 41, to: 65 },
  { label: "Physics · Category-II", from: 66, to: 70 },
  { label: "Chemistry · Category-I", from: 71, to: 85 },
  { label: "Chemistry · Category-II", from: 86, to: 90 },
  { label: "Electrical & Electronics · Category-I", from: 91, to: 100 },
];

function YearPicker() {
  const years = [...paperKeys.keys()].sort((a, b) => b - a);
  return (
    <>
      <PageHeading
        eyebrow="OFFICIAL SOURCES"
        title="Answer keys"
        description="Final answer keys published by the West Bengal Joint Entrance Examinations Board, transcribed question by question. Nothing here is derived or guessed."
      />
      <div className="key-list">
        {years.map((year) => {
          const key = keyFor(year)!;
          const bundled = papers.some((p) => p.year === year);
          return (
            <Link key={year} to={`/keys/${year}`} className="key-card">
              <div>
                <div className="eyebrow">JELET {year} · PAPER I</div>
                <h2>
                  {key.entries.length} answers
                  {key.voided.length > 0 && (
                    <span className="muted"> · {key.voided.length} voided</span>
                  )}
                </h2>
                <p className="muted">
                  {key.documentRef} · {key.documentDate}
                </p>
              </div>
              <div className="key-card-meta">
                <Badge>Official</Badge>
                {key.mappedToBooklet ? (
                  <Badge tone="neutral">Set {key.set}</Badge>
                ) : (
                  <Badge tone="orange">No booklet</Badge>
                )}
                {!bundled && <span className="muted">paper not bundled</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default function KeySheet({ year }: { year: number | null }) {
  if (year === null) return <YearPicker />;
  const key = keyFor(year);
  if (!key)
    return (
      <div className="empty">
        <AlertTriangle size={34} />
        <h1>No official key for {year}.</h1>
        <p>
          The board has not published one, and none is derived for this year.
        </p>
        <Link to="/keys" className="button primary">
          <ArrowLeft size={16} /> All keys
        </Link>
      </div>
    );

  const bundled = papers.some((p) => p.year === year);

  return (
    <>
      <Link to="/keys" className="reader-breadcrumb">
        <ArrowLeft size={15} /> All keys
      </Link>
      <PageHeading
        eyebrow={`OFFICIAL · ${key.documentRef}`}
        title={`JELET ${year} Paper-I answer key`}
        description={`Final key issued by WBJEEB on ${key.documentDate}, transcribed from ${key.sourceTable}.`}
      />

      <div className="notice">
        <ShieldCheck size={19} />
        <p>
          <strong>
            {key.mappedToBooklet
              ? `Booklet numbering: Set ${key.set}.`
              : "Not yet mapped to a booklet."}
          </strong>{" "}
          {key.mappedToBooklet
            ? "Each question keeps the board's own number, so the answers below apply directly to the printed booklet. The set was confirmed by solving questions from the booklet and matching them against all four candidate columns."
            : "No booklet was supplied to match against, so these answers are in the board's master order and have not been verified against a printed paper."}
          {!bundled &&
            " The question paper for this year is not bundled in this app, so answers cannot be opened alongside their questions here — use the official PDF."}
        </p>
        <SourceLink href={`https://wbjeeb.nic.in`}>WBJEEB</SourceLink>
      </div>

      {SECTIONS.map((section) => {
        const rows = key.entries.filter(
          (e) => e.q >= section.from && e.q <= section.to,
        );
        return (
          <section key={section.label} className="key-section">
            <h2>{section.label}</h2>
            <div className="key-grid">
              {rows.map((entry) => (
                <div
                  key={entry.q}
                  className={"key-cell" + (entry.voided ? " is-void" : "")}
                >
                  <span className="key-q">{entry.q}</span>
                  <span className="key-a">{formatAnswer(entry)}</span>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {key.voided.length > 0 && (
        <section className="key-foot">
          <h2>Voided by the board</h2>
          <p>
            {key.voided.map((q) => `Q${q}`).join(", ")} — the board withdrew
            these questions. No option is correct and every candidate was
            awarded the marks. They are shown as <em>Void</em> rather than
            scored.
          </p>
        </section>
      )}
    </>
  );
}
