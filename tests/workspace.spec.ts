import { test, expect, type Page } from "@playwright/test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const workDir = mkdtempSync(join(tmpdir(), "jelet-backups-"));

function writeFixture(name: string, contents: unknown) {
  const file = join(workDir, name);
  writeFileSync(
    file,
    typeof contents === "string" ? contents : JSON.stringify(contents),
  );
  return file;
}

async function bookmarkQuestion(page: Page, number: number) {
  await page
    .getByRole("button", { name: `Question ${number}`, exact: true })
    .click();
  const button = page.getByRole("button", { name: /^(Bookmark|Bookmarked)$/ });
  if ((await button.getAttribute("aria-pressed")) !== "true") {
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
  }
}

async function writeNote(page: Page, number: number, text: string) {
  await page
    .getByRole("button", { name: `Question ${number}`, exact: true })
    .click();
  const panel = page.locator(".note-panel");
  if (
    !(await panel.evaluate((element) => (element as HTMLDetailsElement).open))
  ) {
    await panel.locator("summary").click();
  }
  await page.getByLabel(`Note for question ${number}`).fill(text);
  await page.getByRole("button", { name: "Save note" }).click();
  // Scope to the note panel: the bookmark toolbar has its own save status.
  await expect(page.locator(".note-panel .save-status.saved")).toBeVisible();
}

