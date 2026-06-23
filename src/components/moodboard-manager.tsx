"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, AlertCircle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createMoodboardAction, generateMoodboardImagesAction, deleteMoodboardItemAction } from "@/lib/actions/moodboard";

interface Item { id: string; order: number; externalUrl: string | null; caption: string | null; source: string; locked: boolean; }

export function MoodboardManager({ projectId, moodboardId, items, mockMode }: { projectId: string; moodboardId: string | null; items: Item[]; mockMode: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleCreate() { startTransition(async () => { const result = await createMoodboardAction(projectId) as { error?: string; success?: boolean; moodboardId?: string }; if (result?.error) toast.error(result.error); else { toast.success("تم إنشاء Mood Board"); router.refresh(); } }); }
  function handleGenerate() { if (!prompt.trim()) { toast.error("اكتب وصفًا"); return; } setError(null); startTransition(async () => { const result = await generateMoodboardImagesAction(projectId, [prompt.trim()]) as { error?: string; success?: boolean; count?: number; mock?: boolean }; if (result?.error) { setError(result.error); toast.error(result.error); } else { const count = result?.count ?? 1; const isMock = result?.mock; toast.success(isMock ? `تم توليد ${count} صورة (تجريبي)` : `تم توليد ${count} صورة`); setPrompt(""); router.refresh(); } }); }
  function handleDelete(itemId: string) { startTransition(async () => { const result = await deleteMoodboardItemAction(projectId, itemId) as { error?: string; success?: boolean }; if (result?.error) toast.error(result.error); else { toast.success("تم الحذف"); router.refresh(); } }); }

  if (!moodboardId) return <div className="card-premium p-6 text-center"><p className="text-muted-foreground mb-4">لا يوجد Mood Board بعد.</p><Button onClick={handleCreate} disabled={isPending} nativeButton={false}><Sparkles className="size-4" />إنشاء Mood Board</Button></div>;

  return (
    <div className="space-y-6">
      {mockMode && <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-gold" /><span><strong>وضع التجربة:</strong> صور SVG تجريبية. التكلفة: 4 رصيد/صورة.</span></div>}
      {error && <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm flex items-center gap-2"><AlertCircle className="size-4 text-danger" /><span>{error}</span><button onClick={() => setError(null)} className="mr-auto"><X className="size-3.5" /></button></div>}
      <div className="card-premium p-4"><label className="text-sm font-medium mb-2 block">توليد صورة بالذكاء الاصطناعي</label><div className="flex gap-2"><Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="مثال: صورة لإطلالة عربية معاصرة بإضاءة ذهبية" rows={2} className="flex-1" /><Button onClick={handleGenerate} disabled={isPending || !prompt.trim()} className="self-start">{isPending ? "جارٍ..." : <><Sparkles className="size-4" />توليد</>}</Button></div></div>
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card-premium overflow-hidden group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.externalUrl ?? ""} alt={item.caption ?? "Mood board item"} className="w-full aspect-square object-cover" />
              <div className="p-3"><p className="text-xs text-muted-foreground line-clamp-2">{item.caption ?? "بدون تعليق"}</p></div>
              <button onClick={() => handleDelete(item.id)} className="absolute top-2 left-2 size-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="حذف"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>
      ) : <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">Mood Board فارغ. ابدأ بتوليد صور.</div>}
    </div>
  );
}
