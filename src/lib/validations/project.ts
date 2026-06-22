import { z } from "zod";

export const createProjectSchema = z.object({
  organizationId: z.string().min(1),
  nameAr: z.string().min(2, "الاسم العربي مطلوب").max(100),
  nameEn: z.string().max(100).optional(),
});

export const brandBriefSchema = z.object({
  nameAr: z.string().min(2).max(100),
  nameEn: z.string().max(100).optional(),
  description: z.string().min(10).max(2000),
  sector: z.string().min(1).max(100),
  projectType: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  market: z.string().max(200).optional(),
  website: z.string().url().optional().or(z.literal("")),
  products: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),
  usps: z.array(z.string()).default([]),
  problem: z.string().max(2000).optional(),
  audienceAgeRange: z.string().max(100).optional(),
  audienceLocation: z.string().max(200).optional(),
  audienceInterests: z.array(z.string()).default([]),
  audienceNeeds: z.array(z.string()).default([]),
  audienceConcerns: z.array(z.string()).default([]),
  personality: z.object({
    luxurious: z.number().min(1).max(5).optional(),
    modern: z.number().min(1).max(5).optional(),
    bold: z.number().min(1).max(5).optional(),
    friendly: z.number().min(1).max(5).optional(),
    formal: z.number().min(1).max(5).optional(),
    simple: z.number().min(1).max(5).optional(),
    innovative: z.number().min(1).max(5).optional(),
    technical: z.number().min(1).max(5).optional(),
    natural: z.number().min(1).max(5).optional(),
    heritage: z.number().min(1).max(5).optional(),
    playful: z.number().min(1).max(5).optional(),
    calm: z.number().min(1).max(5).optional(),
  }).partial().default({}),
  visualPreferences: z.array(z.string()).default([]),
  preferredColors: z.array(z.string()).default([]),
  forbiddenColors: z.array(z.string()).default([]),
  preferredFonts: z.array(z.string()).default([]),
  forbiddenFonts: z.array(z.string()).default([]),
  competitorLinks: z.array(z.string()).default([]),
  additionalNotes: z.string().max(5000).optional(),
});

export type BrandBrief = z.infer<typeof brandBriefSchema>;

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["BRIEF_IN_PROGRESS", "ARCHIVED"],
  BRIEF_IN_PROGRESS: ["READY_FOR_ANALYSIS", "DRAFT", "ARCHIVED"],
  READY_FOR_ANALYSIS: ["ANALYZING", "BRIEF_IN_PROGRESS", "ARCHIVED"],
  ANALYZING: ["STRATEGY_READY", "BRIEF_IN_PROGRESS"],
  STRATEGY_READY: ["VISUAL_DIRECTIONS_READY", "ANALYZING", "ARCHIVED"],
  VISUAL_DIRECTIONS_READY: ["INTERNAL_REVIEW", "STRATEGY_READY", "ARCHIVED"],
  INTERNAL_REVIEW: ["CLIENT_REVIEW", "VISUAL_DIRECTIONS_READY", "REVISION_REQUESTED"],
  CLIENT_REVIEW: ["REVISION_REQUESTED", "APPROVED", "INTERNAL_REVIEW"],
  REVISION_REQUESTED: ["INTERNAL_REVIEW", "CLIENT_REVIEW"],
  APPROVED: ["DELIVERED", "CLIENT_REVIEW"],
  DELIVERED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

export function canTransition(from: string, to: string): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
