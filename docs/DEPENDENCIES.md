# Dependency register

Checked 2026-11-02 via installed package manifests and npm registry metadata. Registry modification dates are activity signals, not code-quality/security guarantees. Exact resolved versions are in package-lock.json. No root repository licence is selected by this register.

| Package | Installed version | Licence (manifest) | Registry modified | Use |
| --- | --- | --- | --- | --- |
| [dompurify](https://www.npmjs.com/package/dompurify) | 3.4.17 | (MPL-2.0 OR Apache-2.0) | 2026-10-12T12:41:29.148Z | Runtime |
| [katex](https://www.npmjs.com/package/katex) | 0.19.1 | MIT | 2026-10-23T20:41:36.457Z | Runtime |
| [lucide-react](https://www.npmjs.com/package/lucide-react) | 1.66.0 | ISC | 2026-10-31T06:12:30.881Z | Runtime |
| [marked](https://www.npmjs.com/package/marked) | 18.1.2 | MIT | 2026-10-26T14:54:50.214Z | Runtime |
| [react](https://www.npmjs.com/package/react) | 19.3.1 | MIT | 2026-10-31T09:15:40.031Z | Runtime |
| [react-dom](https://www.npmjs.com/package/react-dom) | 19.3.1 | MIT | 2026-10-31T09:18:06.482Z | Runtime |
| [@axe-core/playwright](https://www.npmjs.com/package/@axe-core/playwright) | 4.14.0 | MPL-2.0 | 2026-10-30T01:45:41.013Z | Development/test |
| [@playwright/test](https://www.npmjs.com/package/@playwright/test) | 1.64.1 | Apache-2.0 | 2026-11-01T05:15:49.041Z | Development/test |
| [@sparticuz/chromium](https://www.npmjs.com/package/@sparticuz/chromium) | 153.0.0 | MIT | 2026-09-11T18:32:28.890Z | Development/test |
| [@types/katex](https://www.npmjs.com/package/@types/katex) | 0.16.8 | MIT | 2026-10-04T08:42:51.326Z | Development/test |
| [@types/react](https://www.npmjs.com/package/@types/react) | 19.3.0 | MIT | 2026-10-04T09:18:58.831Z | Development/test |
| [@types/react-dom](https://www.npmjs.com/package/@types/react-dom) | 19.3.0 | MIT | 2026-10-04T09:19:01.470Z | Development/test |
| [jsdom](https://www.npmjs.com/package/jsdom) | 30.1.3 | MIT | 2026-10-15T09:24:39.281Z | Development/test |
| [prettier](https://www.npmjs.com/package/prettier) | 3.9.10 | MIT | 2026-10-10T08:35:28.619Z | Development/test |
| [typescript](https://www.npmjs.com/package/typescript) | 7.0.2 | Apache-2.0 | 2026-11-01T08:05:41.448Z | Development/test |
| [vite](https://www.npmjs.com/package/vite) | 8.3.5 | MIT | 2026-10-21T06:38:55.491Z | Development/test |
| [vitest](https://www.npmjs.com/package/vitest) | 5.0.5 | MIT | 2026-10-19T16:53:22.209Z | Development/test |

## Reuse decisions
- DEPEND: React/React DOM for the real app; Vite/TypeScript for builds; Lucide for one consistent icon set.
- DEPEND: marked + DOMPurify for sanitized repository Markdown; KaTeX for locally bundled maths/fonts. Corpus rendering tests exercise all extracted questions; unsupported syntax remains a visible fallback, not a silent correction.
- STUDY/DEFER: IndexedDB adapter and service-worker tooling belong to later phases. No ads/billing SDK.
- ADAPT: existing Markdown is preserved verbatim on disk; runtime parsing splits question entries and removes editorial end matter. Raw files and older HTML reader are not deleted.
- BUILD: thin routing, corpus parser, metadata filters and accessible production layouts; no external UI template.

## Licence notices and scope
Installed package LICENSE/NOTICE files remain authoritative, including transitive packages. KaTeX fonts have their own bundled notices (SIL OFL); Lucide icon assets include upstream icon-licence terms beyond the React package manifest. DOMPurify offers MPL-2.0 OR Apache-2.0. Chromium is test-only and has upstream Chromium/third-party notices; the wrapper MIT licence is not the browser licence. Preserve required upstream notices when publishing a distributable. This register is not a completed legal review of exam content or a grant of redistribution rights.
