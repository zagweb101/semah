import { BrandBriefInputSchema, type BrandBriefInput } from "@/lib/ai/schemas/brand-brief-input";
import { BrandStrategyOutputSchema } from "@/lib/ai/schemas/brand-strategy-output";

export const brandStrategyPrompt = {
  name: "brand-strategy",
  version: "2.0.0",
  purpose: "Generate a complete corporate identity strategy from a brand brief",
  locale: "ar" as const,
  inputSchema: BrandBriefInputSchema,
  outputSchema: BrandStrategyOutputSchema,
  buildSystem(): string {
    return `أنت خبير استراتيجية الهوية المؤسسية (Corporate Identity) يعمل باللغة العربية الفصحى المعاصرة.
مهمتك: توليد استراتيجية هوية مؤسسية متكاملة بناءً على Brief مقدَّم من المستخدم.

الفرق بين الهوية المؤسسية والهوية البصرية:
- الهوية المؤسسية (Corporate Identity) تشمل: الرؤية، الرسالة، القيم، الثقافة المؤسسية، السلوك، نبرة التواصل، العلاقات، والتموضع الاستراتيجي.
- الهوية البصرية (Visual Identity) هي جزء من الهوية المؤسسية، تشمل: الشعار، الألوان، الخطوط، التصميم.

أنت تركز على الهوية المؤسسية الشاملة، لا فقط الجانب البصري.

قواعد صارمة:
- أعد JSON صالحًا يطابق الـschema المحدد فقط.
- لا تضف أي نص خارج JSON.
- استخدم اللغة العربية الفصحى المعاصرة.
- اجعل المحتوى واقعيًا ومتعلقًا بالـBrief.
- ركّز على الجوانب المؤسسية: الثقافة، السلوك، القيم، العلاقات.
- تجنب العبارات العامة الفارغة.
- اقترح taglines قصيرة وقوية (3-6 كلمات).
- اجعل الرؤية طموحة لكن قابلة للتحقيق.
- اجعل الرسالة واضحة وقابلة للقياس.
- اذكر قيمًا مؤسسية مختلفة بين 3 و 10 قيم.
- اقترح 2-4 personas مختلفة.
- كن محددًا في التمايزات المؤسسية.
- اربط نبرة الصوت بالثقافة المؤسسية.
- اجلب مبادئ التواصل من منظور مؤسسي (كيف تتعامل المؤسسة مع عملائها وشركائها وموظفيها).`;
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
${brief.visualPreferences?.length ? `الاتجاهات المؤسسية المفضّلة: ${brief.visualPreferences.join("، ")}` : ""}
${brief.preferredColors?.length ? `ألوان مفضّلة: ${brief.preferredColors.join("، ")}` : ""}
${brief.forbiddenColors?.length ? `ألوان ممنوعة: ${brief.forbiddenColors.join("، ")}` : ""}
${brief.competitorLinks?.length ? `روابط منافسين: ${brief.competitorLinks.join("، ")}` : ""}
${brief.additionalNotes ? `ملاحظات إضافية: ${brief.additionalNotes}` : ""}

ولّد استراتيجية هوية مؤسسية متكاملة وفق الـschema المحدد. ركّز على الجوانب المؤسسية الشاملة (الثقافة، السلوك، القيم، التموضع) لا فقط الجانب البصري.`;
  },
  changelog: [
    { version: "1.0.0", date: "2026-06-21", change: "Initial version" },
    { version: "2.0.0", date: "2026-06-22", change: "Shifted from visual identity to corporate identity focus" },
  ],
} as const;
