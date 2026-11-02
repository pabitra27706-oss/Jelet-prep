import { chromium as pw } from "playwright";
import chromium from "@sparticuz/chromium";
import { brotliDecompressSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
const libs = join(tmpdir(), "jelet-browser-libs");
if (!existsSync(join(libs, "lib"))) {
  mkdirSync(libs, { recursive: true });
  execFileSync("tar", ["-xf", "-", "-C", libs], {
    input: brotliDecompressSync(
      readFileSync("node_modules/@sparticuz/chromium/bin/al2023.tar.br"),
    ),
  });
}
process.env.LD_LIBRARY_PATH = [join(libs, "lib"), process.env.LD_LIBRARY_PATH]
  .filter(Boolean)
  .join(":");
const out = process.argv.slice(2);
const b = await pw.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args.filter(
    (a) =>
      ![
        "--single-process",
        "--disable-web-security",
        "--allow-running-insecure-content",
      ].includes(a),
  ),
  headless: true,
});
const p = await b.newPage({ deviceScaleFactor: 2 });
for (const f of out) {
  await p.goto("file://" + process.cwd() + "/docs/figures/pilot/" + f + ".svg");
  await p.screenshot({
    path: "/tmp/render-" + f + ".png",
    clip: { x: 0, y: 0, width: 400, height: 230 },
  });
  console.log("rendered", f);
}
await b.close();
