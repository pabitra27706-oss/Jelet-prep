import { test, expect } from "@playwright/test";

test("answer keys: index, per-year sheet, and reader integration", async ({
  page,
}) => {
  await page.goto("/#/keys");
  await expect(
    page.getByRole("heading", { name: "Answer keys" }),
  ).toBeVisible();
  await expect(page.locator(".key-card")).toHaveCount(4);

  await page.getByRole("link", { name: /JELET 2024/ }).click();
  await expect(
    page.getByRole("heading", { name: /JELET 2024 Paper-I answer key/ }),
  ).toBeVisible();
  await expect(page.locator(".key-cell")).toHaveCount(100);
  // 2024 voided Q49 and Q58.
  await expect(page.locator(".key-cell.is-void")).toHaveCount(2);
  await expect(page.getByText("Q49, Q58", { exact: false })).toBeVisible();

  // The reader shows the board's answer under the question.
  await page.goto("/#/papers/2024");
  const panel = page.locator(".answer-panel").first();
  await expect(panel).toBeVisible();
  await expect(panel.locator(".answer-value")).toHaveText("(A)");
  await expect(panel).toContainText("WBE/Ex-71");

  // A paper with no key still says so, and shows no answer panel.
  await page.goto("/#/papers/2022");
  await expect(
    page.getByText("No verified answers", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".answer-panel")).toHaveCount(0);
});

test("a year with no key does not invent one", async ({ page }) => {
  await page.goto("/#/keys/2019");
  await expect(page.getByText("No official key for 2019.")).toBeVisible();
});
