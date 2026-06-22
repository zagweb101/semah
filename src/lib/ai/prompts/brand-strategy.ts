import { BrandBriefInputSchema, type BrandBriefInput } from "@/lib/ai/schemas/brand-brief-input";
import { BrandStrategyOutputSchema } from "@/lib/ai/schemas/brand-strategy-output";

export const brandStrategyPrompt = {
  name: "brand-strategy",
  version: "1.0.0",
  purpose: "Generate a complete brand strategy from a brand brief",
  locale: "ar" as const,
  inputSchema: BrandBriefInputSchema,
  outputSchema: BrandStrategyOutputSchema,
  buildSystem(): string {
    return `أنت خبير استراتيجية علامات تجارية يعمل باللغة العربية الفصحى المعاصرة.
مهمتك: توليد استراتيجية علامة تجارية متكاملة بناءً على Brief مقدَّم من المستخدم.

قواعد صارمة:
- أعد JSON صالحًا يطابق الـschema المحدد فقط.
- لا تضف أي نص خارج JSON.
- استخدم اللغة العربية الفصحى المعاصرة.
- اجعل المحتوى واقعيًا ومتعلقًا بالـBrief.
- تجنب العبارات العامة الفارغة.
- اقترح taglines قصيرة وقوية (3-6 كلمات).
- اجعل الرؤية طموحة لكن قابلة للتحقيق.
- اجعل الرسالة واضحة وقابلة للقياس.
- اذكر قيمًا مختلفة بين 3 و 10 قيم.
- اقترح 2-4 personas مختلفة.
- كن محددًا في التمايزات.`;
  },
  buildUser(brief: BrandBriefInput): string {
    const personality = brief.personality ? Object.entries(brief.personality).map(([k, v]) => `${k}: ${v}/5`).join(", ") : "غير محدد";
    return `Brand Brief:
الاسم العربي: ${brief.nameAr}
${brief.nameEn ? `الاسم الإنجليزي: ${brief.nameEn}` : ""}
الوصف: ${brief.description}
القطاع: ${brief.sector}
${brief.country ? `الدولة: ${brief.country}` : ""}
${brief.market ? `السوق: ${brief.market}` : ""}
${brief.problem ? `المشكلة التي يحلها المشروع: ${brief.problem}` : ""}
${brief.usps?.length ? `نقاط التميز: ${brief.usps.join("، ")}` : ""}
${brief.audienceAgeRange ? `الفئة العمرية: ${brief.audienceAgeRange}` : ""}
${brief.audienceLocation ? `الموقع الجغرافي: ${brief.audienceLocation}` : ""}
شخصية العلامة: ${personality}
${brief.visualPreferences?.length ? `الاتجاهات البصرية المفضّلة: ${brief.visualPreferences.join("، ")}` : ""}
${brief.preferredColors?.length ? `ألوان مفضّلة: ${brief.preferredColors.join("، ")}` : ""}
${brief.forbiddenColors?.length ? `ألوان ممنوعة: ${brief.forbiddenColors.join("، ")}` : ""}
${brief.competitorLinks?.length ? `روابط منافسين: ${brief.competitorLinks.join("، ")}` : ""}
${brief.additionalNotes ? `ملاحظات إضافية: ${brief.additionalNotes}` : ""}

ولّد استراتيجية علامة تجارية متكاملة وفق الـschema المحدد.`;
  },
  changelog: [{ version: "1.0.0", date: "2026-06-21", change: "Initial version" }],
} as const;
