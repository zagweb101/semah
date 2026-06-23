import { describe, it, expect } from "vitest";
import { getCreditCost, hasEnoughCredits, CREDIT_COSTS, PLAN_CREDITS } from "./costs";

describe("getCreditCost", () => {
  it("returns configured costs for known operations", () => {
    expect(getCreditCost("BRAND_STRATEGY")).toBe(5);
    expect(getCreditCost("COLOR_PALETTE")).toBe(3);
    expect(getCreditCost("PDF_EXPORT")).toBe(1);
  });

  it("falls back to 1 for unknown operations", () => {
    expect(getCreditCost("UNKNOWN_OPERATION" as keyof typeof CREDIT_COSTS)).toBe(1);
  });
});

describe("PLAN_CREDITS", () => {
  it("has increasing credit allocations", () => {
    expect(PLAN_CREDITS.FREE).toBeLessThan(PLAN_CREDITS.STARTER);
    expect(PLAN_CREDITS.STARTER).toBeLessThan(PLAN_CREDITS.PROFESSIONAL);
    expect(PLAN_CREDITS.PROFESSIONAL).toBeLessThan(PLAN_CREDITS.AGENCY);
  });
});

describe("hasEnoughCredits", () => {
  it("returns true when available balance covers cost", () => {
    expect(hasEnoughCredits(100, 10, 5)).toBe(true);
  });

  it("returns false when cost exceeds available balance", () => {
    expect(hasEnoughCredits(10, 5, 10)).toBe(false);
  });

  it("accounts for reserved credits", () => {
    expect(hasEnoughCredits(20, 15, 5)).toBe(true);
    expect(hasEnoughCredits(20, 16, 5)).toBe(false);
  });
});
