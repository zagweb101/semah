import { z } from "zod";
export const BrandStrategyOutputSchema = z.object({
  executiveSummary: z.string().min(50),
  brandStory: z.string().min(50),
  vision: z.string().min(10),
  mission: z.string().min(10),
  coreValues: z.array(z.string().min(3)).min(3).max(10),
  brandPromise: z.string().min(10),
  positioningStatement: z.string().min(20),
  uniqueValueProposition: z.string().min(10),
  differentiators: z.array(z.string().min(5)).min(2).max(8),
  targetAudience: z.object({ primary: z.string().min(10), secondary: z.string().optional() }),
  customerPersonas: z.array(z.object({
    name: z.string(), age: z.string(), occupation: z.string(),
    painPoints: z.array(z.string()), goals: z.array(z.string()),
  })).min(1).max(5),
  toneOfVoice: z.object({ primary: z.string(), secondary: z.string().optional(), avoid: z.string().optional() }),
  communicationPrinciples: z.array(z.string()).min(3).max(10),
  brandKeywords: z.array(z.string()).min(3).max(15),
  suggestedTaglines: z.array(z.string()).min(2).max(6),
  opportunities: z.array(z.string()).max(10),
  risks: z.array(z.string()).max(10),
  competitorNotes: z.string().optional(),
});
export type BrandStrategyOutput = z.infer<typeof BrandStrategyOutputSchema>;
