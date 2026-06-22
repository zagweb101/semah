"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props { projectId: string; hasExisting: boolean; mockMode: boolean; cost: number; label: string; generateAction: (projectId: string) => Promise<{ success?: boolean; error?: string | null; mock?: boolean } | { error: string | null }>; }

export function BrandAssetGenerator({ projectId, hasExisting, mockMode, cost, label, generateAction }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function handleGenerate() { setError(null); startTransition(async () => { const result = await generateAction(projectId); if (result && "error" in result && result.error) { setError(result.error); toast.error(result.error); } else { toast.success("mock" in result && result.mock ? "تم التوليد (تجريبي)" : "تم التوليد بنجاح"); router.refresh(); } }); }
  return (
    <div className="space-y-4">
      {mockMode && <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-gold" /><span><strong>وضع التجربة</strong></span></div>}
      {error && <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-danger" /><span>{error}</span></div>}
      <div className="flex items-center gap-3">
        <Button onClick={handleGenerate} disabled={isPending} size="lg">{isPending ? <><RefreshCw className="size-4 animate-spin" />جارٍ التوليد...</> : hasExisting ? <><RefreshCw className="size-4" />إعادة التوليد</> : <><Sparkles className="size-4" />{label}</>}</Button>
        {hasExisting && !isPending && <span className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="size-3 text-success" />جاهز</span>}
        <span className="text-xs text-muted-foreground">التكلفة: {cost} رصيد</span>
      </div>
    </div>
  );
}
