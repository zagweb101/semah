"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { generateBrandStrategyAction } from "@/lib/actions/strategy";

interface StrategyGeneratorProps { projectId: string; hasExistingStrategy: boolean; mockMode: boolean; }

export function StrategyGenerator({ projectId, hasExistingStrategy, mockMode }: StrategyGeneratorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateBrandStrategyAction(projectId);
      if (result && "error" in result) { setError(result.error ?? "حدث خطأ"); toast.error(result.error ?? "حدث خطأ"); }
      else { toast.success(result!.mock ? "تم توليد الاستراتيجية (وضع التجربة)" : `تم توليد الاستراتيجية (الإصدار ${result!.version})`); router.refresh(); }
    });
  }

  return (
    <div className="space-y-4">
      {mockMode && (<div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-gold flex-shrink-0" /><span><strong>وضع التجربة:</strong> النتائج تجريبية.</span></div>)}
      {error && (<div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-danger flex-shrink-0" /><span>{error}</span></div>)}
      <div className="flex items-center gap-3">
        <Button onClick={handleGenerate} disabled={isPending} size="lg">
          {isPending ? <><RefreshCw className="size-4 animate-spin" />جارٍ التوليد...</> : hasExistingStrategy ? <><RefreshCw className="size-4" />إعادة توليد الاستراتيجية</> : <><Sparkles className="size-4" />توليد الاستراتيجية</>}
        </Button>
        {hasExistingStrategy && !isPending && (<span className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="size-3 text-success" />الاستراتيجية جاهزة</span>)}
        <span className="text-xs text-muted-foreground">التكلفة: 5 رصيد</span>
      </div>
      {isPending && (<div className="rounded-xl border border-violet/30 bg-violet/5 px-4 py-3 text-sm"><div className="flex items-center gap-2"><RefreshCw className="size-4 text-violet animate-spin" /><span className="font-medium">جارٍ تحليل المشروع وتوليد الاستراتيجية...</span></div></div>)}
    </div>
  );
}
