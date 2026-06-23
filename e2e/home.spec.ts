import { test, expect } from "@playwright/test";

test("homepage loads with Arabic title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/سِمَة|SEMAH/);
  await expect(page.locator("body")).toContainText("من فكرة إلى هوية");
});
