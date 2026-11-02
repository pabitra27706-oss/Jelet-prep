export const archive = "https://wbjeeb.nic.in/jelet-old-question-papers/";
export const bulletin =
  "https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/2026/03/20260318287108702.pdf";
const pdfRoot =
  "https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/";
export const papers = [
  {
    year: 2025,
    era: "Recent format",
    missing: [],
    note: "All 100 question numbers present. Diagram placeholders remain.",
    source: pdfRoot + "2025/12/202512161802442791.pdf",
  },
  {
    year: 2024,
    era: "Recent format",
    missing: [60, 61, 62],
    note: "Questions 60–62 are missing. Some equations and diagrams are not reproduced.",
    source: pdfRoot + "2024/12/2024120234.pdf",
  },
  {
    year: 2022,
    era: "Recent format",
    missing: [86, 87, 88, 89, 90],
    note: "Questions 86–90 are missing. Some image-based content is not reproduced.",
    source: pdfRoot + "2023/11/2023111591-3.pdf",
  },
  {
    year: 2021,
    era: "Historical format",
    missing: [],
    note: "Historical syllabus. Diagrams/options may be incomplete; compare the original.",
    source: pdfRoot + "2023/11/2023111536-1.pdf",
  },
  {
    year: 2019,
    era: "Historical format",
    missing: [78, 79],
    note: "Questions 78–79 are missing. Year conflict: this file is named 2019 but its internal title says 2018. Identity is unverified.",
    source: archive,
  },
  {
    year: 2018,
    era: "Historical format",
    missing: [],
    note: "Historical syllabus. Diagrams/options may be incomplete; compare the original.",
    source: archive,
  },
  {
    year: 2017,
    era: "Historical format",
    missing: [],
    note: "Historical syllabus. Diagrams/options may be incomplete; compare the original.",
    source: archive,
  },
];
export type Paper = (typeof papers)[number];
export interface Question {
  number: number;
  text: string;
  section: string;
  warning: boolean;
}
export function parsePaper(raw: string) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const questions: Question[] = [];
  let section = "Question paper";
  let current: Question | undefined;
  let intro = "";
  for (const line of lines) {
    // Ignore only orphan enclosing fences; retain real programming-code fences.
    if (line === "```" && !current) continue;
    if (/^#{2,3} /.test(line)) {
      section = line.replace(/^#+ /, "");
      current = undefined;
      continue;
    }
    const match = line.match(/^(?:\*\*(\d+)\.\*\*|(\d+)\.)\s+(.*)/);
    if (match) {
      current = {
        number: Number(match[1] || match[2]),
        text: match[3],
        section,
        warning: false,
      };
      questions.push(current);
    } else if (current) {
      current.text += "\n" + line;
    } else {
      intro += "\n" + line;
    }
  }
  for (const q of questions) {
    // Remove editorial end matter, not question text or programming examples.
    q.text = q.text
      .replace(/\n(?:\*\*)?(?:End of Question Paper|Note:)[\s\S]*$/i, "")
      .replace(/\n---\s*$/, "")
      .trim();
    // Several older files have one orphan final fence after the end marker.
    q.warning =
      /\[(?:diagram|figure|equation|image)|not reproduced|not provided|missing|as image|shown in (?:the )?figure/i.test(
        q.text,
      );
  }
  return { questions, intro };
}
export function missingNumbers(questions: Question[]) {
  return Array.from({ length: 100 }, (_, i) => i + 1).filter(
    (n) => !questions.some((q) => q.number === n),
  );
}
export function filterPapers(query: string, era: string) {
  return papers.filter(
    (p) =>
      (era === "all" || p.era === era) &&
      `${p.year} ${p.era} Engineering Technology Paper I PYQ ${p.note}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
}
export interface Topic {
  title: string;
  body: string;
}
export interface Subject {
  name: string;
  short: string;
  color: string;
  topics: Topic[];
}
export function parseSyllabus(raw: string): Subject[] {
  const detail =
    raw.split("## 📖 Detailed Syllabus")[1]?.split("## 🔑")[0] || "";
  return detail
    .split(/^### /m)
    .slice(1)
    .map((block, i) => {
      const [title, ...rest] = block.split("\n");
      const body = rest
        .join("\n")
        .replace(/\n---\s*$/, "")
        .trim();
      let topics: Topic[] = [];
      if (body.startsWith("**")) {
        const parts = body.split(/\n(?=\*\*[A-Z]\. )/);
        topics = parts.filter(Boolean).map((p) => {
          const m = p.match(/^\*\*(.*?)\*\*\s*([\s\S]*)/);
          return { title: m?.[1] || "Topic", body: m?.[2] || p };
        });
      } else {
        topics = body
          .split("\n")
          .filter((l) => l.startsWith("- **"))
          .map((p) => {
            const m = p.match(/^- \*\*(.*?)\*\*\s*([\s\S]*)/);
            return {
              title: (m?.[1] || "Topic").replace(/:$/, ""),
              body: m?.[2] || p,
            };
          });
      }
      return {
        name: title.replace(/^\d+\. /, "").trim(),
        short: [
          "Mathematics",
          "Physics",
          "Chemistry",
          "Electrical & Electronics",
        ][i],
        color: ["green", "blue", "orange", "purple"][i],
        topics,
      };
    });
}
const files = import.meta.glob("../pyq-md/*.md", {
  query: "?raw",
  import: "default",
});
export async function loadPaper(year: number): Promise<string> {
  const loader = files[`../pyq-md/${year}.md`];
  if (!loader) throw new Error("This paper is not in the library.");
  return (await loader()) as string;
}
