import { paperFromQuestionId, papers } from "../content";
import { Link } from "../ui";

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Human label for a stored question reference, honest about stale papers. */
export function describeQuestion(questionId: string) {
  const parsed = paperFromQuestionId(questionId);
  if (!parsed) return { label: "Unknown question", year: null, number: null };
  const paper = papers.find((entry) => entry.year === parsed.year);
  if (!paper)
    return {
      label: `${parsed.year} paper (no longer in the library)`,
      year: parsed.year,
      number: parsed.number,
    };
  return {
    label: `JELET ${parsed.year} · Question ${parsed.number}`,
    year: parsed.year,
    number: parsed.number,
  };
}

export function QuestionLink({
  questionId,
  className = "",
}: {
  questionId: string;
  className?: string;
}) {
  const described = describeQuestion(questionId);
  if (described.year === null || described.number === null)
    return <span className={className}>{described.label}</span>;
  return (
    <Link
      to={`/papers/${described.year}?q=${described.number}`}
      className={className}
    >
      {described.label}
    </Link>
  );
}

export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
