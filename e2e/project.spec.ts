import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
});

test("user can create a new project", async ({ page }) => {
  const uniqueName = `مشروع اختبار ${Date.now()}`;
  await page.goto("/dashboard/projects/new");
  await page.fill('input[id="nameAr"]', uniqueName);
  await page.fill('input[id="nameEn"]', `Test Project ${Date.now()}`);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard\/projects\/[^/]+\/brief/);
  await expect(page.locator("body")).toContainText("Brand Brief");
});
