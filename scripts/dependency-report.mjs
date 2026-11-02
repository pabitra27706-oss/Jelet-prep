import fs from "node:fs";
import { execFileSync } from "node:child_process";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
let text =
  "# Dependency register\n\nChecked 2026-11-02 via installed package manifests and npm registry metadata. Registry modification dates are activity signals, not code-quality/security guarantees. Exact resolved versions are in package-lock.json. No root repository licence is selected by this register.\n\n| Package | Installed version | Licence (manifest) | Registry modified | Use |\n| --- | --- | --- | --- | --- |\n";
for (const [name, type] of [
  ...Object.keys(pkg.dependencies).map((n) => [n, "Runtime"]),
  ...Object.keys(pkg.devDependencies).map((n) => [n, "Development/test"]),
]) {
  const p = JSON.parse(
    fs.readFileSync(`node_modules/${name}/package.json`, "utf8"),
  );
  const modified = execFileSync("npm", ["view", name, "time.modified"], {
    encoding: "utf8",
  }).trim();
  text += `| [${name}](https://www.npmjs.com/package/${name}) | ${p.version} | ${p.license || "See upstream"} | ${modified} | ${type} |\n`;
}
text +=
  "\n## Reuse decisions\n- DEPEND: React/React DOM for the real app; Vite/TypeScript for builds; Lucide for one consistent icon set.\n- DEPEND: marked + DOMPurify for sanitized repository Markdown; KaTeX for locally bundled maths/fonts. Corpus rendering tests exercise all extracted questions; unsupported syntax remains a visible fallback, not a silent correction.\n- STUDY/DEFER: IndexedDB adapter and service-worker tooling belong to later phases. No ads/billing SDK.\n- ADAPT: existing Markdown is preserved verbatim on disk; runtime parsing splits question entries and removes editorial end matter. Raw files and older HTML reader are not deleted.\n- BUILD: thin routing, corpus parser, metadata filters and accessible production layouts; no external UI template.\n\n## Licence notices and scope\nInstalled package LICENSE/NOTICE files remain authoritative, including transitive packages. KaTeX fonts have their own bundled notices (SIL OFL); Lucide icon assets include upstream icon-licence terms beyond the React package manifest. DOMPurify offers MPL-2.0 OR Apache-2.0. Chromium is test-only and has upstream Chromium/third-party notices; the wrapper MIT licence is not the browser licence. Preserve required upstream notices when publishing a distributable. This register is not a completed legal review of exam content or a grant of redistribution rights.\n";
fs.writeFileSync("docs/DEPENDENCIES.md", text);
