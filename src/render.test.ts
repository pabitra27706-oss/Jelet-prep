// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./Markdown";
import { parsePaper } from "./content";
const corpus = import.meta.glob("../pyq-md/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
describe("safe maths rendering", () => {
  it("removes executable HTML and javascript links", () => {
    const html = renderMarkdown(
      '<script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)">bad</a>',
    );
    expect(html).not.toMatch(/<script|onerror|javascript:/);
  });
  it("preserves matrices, cases and vector equations", () => {
    for (const formula of [
      "\\(\\begin{bmatrix}1 & 2\\\\3 & 4\\end{bmatrix}\\)",
      "\\(\\vec{a} \\times \\vec{b}\\)",
      "\\[\\begin{cases}x & x>0\\\\0 & x=0\\end{cases}\\]",
    ]) {
      const html = renderMarkdown(formula);
      expect(html).toContain("katex");
      expect(html).not.toContain("could not be rendered");
    }
  });
  it("provides readable fallback for unsupported formula", () =>
    expect(renderMarkdown("\\(\\nonexistentcommand{x}\\)")).toContain(
      "Equation could not be rendered",
    ));
  it("renders every extracted question without throwing or exposing raw math tokens", () => {
    for (const raw of Object.values(corpus))
      for (const q of parsePaper(raw).questions) {
        expect(renderMarkdown(q.text)).not.toContain("JELETMATHTOKEN");
      }
  });
});
