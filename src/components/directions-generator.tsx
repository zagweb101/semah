"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { generateVisualDirectionsAction, selectVisualDirectionAction } from "@/lib/actions/visual-directions";

export function DirectionsGenerator({ projectId, hasExisting, mockMode }: { projectId: string; hasExisting: boolean; mockMode: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateVisualDirectionsAction(projectId);
      if (result && "error" in result) { setError(result.error ?? "خطأ"); toast.error(result.error ?? "خطأ"); }
      else { toast.success(result!.mock ? `تم توليد ${result!.count} اتجاهات (تجريبي)` : `تم توليد ${result!.count} اتجاهات`); router.refresh(); }
    });
  }
  return (
    <div className="space-y-4">
      {mockMode && <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-gold" /><span><strong>وضع التجربة</strong></span></div>}
      {error && <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-danger" /><span>{error}</span></div>}
      <div className="flex items-center gap-3">
        <Button onClick={handleGenerate} disabled={isPending} size="lg">{isPending ? <><RefreshCw className="size-4 animate-spin" />جارٍ التوليد...</> : hasExisting ? <><RefreshCw className="size-4" />إعادة توليد الاتجاهات</> : <><Sparkles className="size-4" />توليد الاتجاهات المؤسسية</>}</Button>
        {hasExisting && !isPending && <span className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="size-3 text-success" />الاتجاهات جاهزة</span>}
        <span className="text-xs text-muted-foreground">التكلفة: 8 رصيد</span>
      </div>
    </div>
  );
}

export function DirectionSelector({ projectId, directionId, isSelected }: { projectId: string; directionId: string; isSelected: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  function handleSelect() { startTransition(async () => { const result = await selectVisualDirectionAction(projectId, directionId); if (result && "error" in result) toast.error(result.error); else { toast.success("تم اختيار الاتجاه"); router.refresh(); } }); }
  if (isSelected) return <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium"><CheckCircle2 className="size-3.5" />الاتجاه المختار</span>;
  return <Button variant="outline" size="sm" onClick={handleSelect} disabled={isPending} nativeButton={false}>اختيار هذا الاتجاه</Button>;
}
