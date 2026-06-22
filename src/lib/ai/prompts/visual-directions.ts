import { BrandBriefInputSchema, type BrandBriefInput } from "@/lib/ai/schemas/brand-brief-input";
import { VisualDirectionOutputSchema } from "@/lib/ai/schemas/visual-direction-output";

export const visualDirectionsPrompt = {
  name: "visual-directions",
  version: "1.0.0",
  inputSchema: BrandBriefInputSchema,
  outputSchema: VisualDirectionOutputSchema,
  buildSystem(): string {
    return `أنت مدير إبداعي خبير يعمل باللغة العربية الفصحى المعاصرة.
مهمتك: اقتراح ثلاثة اتجاهات بصرية متمايزة للعلامة التجارية.

قواعد صارمة:
- أعد JSON صالحًا يطابق الـschema المحدد فقط.
- الاتجاهات الثلاثة يجب أن تكون متمايزة فعلًا.
- لكل اتجاه: اسم عربي معبر، عنوان قصير، فكرة أساسية، وصف مفصّل.
- اذكر المشاعر المستهدفة والكلمات المفتاحية.
- صِف أسلوب الألوان والخطوط والصور والإضاءة والأيقونات.
- اقترح 2-3 أفكار شعار لكل اتجاه.
- اذكر 2-3 أمثلة استخدام.
- اشرح سبب الملاءمة (fitRationale).
- اقتراحات الاتجاهات: تراثي/أصيل، مينيمال فاخر، إبداعي/جريء.`;
  },
  buildUser(brief: BrandBriefInput): string {
    return `Brand Brief:
الاسم: ${brief.nameAr}
الوصف: ${brief.description}
القطاع: ${brief.sector}
${brief.preferredColors?.length ? `ألوان مفضّلة: ${brief.preferredColors.join("، ")}` : ""}
${brief.forbiddenColors?.length ? `ألوان ممنوعة: ${brief.forbiddenColors.join("، ")}` : ""}
${brief.visualPreferences?.length ? `اتجاهات مفضّلة: ${brief.visualPreferences.join("، ")}` : ""}
${brief.personality ? `شخصية العلامة: ${JSON.stringify(brief.personality)}` : ""}

اقترح ثلاثة اتجاهات بصرية متمايزة.`;
  },
} as const;
