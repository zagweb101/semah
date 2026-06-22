import { z } from "zod";
export const VisualDirectionOutputSchema = z.object({
  directions: z.array(z.object({
    name: z.string().min(3), title: z.string().min(3),
    coreIdea: z.string().min(20), description: z.string().min(50),
    targetEmotions: z.array(z.string()).min(2).max(8),
    keywords: z.array(z.string()).min(3).max(10),
    colorStyle: z.string().min(10), typographyStyle: z.string().min(10),
    imageStyle: z.string().min(10),
    lightingStyle: z.string().optional(), iconStyle: z.string().optional(),
    geometricShapes: z.string().optional(), textures: z.string().optional(),
    patterns: z.string().optional(),
    logoIdeas: z.array(z.string()).min(1).max(5),
    usageExamples: z.array(z.string()).min(1).max(5),
    fitRationale: z.string().min(20),
  })).min(1).max(5),
});
export type VisualDirectionOutput = z.infer<typeof VisualDirectionOutputSchema>;
