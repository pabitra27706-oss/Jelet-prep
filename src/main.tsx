import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  Bookmark,
  LayoutDashboard,
  Library,
  Layers,
  ArrowUpRight,
  ArrowRight,
  Search,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Sun,
  Moon,
  ShieldCheck,
  FileText,
  GraduationCap,
  AlertTriangle,
  SlidersHorizontal,
  RotateCcw,
  Compass,
  Info,
  ChartNoAxesColumn,
  Settings as SettingsIcon,
  Database,
  Circle,
  LoaderCircle,
} from "lucide-react";
import { papers, filterPapers, archive, bulletin } from "./content";
import { subjects } from "./syllabus-data";
import Reader from "./Reader";
import KeySheet from "./pages/KeySheet";
import Saved from "./pages/Saved";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import { StudyProvider, useStudy } from "./study/StudyProvider";
import { Badge, Link, PageHeading, SaveStatus, SourceLink } from "./ui";
import type { TopicStatus } from "./study/records";
import "./style.css";
const Markdown = lazy(() => import("./Markdown"));
function useRoute() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/");
  useEffect(() => {
    const change = () => setRoute(location.hash.slice(1) || "/");
    addEventListener("hashchange", change);
    return () => removeEventListener("hashchange", change);
  }, []);
  return route;
}
function App() {
  const route = useRoute(),
    path = route.split("?")[0];
  const [mobile, setMobile] = useState(false);
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("jelet-theme") === "dark";
    } catch {
      return false;
    }
  });
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("jelet-theme", dark ? "dark" : "light");
    } catch {
      /* Theme still works for the session. */
    }
  }, [dark]);
  useEffect(() => {
    setMobile(false);
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [path]);
  const title =
    path === "/papers"
      ? "Question library"
      : path.startsWith("/papers/")
        ? "Paper reader"
        : path.startsWith("/keys")
          ? "Answer keys"
          : path === "/syllabus"
            ? "Syllabus explorer"
            : path === "/saved"
              ? "Saved & notes"
              : path === "/progress"
                ? "Your progress"
                : path === "/settings"
                  ? "Backup & settings"
                  : path === "/about"
                    ? "Sources & transparency"
                    : "Your study space";
  useEffect(() => {
    document.title = `${title} · JELET Prep`;
  }, [title]);
  const nav = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/papers", label: "Question library", icon: Library },
    { to: "/keys", label: "Answer keys", icon: ShieldCheck },
    { to: "/syllabus", label: "Syllabus explorer", icon: Layers },
    { to: "/saved", label: "Saved & notes", icon: Bookmark },
    { to: "/progress", label: "Your progress", icon: ChartNoAxesColumn },
    { to: "/settings", label: "Backup & settings", icon: SettingsIcon },
  ];
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus({ preventScroll: true });
        }}
      >
        Skip to content
      </a>
      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <Link to="/" className="brand">
          <span className="brand-icon">
            <GraduationCap size={25} />
          </span>
          <span>
            JELET<span className="brand-light">prep</span>
            <small>THE NEXT CHAPTER</small>
          </span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        >
          <X />
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.map(({ to, label, icon: Icon }) => (
            <React.Fragment key={to}>
              {to === "/saved" && (
                <div className="nav-label nav-label-inline">YOUR STUDY</div>
              )}
              <Link
                key={to}
                to={to}
                className={
                  "nav-link " +
                  ((to === "/" ? path === "/" : path.startsWith(to))
                    ? "active"
                    : "")
                }
                aria-current={
                  (to === "/" ? path === "/" : path.startsWith(to))
                    ? "page"
                    : undefined
                }
              >
                <Icon size={19} />
                {label}
                {to === "/papers" && <span className="nav-count">07</span>}
              </Link>
            </React.Fragment>
          ))}
        </nav>
        <div className="sidebar-note">
          <div className="note-icon">
            <Compass size={22} />
          </div>
          <strong>Small steps. Big possibilities.</strong>
          <p>
            Your diploma is the beginning.
            <br />
            Build what comes next.
          </p>
          <Link to="/syllabus">
            Explore the syllabus <ArrowRight size={15} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <Link
            to="/about"
            className={"nav-link " + (path === "/about" ? "active" : "")}
          >
            <ShieldCheck size={18} />
            Sources & transparency
          </Link>
          <div className="sidebar-footer">
            <span className="status-dot" />
            Made for West Bengal students
          </div>
        </div>
      </aside>
      <div className="app">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button menu-toggle"
              aria-label="Open navigation"
              aria-expanded={mobile}
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{title}</strong>
          </div>
          <div className="header-right">
            <span className="header-tag">
              <span className="status-dot" />
              Independent study resource
            </span>
            <button
              className="icon-button theme-button"
              onClick={() => setDark((v) => !v)}
              aria-label={
                dark ? "Switch to light theme" : "Switch to dark theme"
              }
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} ref={main}>
          <StorageBanner />
          {path === "/" ? (
            <Home />
          ) : path === "/papers" ? (
            <PaperLibrary route={route} />
          ) : path.startsWith("/keys") ? (
            <KeySheet
              year={path.split("/")[2] ? Number(path.split("/")[2]) : null}
            />
          ) : path.startsWith("/papers/") ? (
            <Reader key={path} year={Number(path.split("/")[2])} />
          ) : path === "/syllabus" ? (
            <Syllabus />
          ) : path === "/saved" ? (
            <Saved />
          ) : path === "/progress" ? (
            <Progress />
          ) : path === "/settings" ? (
            <Settings />
          ) : path === "/about" ? (
            <About />
          ) : (
            <div className="empty">
              <Compass size={40} />
              <h1>This page took a different path.</h1>
              <p>Let’s get you back to the library.</p>
              <Link to="/papers" className="button primary">
                Browse papers <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </main>
        <footer className="footer">
          <span>
            JELETprep <span className="footer-divider">/</span> A little
            progress, every day.
          </span>
          <Link to="/about">
            Independent resource. Not affiliated with WBJEEB.{" "}
            <ArrowUpRight size={13} />
          </Link>
        </footer>
      </div>
    </>
  );
}
function StorageBanner() {
  const study = useStudy();
  if (study.status !== "unavailable") return null;
  return (
    <div className="notice warning" role="alert">
      <AlertTriangle size={19} />
      <p>
        <strong>This browser is blocking local storage.</strong>{" "}
        {study.storageError?.message} Reading works, but bookmarks, notes,
        progress and backups are unavailable in this session.{" "}
        <Link to="/settings">See storage details</Link>.
      </p>
    </div>
  );
}

