"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { generateLogoConceptsAction } from "@/lib/actions/logo-concepts";

export function LogoGenerator({ projectId, hasExisting, mockMode }: { projectId: string; hasExisting: boolean; mockMode: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function handleGenerate() { setError(null); startTransition(async () => { const result = await generateLogoConceptsAction(projectId); if (result && "error" in result) { setError(result.error ?? "خطأ"); toast.error(result.error ?? "خطأ"); } else { toast.success(result!.mock ? `تم توليد ${result!.count} مفاهيم (تجريبي)` : `تم توليد ${result!.count} مفاهيم`); router.refresh(); } }); }
  return (
    <div className="space-y-4">
      {mockMode && <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-gold" /><span><strong>وضع التجربة</strong></span></div>}
      {error && <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-danger" /><span>{error}</span></div>}
      <div className="flex items-center gap-3">
        <Button onClick={handleGenerate} disabled={isPending} size="lg">{isPending ? <><RefreshCw className="size-4 animate-spin" />جارٍ التوليد...</> : hasExisting ? <><RefreshCw className="size-4" />إعادة توليد المفاهيم</> : <><Sparkles className="size-4" />توليد مفاهيم الشعار</>}</Button>
        {hasExisting && !isPending && <span className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="size-3 text-success" />المفاهيم جاهزة</span>}
        <span className="text-xs text-muted-foreground">التكلفة: 6 رصيد</span>
      </div>
      <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-muted-foreground">⚠️ المعاينات المولّدة هي <strong>Concept Previews</strong> تجريبية وليست ملفات Vector نهائية.</div>
    </div>
  );
}
