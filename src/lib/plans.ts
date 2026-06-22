export type PlanId = "free" | "starter" | "professional" | "agency";

export interface PlanConfig {
  id: PlanId; name: string; nameAr: string; description: string; descriptionAr: string;
  priceMonthly: number; priceYearly: number; highlight?: boolean;
  features: string[]; featuresAr: string[]; stripePriceId: string;
  monthlyCredits: number; maxProjects: number; maxMembers: number; maxShareLinks: number;
  exportsAllowed: string[]; watermark: boolean; clientPortal: boolean;
  brandBook: boolean; versionHistory: boolean; highResExports: boolean; designTokens: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: { id: "free", name: "Free", nameAr: "مجاني", description: "Perfect for trying SEMAH", descriptionAr: "مثالي لتجربة سِمَة", priceMonthly: 0, priceYearly: 0, features: ["1 project","Brand Brief","Short strategy","1 visual direction","Watermarked exports"], featuresAr: ["مشروع واحد","Brand Brief كامل","استراتيجية مختصرة","اتجاه بصري واحد","تصدير بعلامة مائية"], stripePriceId: process.env.STRIPE_PRICE_FREE ?? "", monthlyCredits: 25, maxProjects: 1, maxMembers: 1, maxShareLinks: 0, exportsAllowed: ["color_palette_json"], watermark: true, clientPortal: false, brandBook: false, versionHistory: false, highResExports: false, designTokens: false },
  starter: { id: "starter", name: "Starter", nameAr: "ستارتر", description: "For freelancers and small projects", descriptionAr: "للمستقلين والمشاريع الصغيرة", priceMonthly: 19, priceYearly: 190, features: ["5 projects","Full brand strategy","3 visual directions","Color palettes","Typography","Mood boards","Logo concepts","Brand Sheet"], featuresAr: ["5 مشاريع","استراتيجية علامة كاملة","3 اتجاهات بصرية","لوحات ألوان","نظام خطوط","Mood Boards","مفاهيم شعار","Brand Sheet"], stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "", monthlyCredits: 100, maxProjects: 5, maxMembers: 1, maxShareLinks: 3, exportsAllowed: ["brand_sheet_pdf","color_palette_json","design_tokens_json"], watermark: false, clientPortal: false, brandBook: false, versionHistory: false, highResExports: false, designTokens: true },
  professional: { id: "professional", name: "Professional", nameAr: "احترافي", description: "For professional designers", descriptionAr: "للمصممين المحترفين", priceMonthly: 49, priceYearly: 490, highlight: true, features: ["20 projects","Everything in Starter","Brand Book","Client portal","Version history","Design tokens","High-res exports","3 team members"], featuresAr: ["20 مشروعًا","كل مزايا ستارتر","Brand Book","بوابة العميل","سجل الإصدارات","Design Tokens","تصدير عالي الدقة","3 أعضاء فريق"], stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL ?? "", monthlyCredits: 500, maxProjects: 20, maxMembers: 3, maxShareLinks: 20, exportsAllowed: ["brand_sheet_pdf","brand_book_pdf","moodboard_png","color_palette_json","design_tokens_json"], watermark: false, clientPortal: true, brandBook: true, versionHistory: true, highResExports: true, designTokens: true },
  agency: { id: "agency", name: "Agency", nameAr: "وكالة", description: "For agencies and teams", descriptionAr: "للوكالات والفرق", priceMonthly: 149, priceYearly: 1490, features: ["Unlimited projects","Everything in Professional","10 team members","Unlimited share links","Advanced permissions","Usage reporting","Higher storage","Priority support"], featuresAr: ["مشاريع غير محدودة","كل مزايا الاحترافي","10 أعضاء فريق","روابط مشاركة غير محدودة","صلاحيات متقدمة","تقارير الاستخدام","مساحة تخزين أكبر","دعم أولوية"], stripePriceId: process.env.STRIPE_PRICE_AGENCY ?? "", monthlyCredits: 2000, maxProjects: 999, maxMembers: 10, maxShareLinks: 999, exportsAllowed: ["brand_sheet_pdf","brand_book_pdf","moodboard_png","color_palette_json","design_tokens_json"], watermark: false, clientPortal: true, brandBook: true, versionHistory: true, highResExports: true, designTokens: true },
};

export const PLANS_ARRAY = Object.values(PLANS);

export function getPlan(planId: PlanId | string | null | undefined): PlanConfig {
  if (!planId) return PLANS.free;
  return PLANS[planId as PlanId] ?? PLANS.free;
}

export function getPlanByStripePriceId(priceId: string): PlanConfig | undefined {
  return PLANS_ARRAY.find((p) => p.stripePriceId === priceId && p.stripePriceId !== "");
}
