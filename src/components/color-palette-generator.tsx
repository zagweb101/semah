"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { generateColorPaletteAction } from "@/lib/actions/colors";

export function ColorPaletteGenerator({ projectId, hasExisting, mockMode }: { projectId: string; hasExisting: boolean; mockMode: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function handleGenerate() { setError(null); startTransition(async () => { const result = await generateColorPaletteAction(projectId); if (result && "error" in result) { setError(result.error ?? "خطأ"); toast.error(result.error ?? "خطأ"); } else { toast.success(result!.mock ? "تم توليد اللوحة (تجريبي)" : "تم توليد لوحة الألوان"); router.refresh(); } }); }
  return (
    <div className="space-y-4">
      {mockMode && <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-gold" /><span><strong>وضع التجربة</strong></span></div>}
      {error && <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-danger" /><span>{error}</span></div>}
      <div className="flex items-center gap-3">
        <Button onClick={handleGenerate} disabled={isPending} size="lg">{isPending ? <><RefreshCw className="size-4 animate-spin" />جارٍ التوليد...</> : hasExisting ? <><RefreshCw className="size-4" />إعادة توليد اللوحة</> : <><Sparkles className="size-4" />توليد لوحة الألوان</>}</Button>
        {hasExisting && !isPending && <span className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="size-3 text-success" />اللوحة جاهزة</span>}
        <span className="text-xs text-muted-foreground">التكلفة: 3 رصيد</span>
      </div>
    </div>
  );
}

export function CopyableHex({ hex }: { hex: string }) {
  return <button onClick={() => { navigator.clipboard.writeText(hex); toast.success(`تم نسخ ${hex}`); }} className="inline-flex items-center gap-1 px-2 py-1 rounded font-mono text-xs hover:bg-muted transition-colors" title="نسخ">{hex}<Copy className="size-3" /></button>;
}
