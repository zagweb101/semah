import { test, expect } from "@playwright/test";

test("user can log in with seeded credentials", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page.locator("body")).toContainText("إجمالي المشاريع");
});

test("invalid credentials show error", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "wrongpassword");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("p.text-destructive").filter({ hasText: "Invalid email or password" })).toBeVisible();
});
