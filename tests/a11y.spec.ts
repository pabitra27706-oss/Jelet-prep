import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("accessibility scan of principal screens", async ({ page }) => {
  for (const route of ["/", "/papers", "/syllabus", "/about", "/papers/2025"]) {
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
