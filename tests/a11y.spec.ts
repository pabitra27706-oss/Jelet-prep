import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("accessibility scan of principal screens", async ({ page }) => {
  // Seed real saved data first so the study screens are scanned with content,
  // not only in their empty state.
  await page.goto("/#/papers/2024");
  await page.getByRole("button", { name: "Question 2", exact: true }).click();
  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await page.locator(".note-panel summary").click();
  await page.getByLabel("Note for question 2").fill("Accessibility scan note.");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.locator(".save-status.saved").first()).toBeVisible();
  await page.goto("/#/syllabus");
  await page.locator(".topic summary").first().click();
  await page.getByRole("button", { name: "Studying", exact: true }).click();
  await expect(page.locator(".save-status.saved").first()).toBeVisible();

  for (const route of [
    "/",
    "/papers",
    "/syllabus",
    "/saved",
    "/progress",
    "/settings",
    "/about",
    "/papers/2025",
  ]) {
    await page.goto("/#" + route);
    await expect(page.locator("main")).toBeVisible();
    if (route === "/papers/2025")
      await expect(page.locator(".katex").first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      `${route}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
});
test("accessibility scan of the study workspace in dark theme", async ({
  page,
}) => {
  await page.goto("/#/papers/2024");
  await page.getByRole("button", { name: "Question 5", exact: true }).click();
  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await page.locator(".note-panel summary").click();
  await page.getByLabel("Note for question 5").fill("Dark-theme note text.");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.locator(".note-panel .save-status.saved")).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  for (const route of ["/", "/saved", "/progress", "/settings"]) {
    await page.goto("/#" + route);
    await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      `${route}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
});

test("screenshots for visual review", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await page.screenshot({
    path: "test-results/review-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: "test-results/review-mobile.png",
    fullPage: true,
  });
});
