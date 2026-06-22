"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveBrandBriefAction, completeBrandBriefAction } from "@/lib/actions/projects";
import type { BrandBrief } from "@/lib/validations/project";
import { Save, CheckCircle2, ArrowLeft } from "lucide-react";

interface BriefWizardProps { projectId: string; initialData: Partial<BrandBrief>; alreadyCompleted: boolean; }

const STEPS = [
  { id: "basic", title: "البيانات الأساسية" },
  { id: "products", title: "المنتجات والخدمات" },
  { id: "audience", title: "الجمهور المستهدف" },
  { id: "personality", title: "شخصية العلامة" },
  { id: "preferences", title: "التفضيلات" },
];

const PERSONALITY_TRAITS = [
  { key: "luxurious", label: "فاخرة" }, { key: "modern", label: "عصرية" },
  { key: "bold", label: "جريئة" }, { key: "friendly", label: "ودودة" },
  { key: "formal", label: "رسمية" }, { key: "simple", label: "بسيطة" },
  { key: "innovative", label: "مبتكرة" }, { key: "technical", label: "تقنية" },
  { key: "natural", label: "طبيعية" }, { key: "heritage", label: "تراثية" },
  { key: "playful", label: "مرحة" }, { key: "calm", label: "هادئة" },
] as const;