function WorkspaceSummary() {
  const study = useStudy();
  const positions = [...study.snapshot.positions].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const latest = positions[0];
  const latestPaper = latest
    ? papers.find((paper) => `jelet-et-p1-${paper.year}` === latest.paperId)
    : undefined;
  const revised = study.snapshot.topics.filter(
    (record) => record.status === "revised",
  ).length;
  const studying = study.snapshot.topics.filter(
    (record) => record.status === "studying",
  ).length;
  const empty =
    study.snapshot.bookmarks.length === 0 &&
    study.snapshot.notes.length === 0 &&
    study.snapshot.topics.length === 0;

  return (
    <section className="workspace-card" aria-labelledby="workspace-heading">
      <div className="workspace-head">
        <div>
          <span className="eyebrow">YOUR STUDY WORKSPACE</span>
          <h2 id="workspace-heading">Saved on this device</h2>
        </div>
        <Link to="/progress" className="text-link">
          See progress <ArrowRight size={15} />
        </Link>
      </div>
      {study.status === "loading" ? (
        <p className="muted workspace-loading" role="status">
          <LoaderCircle size={16} /> Loading your saved study data…
        </p>
      ) : study.status === "unavailable" ? (
        <p className="muted">
          Study data can’t be read because this browser is blocking local
          storage. Nothing below is estimated.
        </p>
      ) : empty ? (
        <div className="workspace-empty">
          <Bookmark size={22} />
          <p>
            Nothing saved yet. Bookmark a question, write a note, or mark a
            syllabus topic as studying — it will stay here after you reload.
          </p>
          <div className="empty-actions">
            <Link to="/papers" className="button primary">
              Browse papers
            </Link>
            <Link to="/syllabus" className="button secondary">
              Open syllabus
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="workspace-stats">
            <Link to="/saved" className="workspace-stat">
              <Bookmark size={17} />
              <strong>{study.snapshot.bookmarks.length}</strong>
              <span>Bookmarks</span>
            </Link>
            <Link to="/saved" className="workspace-stat">
              <FileText size={17} />
              <strong>{study.snapshot.notes.length}</strong>
              <span>Notes</span>
            </Link>
            <Link to="/progress" className="workspace-stat">
              <Circle size={17} />
              <strong>{studying}</strong>
              <span>Studying</span>
            </Link>
            <Link to="/progress" className="workspace-stat">
              <ShieldCheck size={17} />
              <strong>{revised}</strong>
              <span>Revised</span>
            </Link>
          </div>
          {latestPaper && latest && (
            <div className="resume-row">
              <span>
                <BookOpen size={16} /> Continue reading JELET {latestPaper.year}
                , question {latest.questionNumber}
              </span>
              <Link
                to={`/papers/${latestPaper.year}?q=${latest.questionNumber}`}
                className="button secondary"
              >
                Resume <ChevronRight size={15} />
              </Link>
            </div>
          )}
          <p className="workspace-foot">
            Stored in this browser only.{" "}
            <Link to="/settings">Export a backup</Link> before clearing browser
            data.
          </p>
        </>
      )}
    </section>
  );
}

