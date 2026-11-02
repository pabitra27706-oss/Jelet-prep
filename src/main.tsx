import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
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
  ExternalLink,
  AlertTriangle,
  SlidersHorizontal,
  RotateCcw,
  Compass,
  Info,
} from "lucide-react";
import {
  papers,
  filterPapers,
  loadPaper,
  parsePaper,
  parseSyllabus,
  missingNumbers,
  archive,
  bulletin,
} from "./content";
import syllabus from "../syllabus.md?raw";
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
function Link({
  to,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  return (
    <a href={"#" + to} {...props}>
      {children}
    </a>
  );
}
function SourceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="source-link"
    >
      {children}
      <ExternalLink size={14} />
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}
function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={"badge " + tone}>{children}</span>;
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
        : path === "/syllabus"
          ? "Syllabus explorer"
          : path === "/about"
            ? "Sources & transparency"
            : "Your study space";
  useEffect(() => {
    document.title = `${title} · JELET Prep`;
  }, [title]);
  const nav = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/papers", label: "Question library", icon: Library },
    { to: "/syllabus", label: "Syllabus explorer", icon: Layers },
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
          {path === "/" ? (
            <Home />
          ) : path === "/papers" ? (
            <PaperLibrary route={route} />
          ) : path.startsWith("/papers/") ? (
            <Reader key={path} year={Number(path.split("/")[2])} />
          ) : path === "/syllabus" ? (
            <Syllabus />
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
function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
function Reader({ year }: { year: number }) {
  const paper = papers.find((p) => p.year === year);
  const [data, setData] = useState<ReturnType<typeof parsePaper> | null>(null);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState<number | null>(null);
  const [font, setFont] = useState(18);
  const [qSearch, setQSearch] = useState("");
  const article = useRef<HTMLElement>(null);
  useEffect(() => {
    let alive = true;
    setError("");
    setData(null);
    if (!paper) return;
    loadPaper(year)
      .then((raw) => {
        if (alive) {
          const parsed = parsePaper(raw);
          setData(parsed);
          const q = Number(
            new URLSearchParams(location.hash.split("?")[1]).get("q"),
          );
          setCurrent(
            parsed.questions.some((x) => x.number === q)
              ? q
              : (parsed.questions[0]?.number ?? null),
          );
        }
      })
      .catch(() => {
        if (alive)
          setError("We couldn’t load this transcription. Please retry.");
      });
    return () => {
      alive = false;
    };
  }, [year, paper]);
  function choose(n: number) {
    setCurrent(n);
    history.replaceState(null, "", `#/papers/${year}?q=${n}`);
    article.current?.scrollIntoView({ behavior: "instant", block: "start" });
    article.current?.focus();
  }
  if (!paper)
    return (
      <div className="empty">
        <FileText size={35} />
        <h1>That paper is not in this collection.</h1>
        <Link to="/papers" className="button primary">
          Back to library
        </Link>
      </div>
    );
  const question = data?.questions.find((q) => q.number === current),
    index = data?.questions.findIndex((q) => q.number === current) ?? 0;
  const missing = data ? missingNumbers(data.questions) : paper.missing;
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
                    className={q.number === current ? "selected" : ""}
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
const subjects = parseSyllabus(syllabus);
function Syllabus() {
  const route = useRoute();
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
          topics.map((t) => (
            <details key={t.title} className="topic">
              <summary>
                <span className="topic-number">
                  {String(subject.topics.indexOf(t) + 1).padStart(2, "0")}
                </span>
                <span>{t.title}</span>
                <span className="topic-plus">+</span>
              </summary>
              <div className="topic-body">
                <Suspense fallback={<p>Loading…</p>}>
                  <Markdown text={t.body} />
                </Suspense>
              </div>
            </details>
          ))
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
            No accounts, advertising or analytics have been added. Theme
            preference is saved locally when browser storage is available. This
            release does not save study progress and does not promise offline
            availability.
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
    <App />
  </React.StrictMode>,
);