export function BriefWizard({ projectId, initialData, alreadyCompleted }: BriefWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<BrandBrief>>(initialData);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const save = useCallback(async (dataToSave: Partial<BrandBrief>) => {
    setIsSaving(true);
    try {
      const result = await saveBrandBriefAction(projectId, dataToSave);
      if (result && "success" in result) setSavedAt(result.savedAt ?? new Date().toISOString());
    } catch (e) { console.error("Autosave failed:", e); }
    finally { setIsSaving(false); }
  }, [projectId]);

  useEffect(() => {
    const timer = setTimeout(() => { save(data); }, 1500);
    return () => clearTimeout(timer);
  }, [data, save]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isSaving) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isSaving]);

  function update<K extends keyof BrandBrief>(key: K, value: BrandBrief[K] | undefined) { setData((prev) => ({ ...prev, [key]: value })); }
  function updatePersonality(key: string, value: number) { setData((prev) => ({ ...prev, personality: { ...prev.personality, [key]: value } })); }
  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function prev() { setStep((s) => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function handleComplete() {
    setIsSubmitting(true);
    try {
      const result = await completeBrandBriefAction(projectId);
      if (result && "error" in result) toast.error(result.error);
      else { toast.success("تم حفظ Brand Brief بنجاح"); router.push(`/dashboard/projects/${projectId}`); router.refresh(); }
    } finally { setIsSubmitting(false); }
  }

  const currentStep = STEPS[step];
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Brand Brief</h1>
        <p className="mt-2 text-muted-foreground">عبّئ معلومات مشروعك. يتم الحفظ التلقائي بعد كل تعديل.</p>
      </div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 flex items-center">
              <button onClick={() => setStep(i)} className={`size-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${i === step ? "bg-violet text-white" : i < step ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <CheckCircle2 className="size-4" /> : i + 1}
              </button>
              <div className="flex-1 mx-2"><div className={`text-xs font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</div></div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-full ${i < step ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-4">
        {isSaving ? <><Save className="size-3 animate-pulse" />جارٍ الحفظ...</> : savedAt ? <><CheckCircle2 className="size-3 text-success" />حُفظ في {new Date(savedAt).toLocaleTimeString("ar-SA")}</> : null}
      </div>
      <div className="card-premium p-6 sm:p-8">
        {currentStep.id === "basic" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="nameAr">الاسم العربي <span className="text-danger">*</span></Label><Input id="nameAr" value={data.nameAr ?? ""} onChange={(e) => update("nameAr", e.target.value)} required maxLength={100} /></div>
              <div className="space-y-2"><Label htmlFor="nameEn">الاسم الإنجليزي</Label><Input id="nameEn" value={data.nameEn ?? ""} onChange={(e) => update("nameEn", e.target.value)} dir="ltr" maxLength={100} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">وصف النشاط <span className="text-danger">*</span></Label><Textarea id="description" value={data.description ?? ""} onChange={(e) => update("description", e.target.value)} placeholder="اكتب وصفًا موجزًا لمشروعك" rows={4} required maxLength={2000} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="sector">القطاع <span className="text-danger">*</span></Label><Input id="sector" value={data.sector ?? ""} onChange={(e) => update("sector", e.target.value)} placeholder="مثال: تقنية، تجزئة" required /></div>
              <div className="space-y-2"><Label htmlFor="market">السوق المستهدف</Label><Input id="market" value={data.market ?? ""} onChange={(e) => update("market", e.target.value)} placeholder="مثال: السوق الخليجي" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="country">الدولة</Label><Input id="country" value={data.country ?? ""} onChange={(e) => update("country", e.target.value)} placeholder="مثال: السعودية" /></div>
              <div className="space-y-2"><Label htmlFor="website">الموقع الإلكتروني</Label><Input id="website" type="url" value={data.website ?? ""} onChange={(e) => update("website", e.target.value)} placeholder="https://" dir="ltr" /></div>
            </div>
          </div>
        )}
        {currentStep.id === "products" && (
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="products">المنتجات (افصل بينها بفاصلة)</Label><Textarea id="products" value={(data.products ?? []).join("، ")} onChange={(e) => update("products", e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean))} placeholder="منتج 1، منتج 2" rows={3} /></div>
            <div className="space-y-2"><Label htmlFor="problem">المشكلة التي يحلها المشروع</Label><Textarea id="problem" value={data.problem ?? ""} onChange={(e) => update("problem", e.target.value)} rows={3} maxLength={2000} /></div>
            <div className="space-y-2"><Label htmlFor="usps">نقاط التميز</Label><Textarea id="usps" value={(data.usps ?? []).join("، ")} onChange={(e) => update("usps", e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean))} rows={3} /></div>
          </div>
        )}
        {currentStep.id === "audience" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="audienceAgeRange">الفئة العمرية</Label><Input id="audienceAgeRange" value={data.audienceAgeRange ?? ""} onChange={(e) => update("audienceAgeRange", e.target.value)} placeholder="مثال: 25-45" /></div>
              <div className="space-y-2"><Label htmlFor="audienceLocation">الموقع الجغرافي</Label><Input id="audienceLocation" value={data.audienceLocation ?? ""} onChange={(e) => update("audienceLocation", e.target.value)} placeholder="مثال: السعودية" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="audienceInterests">الاهتمامات</Label><Textarea id="audienceInterests" value={(data.audienceInterests ?? []).join("، ")} onChange={(e) => update("audienceInterests", e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean))} rows={2} /></div>
            <div className="space-y-2"><Label htmlFor="audienceNeeds">احتياجات الجمهور</Label><Textarea id="audienceNeeds" value={(data.audienceNeeds ?? []).join("، ")} onChange={(e) => update("audienceNeeds", e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean))} rows={2} /></div>
          </div>
        )}
        {currentStep.id === "personality" && (
          <div className="space-y-6">
            <div><Label className="text-base">شخصية العلامة — قيّم كل سمة من 1 إلى 5</Label><p className="text-sm text-muted-foreground mt-1">هذه التقييمات تساعد الذكاء الاصطناعي على فهم شخصية علامتك.</p></div>
            <div className="grid sm:grid-cols-2 gap-4">
              {PERSONALITY_TRAITS.map((trait) => (
                <div key={trait.key} className="space-y-2">
                  <div className="flex items-center justify-between"><Label className="text-sm">{trait.label}</Label><span className="text-sm text-muted-foreground">{data.personality?.[trait.key] ?? 0}/5</span></div>
                  <input type="range" min={0} max={5} value={data.personality?.[trait.key] ?? 0} onChange={(e) => updatePersonality(trait.key, Number(e.target.value))} className="w-full accent-violet" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>الاتجاهات المؤسسية المفضّلة</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Minimal", "Luxury", "Modern", "Editorial", "Corporate", "Playful", "Organic", "Futuristic", "Heritage"].map((v) => {
                  const selected = data.visualPreferences?.includes(v);
                  return (
                    <button key={v} type="button" onClick={() => { const current = data.visualPreferences ?? []; update("visualPreferences", selected ? current.filter((x) => x !== v) : [...current, v]); }} className={`px-3 py-2 rounded-lg text-sm transition-colors ${selected ? "bg-violet text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{v}</button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {currentStep.id === "preferences" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="preferredColors">ألوان مرغوبة</Label><Input id="preferredColors" value={(data.preferredColors ?? []).join("، ")} onChange={(e) => update("preferredColors", e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean))} placeholder="مثال: بنفسجي، ذهبي" /></div>
              <div className="space-y-2"><Label htmlFor="forbiddenColors">ألوان ممنوعة</Label><Input id="forbiddenColors" value={(data.forbiddenColors ?? []).join("، ")} onChange={(e) => update("forbiddenColors", e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean))} placeholder="مثال: أحمر صريح" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="additionalNotes">ملاحظات إضافية</Label><Textarea id="additionalNotes" value={data.additionalNotes ?? ""} onChange={(e) => update("additionalNotes", e.target.value)} rows={4} maxLength={5000} /></div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" nativeButton={false} onClick={prev} disabled={step === 0}><ArrowLeft className="size-4 rotate-180" />السابق</Button>
        <div className="text-sm text-muted-foreground">الخطوة {step + 1} من {STEPS.length}</div>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>التالي<ArrowLeft className="size-4" /></Button>
        ) : (
          <Button onClick={handleComplete} disabled={isSubmitting}>{isSubmitting ? "جارٍ الحفظ..." : alreadyCompleted ? "حفظ التحديثات" : "إكمال الـBrief"}<CheckCircle2 className="size-4" /></Button>
        )}
      </div>
    </div>
  );
}
