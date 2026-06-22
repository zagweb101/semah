import type { CreditOperationType } from "@/generated/prisma/client";

export const CREDIT_COSTS: Record<CreditOperationType, number> = {
  BRAND_STRATEGY: 5, AUDIENCE_PERSONAS: 3, VISUAL_DIRECTIONS: 8,
  COLOR_PALETTE: 3, TYPOGRAPHY_SYSTEM: 3, MOODBOARD_GENERATION: 4,
  MOODBOARD_ITEM_REGENERATION: 1, LOGO_CONCEPTS: 6, LOGO_PREVIEWS: 2,
  BRAND_SHEET: 2, BRAND_BOOK: 5, PDF_EXPORT: 1, HIGH_RES_EXPORT: 2,
};

export function getCreditCost(operationType: CreditOperationType): number {
  return CREDIT_COSTS[operationType] ?? 1;
}

export const PLAN_CREDITS = { FREE: 25, STARTER: 100, PROFESSIONAL: 500, AGENCY: 2000 } as const;

export function hasEnoughCredits(balance: number, reserved: number, cost: number): boolean {
  return balance - reserved >= cost;
}