function Home() {
  return (
    <>
      <div className="page-intro">
        <div>
          <div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>
            Big ambitions.
            <br />
            One question at a time<span className="accent">.</span>
          </h1>
          <p>
            A focused space for your JELET preparation.
            <br className="desktop-break" /> Explore the syllabus, revisit past
            papers, and build your understanding.
          </p>
        </div>
        <div className="intro-mark" aria-hidden="true">
          <GraduationCap size={38} />
          <span>
            DIPLOMA TODAY.
            <br />
            <b>ENGINEER TOMORROW.</b>
          </span>
        </div>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-label">
            <span />
            YOUR PREPARATION, SIMPLIFIED
          </div>
          <h2>
            The next step in your
            <br />
            engineering journey.
          </h2>
          <p>
            Seven years of question papers. Four core subjects.
            <br />
            One place to make sense of it all.
          </p>
          <Link to="/papers" className="button cream">
            Explore question papers <ArrowUpRight size={18} />
          </Link>
          <div className="hero-foot">
            <ShieldCheck size={15} />
            Source-linked. Honestly labelled. Free to explore.
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-star">✳</div>
          <div className="floating-label">
            <span className="art-small-icon">
              <BookOpen size={17} />
            </span>
            Knowledge opens doors.
          </div>
          <div className="book book-back" />
          <div className="book book-front">
            <span>
              YOUR
              <br />
              NEXT
              <br />
              <i>chapter.</i>
            </span>
            <div className="book-rule" />
            <small>JELET PREPARATION</small>
          </div>
          <div className="art-caption">
            FROM POSSIBILITY
            <br />
            TO PROGRESS ↗
          </div>
        </div>
      </section>
      <div className="metrics">
        <Metric
          icon={<Library />}
          value="07"
          label="Past papers"
          detail="2017–2025 collection"
        />
        <Metric
          icon={<Layers />}
          value="04"
          label="Core subjects"
          detail="2026 syllabus baseline"
        />
        <Metric
          icon={<BookOpen />}
          value="100"
          label="Questions numbered"
          detail="In the 2025 transcription"
        />
        <Metric
          icon={<ShieldCheck />}
          value="Source-first"
          label="Study with context"
          detail="Verification status on every paper"
        />
      </div>
      <WorkspaceSummary />
      <div className="section-heading">
        <div>
          <span className="eyebrow">FIND YOUR FOCUS</span>
          <h2>Where would you like to start?</h2>
        </div>
        <Link to="/syllabus" className="text-link">
          View full syllabus <ArrowRight size={16} />
        </Link>
      </div>
      <div className="subject-grid">
        {[
          {
            name: "Mathematics",
            sub: "Matrices, calculus, probability & more",
            n: "01",
            symbol: "ƒ(x)",
            color: "green",
          },
          {
            name: "Physics",
            sub: "Motion, energy, optics & more",
            n: "02",
            symbol: "↗",
            color: "blue",
          },
          {
            name: "Chemistry",
            sub: "Atoms, reactions, bonding & more",
            n: "03",
            symbol: "⚗",
            color: "orange",
          },
          {
            name: "Electrical & Electronics",
            sub: "Circuits, machines, digital logic & more",
            n: "04",
            symbol: "⌁",
            color: "purple",
          },
        ].map((s, i) => (
          <Link
            to={"/syllabus?subject=" + i}
            className={"subject-card " + s.color}
            key={s.name}
          >
            <div className="subject-top">
              <span className="subject-symbol">{s.symbol}</span>
              <span>{s.n}</span>
            </div>
            <h3>{s.name}</h3>
            <p>{s.sub}</p>
            <span className="subject-action">
              Explore topics <ArrowUpRight size={17} />
            </span>
          </Link>
        ))}
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">LEARN FROM WHAT CAME BEFORE</span>
          <h2>Inside the paper library</h2>
        </div>
        <Link to="/papers" className="text-link">
          All question papers <ArrowRight size={16} />
        </Link>
      </div>
      <div className="home-bottom">
        <div className="recent-list">
          {papers.slice(0, 3).map((p) => (
            <Link to={"/papers/" + p.year} className="recent-row" key={p.year}>
              <span className="paper-file">
                <FileText size={22} />
              </span>
              <div>
                <h3>JELET {p.year}</h3>
                <p>Engineering & Technology · Paper I</p>
              </div>
              <Badge tone={p.missing.length ? "orange" : "neutral"}>
                {p.missing.length ? "Known gaps" : "Transcription"}
              </Badge>
              <ArrowUpRight size={19} />
            </Link>
          ))}
        </div>
        <div className="trust-card">
          <ShieldCheck size={26} />
          <h3>Clarity over claims.</h3>
          <p>
            These are study transcriptions, not verified answer keys. We flag
            missing content and link you to official sources.
          </p>
          <Link to="/about" className="text-link">
            How to use this resource <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </>
  );
}
function Metric({
  icon,
  value,
  label,
  detail,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="metric">
      <span className="metric-icon">{icon}</span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        <small>{detail}</small>
      </div>
    </div>
  );
}
function PaperLibrary({ route }: { route: string }) {
  const params = new URLSearchParams(route.split("?")[1]);
  const query = params.get("q") || "",
    era = params.get("format") || "all";
  function update(key: string, value: string) {
    const p = new URLSearchParams(location.hash.split("?")[1]);
    if (value && value !== "all") p.set(key, value);
    else p.delete(key);
    location.replace("#/papers" + (p.size ? "?" + p : ""));
  }
  const filtered = filterPapers(query, era);
  return (
    <>
      <PageHeading
        eyebrow="THE QUESTION LIBRARY"
        title="Past papers. Fresh perspective."
        description="Get familiar with the questions that came before. Read at your pace, with the original source always a click away."
      />
      <div className="notice">
        <Info size={19} />
        <p>
          <strong>Reading resources, not scored mocks.</strong> All
          transcriptions await source verification. Some questions, diagrams or
          options are missing. Historical papers use a different syllabus.
        </p>
        <Link to="/about">
          Learn more <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="library-toolbar">
        <label className="search-field">
          <Search size={19} />
          <input
            value={query}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search by year, format or keyword…"
            aria-label="Search papers"
          />
          {query && (
            <button
              onClick={() => update("q", "")}
              className="icon-button"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </label>
        <label className="filter-field">
          <SlidersHorizontal size={17} />
          <span className="sr-only">Paper format</span>
          <select
            value={era}
            onChange={(e) => update("format", e.target.value)}
          >
            <option value="all">All formats</option>
            <option>Recent format</option>
            <option>Historical format</option>
          </select>
        </label>
      </div>
      <div className="results-line">
        <span aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "paper" : "papers"} in your
          library
        </span>
        <span>Newest first</span>
      </div>
      {filtered.length ? (
        <div className="paper-grid">
          {filtered.map((p) => (
            <article className="paper-card" key={p.year}>
              <div className="paper-card-top">
                <span className="paper-file">
                  <FileText size={24} />
                </span>
                <Badge
                  tone={
                    p.missing.length || p.year === 2019 ? "orange" : "neutral"
                  }
                >
                  {p.year === 2019
                    ? "Year conflict"
                    : p.missing.length
                      ? "Incomplete"
                      : "Not verified"}
                </Badge>
              </div>
              <div className="paper-year">{p.year}</div>
              <h2>JELET question paper</h2>
              <p className="paper-stream">
                Engineering & Technology{p.year >= 2022 ? " · Paper I" : ""}
              </p>
              <div className="paper-note">{p.note}</div>
              <div className="paper-meta">
                <span>{p.era}</span>
                <span>English</span>
              </div>
              <Link to={"/papers/" + p.year} className="button paper-button">
                Read paper <ArrowUpRight size={17} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <Search size={35} />
          <h2>No papers match your search.</h2>
          <p>Try a year such as 2024, or clear your filters.</p>
          <button
            className="button primary"
            onClick={() => location.replace("#/papers")}
          >
            <RotateCcw size={16} />
            Reset filters
          </button>
        </div>
      )}
    </>
  );
}
function TopicStatusControl({
  topic,
  subject,
}: {
  topic: { id: string; title: string };
  subject: { id: string };
}) {
  const study = useStudy();
  const stored = study.topicsById.get(topic.id);
  const [state, setState] = useState<{
    state: "idle" | "saving" | "saved" | "error";
    message?: string;
  }>({ state: "idle" });
  const ready = study.status === "ready";

  async function apply(status: TopicStatus | null) {
    setState({ state: "saving" });
    const outcome = status
      ? await study.updateTopicStatus(
          { topicId: topic.id, subjectId: subject.id, title: topic.title },
          status,
        )
      : await study.resetTopicStatus(topic.id);
    setState(
      outcome.ok
        ? { state: "saved" }
        : { state: "error", message: outcome.error },
    );
  }

  const options: { value: TopicStatus | null; label: string }[] = [
    { value: null, label: "Not started" },
    { value: "studying", label: "Studying" },
    { value: "revised", label: "Revised" },
  ];
  return (
    <div className="topic-status">
      <span className="topic-status-label" id={`status-${topic.id}`}>
        Your status
      </span>
      <div
        className="status-options"
        role="group"
        aria-labelledby={`status-${topic.id}`}
      >
        {options.map((option) => {
          const active = (stored?.status ?? null) === option.value;
          return (
            <button
              key={option.label}
              className={"status-option " + (active ? "active" : "")}
              aria-pressed={active}
              disabled={!ready || state.state === "saving"}
              onClick={() => void apply(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <SaveStatus state={state.state} message={state.message} />
      {!ready && study.status !== "loading" && (
        <span className="note-meta">
          Saving is unavailable in this browser.
        </span>
      )}
      <span className="note-meta">Kept on this device only</span>
    </div>
  );
}

function Syllabus() {
  const route = useRoute();
  const study = useStudy();
  const rawIndex = Number(
    new URLSearchParams(route.split("?")[1]).get("subject") || 0,
  );
  const active =
    Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex < subjects.length
      ? rawIndex
      : 0;
  const [search, setSearch] = useState("");
  const subject = subjects[active];
  const topics = subject.topics.filter((t) =>
    `${t.title} ${t.body}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="THE SYLLABUS EXPLORER"
        title="Know the ground. Find your focus."
        description="Break your preparation into smaller chapters. Explore the four subjects in the repository’s 2026 syllabus summary."
      />
      <div className="notice">
        <Info size={19} />
        <p>
          <strong>2026 reference, not a future-year promise.</strong> This is a
          condensed study summary, awaiting full line-by-line verification.
          Check the official bulletin for authoritative wording.
        </p>
        <SourceLink href={bulletin}>Official bulletin</SourceLink>
      </div>
      <div className="syllabus-tabs" aria-label="Syllabus subjects">
        {subjects.map((s, i) => (
          <Link
            key={s.name}
            to={"/syllabus?subject=" + i}
            className={active === i ? "selected" : ""}
            aria-current={active === i ? "page" : undefined}
          >
            <span>0{i + 1}</span>
            {s.short}
          </Link>
        ))}
      </div>
      <div className="syllabus-heading">
        <div>
          <h2>{subject.short}</h2>
          <p>{subject.topics.length} topic groups · Study summary</p>
        </div>
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Search syllabus topics"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a topic in this subject…"
          />
        </label>
      </div>
      <div className="topic-list">
        {topics.length ? (
          topics.map((t) => {
            const status = study.topicsById.get(t.id)?.status;
            return (
              <details key={t.id} className="topic">
                <summary>
                  <span className="topic-number">
                    {String(subject.topics.indexOf(t) + 1).padStart(2, "0")}
                  </span>
                  <span>{t.title}</span>
                  {status && (
                    <span className={"topic-status-chip " + status}>
                      {status === "studying" ? "Studying" : "Revised"}
                    </span>
                  )}
                  <span className="topic-plus">+</span>
                </summary>
                <div className="topic-body">
                  <Suspense fallback={<p>Loading…</p>}>
                    <Markdown text={t.body} />
                  </Suspense>
                  <TopicStatusControl topic={t} subject={subject} />
                </div>
              </details>
            );
          })
        ) : (
          <div className="empty">
            <Search />
            <h2>No topics found.</h2>
            <p>Try a broader keyword, or another subject.</p>
            <button className="button secondary" onClick={() => setSearch("")}>
              Clear search
            </button>
          </div>
        )}
      </div>
    </>
  );
}
function About() {
  return (
    <>
      <PageHeading
        eyebrow="SOURCES & TRANSPARENCY"
        title="Good preparation starts with trust."
        description="Here is what this resource contains, what it doesn’t, and how to use it responsibly."
      />
      <div className="about-grid">
        <section className="about-card">
          <ShieldCheck size={26} />
          <h2>Study material, with context.</h2>
          <p>
            JELETprep is an independent resource for West Bengal diploma
            students. We are not affiliated with WBJEEB. The seven papers are
            repository transcriptions, not authenticated reproductions or
            verified answer keys.
          </p>
          <p>
            We do not provide scores, full solutions, admission guarantees or
            rank predictions. Original sources take precedence over summaries.
          </p>
        </section>
        <section className="about-card">
          <Info size={26} />
          <h2>What the labels mean</h2>
          <ul className="label-list">
            <li>
              <Badge tone="neutral">Not verified</Badge>
              <span>
                Text has not been fully compared against the official original.
              </span>
            </li>
            <li>
              <Badge tone="orange">Incomplete</Badge>
              <span>
                Known missing question numbers; other missing diagrams/options
                may remain.
              </span>
            </li>
            <li>
              <Badge tone="orange">Year conflict</Badge>
              <span>
                The 2019 file internally says 2018. Its identity needs review.
              </span>
            </li>
          </ul>
        </section>
        <section className="about-card">
          <Library size={26} />
          <h2>Go to the source</h2>
          <p>
            Use original papers for diagrams and exact wording. Follow the
            latest Board notices for admissions and reservation rules.
          </p>
          <div className="source-list">
            <SourceLink href={archive}>
              WBJEEB question paper archive
            </SourceLink>
            <SourceLink href={bulletin}>
              JELET 2026 information bulletin
            </SourceLink>
            <SourceLink href="https://wbjeeb.nic.in/current-events-jelet/">
              Latest official JELET notices
            </SourceLink>
          </div>
        </section>
        <section className="about-card">
          <BookOpen size={26} />
          <h2>Privacy & limitations</h2>
          <p>
            No accounts, advertising or analytics have been added. Bookmarks,
            notes, topic statuses, reading positions and reading history are
            stored in this browser only — there is no server copy and no
            cross-device sync. Theme preference is stored separately. You can
            export, restore or clear study data on the{" "}
            <Link to="/settings">backup &amp; settings</Link> page. Offline
            downloads are still not promised.
          </p>
          <p>
            Opening an external source contacts that website. Content rights and
            complete source verification remain publication-review tasks.
          </p>
          <SourceLink href="https://github.com/pabitra27706-oss/Jelet-prep/issues">
            Report a content correction
          </SourceLink>
        </section>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StudyProvider>
      <App />
    </StudyProvider>
  </React.StrictMode>,
);
