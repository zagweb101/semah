import { prisma } from "@/lib/prisma";

const STATUS_ORDER = [
  "DRAFT",
  "BRIEF_IN_PROGRESS",
  "READY_FOR_ANALYSIS",
  "ANALYZING",
  "STRATEGY_READY",
  "VISUAL_DIRECTIONS_READY",
  "INTERNAL_REVIEW",
  "CLIENT_REVIEW",
  "REVISION_REQUESTED",
  "APPROVED",
  "DELIVERED",
  "ARCHIVED",
] as const;

const MODULE_TARGET_STATUS: Record<string, string> = {
  BRAND_STRATEGY: "STRATEGY_READY",
  VISUAL_DIRECTIONS: "VISUAL_DIRECTIONS_READY",
  COLOR_PALETTE: "INTERNAL_REVIEW",
  TYPOGRAPHY_SYSTEM: "INTERNAL_REVIEW",
  LOGO_CONCEPTS: "INTERNAL_REVIEW",
  BRAND_SHEET: "CLIENT_REVIEW",
  BRAND_BOOK: "CLIENT_REVIEW",
};

export async function advanceProjectStatus(projectId: string, module: string) {
  const target = MODULE_TARGET_STATUS[module];
  if (!target) return;

  const project = await prisma.brandProject.findUnique({
    where: { id: projectId },
    select: { status: true },
  });
  if (!project) return;

  const currentIndex = STATUS_ORDER.indexOf(project.status as (typeof STATUS_ORDER)[number]);
  const targetIndex = STATUS_ORDER.indexOf(target as (typeof STATUS_ORDER)[number]);
  if (currentIndex === -1 || targetIndex === -1) return;
  if (targetIndex <= currentIndex) return;

  await prisma.brandProject.update({
    where: { id: projectId },
    data: { status: target as (typeof STATUS_ORDER)[number] },
  });
}
