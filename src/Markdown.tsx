import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import katex from "katex";
import "katex/dist/katex.min.css";
export function renderMarkdown(source: string) {
  const math: string[] = [];
  const protectedText = source.replace(
    /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|(?<!\$)\$([^$\n]+)\$(?!\$)/g,
    (_all, a, b, c, d) => {
      const formula = a ?? b ?? c ?? d;
      let html = "";
      try {
        html = katex.renderToString(formula, {
          displayMode: a !== undefined || b !== undefined,
          throwOnError: true,
          trust: false,
          strict: "ignore",
          output: "htmlAndMathml",
        });
      } catch {
        html = `<span class="math-fallback">Equation could not be rendered: ${formula.replace(/[&<>"']/g, (c: string) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)}</span>`;
      }
      return `JELETMATHTOKEN${math.push(html) - 1}END`;
    },
  );
  let html = marked.parse(protectedText, {
    async: false,
    breaks: true,
  }) as string;
  html = html.replace(
    /JELETMATHTOKEN(\d+)END/g,
    (_, n) => math[Number(n)] || "",
  );
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true, mathMl: true },
    ADD_ATTR: ["target"],
  });
}
export default function Markdown({ text }: { text: string }) {
  const html = useMemo(() => renderMarkdown(text), [text]);
  return (
    <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