test("bookmark and note survive a reload and reopen the exact question", async ({
  page,
}) => {
  await page.goto("/#/papers/2024");
  await bookmarkQuestion(page, 2);
  await expect(page.locator(".save-status.saved").first()).toContainText(
    "Saved",
  );
  await writeNote(page, 2, "Check the determinant property here.");

  await page.reload();
  await expect(
    page.getByRole("button", { name: "Question 2", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await expect(
    page.getByRole("button", { name: "Bookmarked", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".note-panel")).toHaveAttribute("open", "");
  await expect(page.getByLabel("Note for question 2")).toHaveValue(
    "Check the determinant property here.",
  );

  await page.goto("/#/saved");
  await expect(page.getByText("JELET 2024 · Question 2").first()).toBeVisible();
  await expect(
    page.getByText("Check the determinant property here."),
  ).toBeVisible();
  await page
    .locator(".saved-list")
    .getByRole("link", { name: "Open question" })
    .first()
    .click();
  await expect(page).toHaveURL(/q=2/);
  await expect(
    page.getByRole("button", { name: "Question 2", exact: true }),
  ).toHaveAttribute("aria-current", "true");
});

test("reading position resumes without jumping to another question", async ({
  page,
}) => {
  await page.goto("/#/papers/2025");
  await page.getByRole("button", { name: "Question 7", exact: true }).click();
  // Wait for the throttled position write to commit.
  await expect(page.getByRole("button", { name: "Bookmark" })).toBeEnabled();
  await page.waitForTimeout(1000);
  await page.goto("/#/papers");
  await page.goto("/#/papers/2025");
  await expect(page.locator(".resume-notice")).toContainText("question 7");
  await expect(
    page.getByRole("button", { name: "Question 7", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await page
    .locator(".resume-notice")
    .getByRole("button", { name: /Start from question 1/ })
    .click();
  await expect(
    page.getByRole("button", { name: "Question 1", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await expect(page.locator(".resume-notice")).toHaveCount(0);
});

test("a missing question in the URL falls back instead of inventing content", async ({
  page,
}) => {
  await page.goto("/#/papers/2024?q=60");
  await expect(page.locator(".question-text")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Question 60", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Question 1", exact: true }),
  ).toHaveAttribute("aria-current", "true");
});

test("topic status produces real progress counts and no invented scores", async ({
  page,
}) => {
  await page.goto("/#/syllabus");
  await page.locator(".topic summary").first().click();
  await page.getByRole("button", { name: "Studying", exact: true }).click();
  await expect(
    page.locator(".topic-status .save-status.saved").first(),
  ).toBeVisible();
  await expect(page.locator(".topic-status-chip").first()).toHaveText(
    "Studying",
  );

  await page.goto("/#/progress");
  await expect(
    page
      .locator(".stat-card", { hasText: "Topics marked studying" })
      .locator("strong"),
  ).toHaveText("1");
  await expect(
    page
      .locator(".stat-card", { hasText: "Topics marked revised" })
      .locator("strong"),
  ).toHaveText("0");
  await expect(page.getByText("No scored practice exists yet")).toBeVisible();

  await page.reload();
  await expect(
    page
      .locator(".stat-card", { hasText: "Topics marked studying" })
      .locator("strong"),
  ).toHaveText("1");
});

test("export, reset and import restore equivalent study data", async ({
  page,
}) => {
  await page.goto("/#/papers/2024");
  await bookmarkQuestion(page, 3);
  await writeNote(page, 3, "Backup round-trip note.");
  await page.goto("/#/syllabus");
  await page.locator(".topic summary").first().click();
  await page.getByRole("button", { name: "Revised", exact: true }).click();
  await expect(
    page.locator(".topic-status .save-status.saved").first(),
  ).toBeVisible();

  await page.goto("/#/settings");
  await expect(page.locator(".count-list")).toContainText("Bookmarks");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download backup" }).click();
  const download = await downloadPromise;
  const backupPath = join(workDir, "exported-backup.json");
  await download.saveAs(backupPath);
  expect(download.suggestedFilename()).toMatch(
    /^jelet-prep-backup-\d{8}-\d{4}\.json$/,
  );

  await page.getByRole("button", { name: "Reset study data" }).click();
  const dialog = page.locator("dialog.confirm-dialog");
  await expect(dialog).toBeVisible();
  const confirm = dialog.getByRole("button", { name: "Clear saved data" });
  await expect(confirm).toBeDisabled();
  await dialog.getByLabel(/Type RESET/).fill("RESET");
  await confirm.click();
  await expect(page.getByText("Saved study data was cleared")).toBeVisible();
  await page.goto("/#/saved");
  await expect(page.getByText("Nothing saved yet.")).toBeVisible();

  await page.goto("/#/settings");
  await page.locator('input[type="file"]').setInputFiles(backupPath);
  await expect(page.locator(".import-preview")).toBeVisible();
  await expect(page.locator(".diff-table")).toContainText("Bookmarks");
  await page.getByRole("button", { name: "Import backup" }).click();
  await expect(page.locator(".notice.success")).toContainText(
    "Import finished",
  );

  await page.goto("/#/saved");
  await expect(page.getByText("JELET 2024 · Question 3").first()).toBeVisible();
  await expect(page.getByText("Backup round-trip note.")).toBeVisible();
  await page.goto("/#/progress");
  await expect(
    page
      .locator(".stat-card", { hasText: "Topics marked revised" })
      .locator("strong"),
  ).toHaveText("1");
});

test("invalid, oversized and newer-format backups change nothing", async ({
  page,
}) => {
  await page.goto("/#/papers/2024");
  await bookmarkQuestion(page, 4);
  await page.goto("/#/settings");
  const input = page.locator('input[type="file"]');

  await input.setInputFiles(writeFixture("broken.json", "{not json"));
  await expect(page.locator(".notice.warning")).toContainText(
    "Nothing was imported",
  );
  await expect(page.locator(".notice.warning")).toContainText("valid JSON");

  const future = {
    app: "jelet-prep",
    kind: "study-workspace-backup",
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    contentVersion: "2030-01-01.1",
    data: { bookmarks: [], positions: [], notes: [], topics: [], history: [] },
  };
  await input.setInputFiles(writeFixture("future.json", future));
  await expect(page.locator(".notice.warning")).toContainText(
    "newer version of JELETprep",
  );

  await input.setInputFiles(writeFixture("huge.json", "x".repeat(2_000_001)));
  await expect(page.locator(".notice.warning")).toContainText("limit is 2 MB");

  await page.goto("/#/saved");
  await expect(page.getByText("JELET 2024 · Question 4")).toBeVisible();
});

test("importing the same backup twice does not duplicate bookmarks", async ({
  page,
}) => {
  await page.goto("/#/papers/2024");
  await bookmarkQuestion(page, 5);
  await page.goto("/#/settings");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download backup" }).click();
  const download = await downloadPromise;
  const backupPath = join(workDir, "duplicate-backup.json");
  await download.saveAs(backupPath);

  const input = page.locator('input[type="file"]');
  for (let attempt = 0; attempt < 2; attempt++) {
    await input.setInputFiles(backupPath);
    await expect(page.locator(".import-preview")).toBeVisible();
    await page.getByRole("button", { name: "Import backup" }).click();
    await expect(page.locator(".notice.success")).toContainText(
      "Import finished",
    );
  }

  await page.goto("/#/saved");
  await expect(page.getByText("JELET 2024 · Question 5")).toHaveCount(1);
  await page.goto("/#/settings");
  await expect(
    page.locator(".count-list div", { hasText: "Bookmarks" }).locator("dd"),
  ).toHaveText("1");
});

test("replace-import requires explicit confirmation and keeps a safety copy", async ({
  page,
}) => {
  await page.goto("/#/papers/2024");
  await bookmarkQuestion(page, 6);
  await page.goto("/#/settings");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download backup" }).click();
  const backupPath = join(workDir, "replace-backup.json");
  await (await downloadPromise).saveAs(backupPath);

  await page.locator('input[type="file"]').setInputFiles(backupPath);
  await page.getByLabel(/Replace/).check();
  const confirmButton = page.getByRole("button", { name: "Import backup" });
  await expect(confirmButton).toBeDisabled();
  await page.getByLabel(/Type REPLACE/).fill("REPLACE");
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();
  await expect(page.locator(".notice.success")).toContainText("safety copy");
  await expect(page.getByText("A safety copy from before")).toBeVisible();
});

test("two tabs see each other's committed bookmarks", async ({
  page,
  context,
}) => {
  const second = await context.newPage();
  await page.goto("/#/saved");
  await expect(page.getByText("Nothing saved yet.")).toBeVisible();
  await second.goto("/#/papers/2024");
  await bookmarkQuestion(second, 8);
  await expect(second.locator(".save-status.saved")).toBeVisible();
  await expect(page.getByText("JELET 2024 · Question 8")).toBeVisible({
    timeout: 7000,
  });
});

test("a note edited in another tab is not silently overwritten", async ({
  page,
  context,
}) => {
  const other = await context.newPage();
  await page.goto("/#/papers/2024");
  await page.getByRole("button", { name: "Question 2", exact: true }).click();
  await page.locator(".note-panel summary").click();
  await page.getByLabel("Note for question 2").fill("Draft from tab A");

  await other.goto("/#/papers/2024");
  await other.getByRole("button", { name: "Question 2", exact: true }).click();
  await other.locator(".note-panel summary").click();
  await other.getByLabel("Note for question 2").fill("Committed from tab B");
  await other.getByRole("button", { name: "Save note" }).click();
  await expect(other.locator(".note-panel .save-status.saved")).toBeVisible();

  await page.getByRole("button", { name: "Save note" }).click();
  const conflict = page.locator(".note-warning[role='alert']");
  await expect(conflict).toContainText("edited in another tab");
  await expect(page.getByLabel("Note for question 2")).toHaveValue(
    "Draft from tab A",
  );
  await page
    .getByRole("button", { name: "Load the other tab’s version" })
    .click();
  await expect(page.getByLabel("Note for question 2")).toHaveValue(
    "Committed from tab B",
  );
  await page.getByLabel("Note for question 2").fill("Merged by tab A");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.locator(".note-panel .save-status.saved")).toBeVisible();
});

test("blocked storage is reported honestly and reading still works", async ({
  page,
}) => {
  await page.addInitScript(() => {
    IDBFactory.prototype.open = function () {
      throw new DOMException("blocked for test", "SecurityError");
    };
  });
  await page.goto("/#/papers/2024");
  await expect(page.locator(".notice.warning").first()).toContainText(
    "blocking local storage",
  );
  await expect(page.locator(".question-text")).toContainText(
    "orthogonal matrices",
  );
  await expect(
    page.getByRole("button", { name: "Bookmark", exact: true }),
  ).toBeDisabled();
  await page.goto("/#/settings");
  await expect(page.getByText("Unavailable", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download backup" }),
  ).toBeDisabled();
  await page.goto("/#/saved");
  await expect(page.getByText("Local storage is unavailable")).toBeVisible();
});

test("a quota failure reports the note as unsaved", async ({ page }) => {
  await page.addInitScript(() => {
    const originalPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (this: IDBObjectStore, ...args) {
      if (this.name === "notes") {
        throw new DOMException("quota for test", "QuotaExceededError");
      }
      return originalPut.apply(this, args as never);
    } as typeof originalPut;
  });
  await page.goto("/#/papers/2024");
  await page.getByRole("button", { name: "Question 2", exact: true }).click();
  await page.locator(".note-panel summary").click();
  await page.getByLabel("Note for question 2").fill("This cannot be stored.");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.locator(".note-warning[role='alert']")).toContainText(
    "storage is full",
  );
  await expect(page.locator(".save-status.saved")).toHaveCount(0);
  await expect(page.getByLabel("Note for question 2")).toHaveValue(
    "This cannot be stored.",
  );
});
