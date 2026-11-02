import { defineConfig } from "@playwright/test";
import chromium from "@sparticuz/chromium";
import { brotliDecompressSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
// The npm-packaged browser avoids a separate CDN download in restricted Linux sandboxes.
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
export default defineConfig({
  testDir: "tests",
  workers: 1,
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:4173",
    headless: true,
    launchOptions: {
      executablePath: await chromium.executablePath(),
      args: chromium.args.filter(
        (arg) =>
          ![
            "--single-process",
            "--disable-web-security",
            "--allow-running-insecure-content",
          ].includes(arg),
      ),
    },
  },
  reporter: "list",
});
