import { test, expect } from "@playwright/test";
test("home, library, URL filters, empty state and recovery", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Big ambitions/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore question papers" }).click();
  await expect(page.locator(".paper-card")).toHaveCount(7);
  await page.getByLabel("Search papers").fill("2024");
  await expect(page.locator(".paper-card")).toHaveCount(1);
  await expect(page).toHaveURL(/q=2024/);
  await page.reload();
  await expect(page.getByLabel("Search papers")).toHaveValue("2024");
  await page.getByLabel("Search papers").fill("no-such-paper");
  await expect(page.getByText("No papers match your search.")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".paper-card")).toHaveCount(7);
});
test("2024 gaps, question navigation, maths, direct-link reload", async ({
  page,
}) => {
  await page.goto("/#/papers/2024");
  await expect(
    page.getByText("Missing question numbers:", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Question 2", exact: true }).click();
  await expect(page.locator(".katex").first()).toBeVisible();
  await expect(page).toHaveURL(/q=2/);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Question 2", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await expect(
    page.getByRole("button", { name: "Question 60", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(
    page.getByRole("button", { name: "Question 3", exact: true }),
  ).toHaveAttribute("aria-current", "true");
});
test("syllabus topic search, selection and real chapter content", async ({
  page,
}) => {
  await page.goto("/#/syllabus");
  await expect(page.locator(".topic")).toHaveCount(11);
  await page.getByLabel("Search syllabus topics").fill("Matrices");
  await expect(page.locator(".topic")).toHaveCount(1);
  await page.locator("summary").click();
  await expect(page.locator(".topic-body")).toContainText("Cayley");
  await page.getByLabel("Search syllabus topics").fill("");
  await page.getByRole("link", { name: /02.*Physics/ }).click();
  await expect(page.locator(".topic")).toHaveCount(15);
});
test("mobile navigation, theme and no page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/");
  for (const path of ["", "/papers", "/papers/2025", "/syllabus", "/about"]) {
    await page.goto("/#" + path);
    await page.waitForTimeout(150);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .locator(".sidebar")
    .getByRole("link", { name: /Question library/ })
    .click();
  await expect(page.locator(".sidebar")).not.toHaveClass(/open/);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
test("invalid routes and paper identity warnings", async ({ page }) => {
  await page.goto("/#/papers/2019");
  await expect(page.locator(".notice")).toContainText("Year conflict");
  await page.goto("/#/papers/2000");
  await expect(
    page.getByRole("heading", {
      name: "That paper is not in this collection.",
    }),
  ).toBeVisible();
  await page.goto("/#/missing");
  await expect(
    page.getByRole("heading", { name: "This page took a different path." }),
  ).toBeVisible();
});

test("missing-diagram warning and no automatic external runtime requests", async ({
  page,
}) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:4173") &&
      !r.url().startsWith("data:")
    )
      external.push(r.url());
  });
  await page.goto("/#/papers/2025");
  await expect(page.locator(".katex").first()).toBeVisible();
  await page.getByRole("button", { name: "Question 95", exact: true }).click();
  await expect(page.locator(".inline-warning")).toBeVisible();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test("failed paper chunk offers reload recovery", async ({ page }) => {
  await page.route("**/assets/2025-*.js", (r) => r.abort());
  await page.goto("/#/papers/2025");
  await expect(
    page.getByRole("heading", { name: "Something didn’t load." }),
  ).toBeVisible();
  await page.unroute("**/assets/2025-*.js");
  await page.getByRole("button", { name: "Retry loading" }).click();
  await expect(
    page.getByRole("button", { name: "Question 1", exact: true }),
  ).toBeVisible();
});
test("rapid navigation never puts stale content under the next title", async ({
  page,
}) => {
  await page.goto("/#/papers/2024");
  await page.goto("/#/papers/2025");
  await expect(page.locator(".reader-title h1")).toContainText("2025");
  await expect(page.locator(".question-text")).toContainText("complex number");
});
