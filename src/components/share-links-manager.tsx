"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Trash2, Plus, Link2 } from "lucide-react";
import { toast } from "sonner";
import { createShareLinkAction, revokeShareLinkAction } from "@/lib/actions/share-links";

interface ShareLink { id: string; token: string; expiresAt: Date | null; allowDownload: boolean; allowComment: boolean; allowApprove: boolean; revokedAt: Date | null; lastAccessedAt: Date | null; createdAt: Date; passwordHash: string | null; }

export function ShareLinksManager({ projectId, links }: { projectId: string; links: ShareLink[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [password, setPassword] = useState("");
  const [allowDownload, setAllowDownload] = useState(false);
  const [allowComment, setAllowComment] = useState(true);
  const [allowApprove, setAllowApprove] = useState(true);

  function handleCreate() { startTransition(async () => { const result = await createShareLinkAction({ projectId, password: password || null, allowDownload, allowComment, allowApprove }) as { error?: string; success?: boolean; token?: string; linkId?: string }; if (result?.error) toast.error(result.error); else { toast.success("تم إنشاء الرابط"); setShowForm(false); setPassword(""); router.refresh(); } }); }
  function handleRevoke(linkId: string) { if (!confirm("هل أنت متأكد؟")) return; startTransition(async () => { const result = await revokeShareLinkAction(projectId, linkId) as { error?: string; success?: boolean }; if (result?.error) toast.error(result.error); else { toast.success("تم إلغاء الرابط"); router.refresh(); } }); }
  function copyLink(token: string) { navigator.clipboard.writeText(`${window.location.origin}/share/${token}`); toast.success("تم نسخ الرابط"); }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">أنشئ روابط آمنة لمشاركة المشروع مع العميل.</p><Button size="sm" nativeButton={false} onClick={() => setShowForm(!showForm)}><Plus className="size-4" />رابط جديد</Button></div>
      {showForm && (
        <div className="rounded-xl border border-border p-4 space-y-3">
          <div className="space-y-1"><Label className="text-xs">كلمة مرور (اختياري)</Label><Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="اتركها فارغة بدون كلمة مرور" /></div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowDownload} onChange={(e) => setAllowDownload(e.target.checked)} className="accent-violet" />السماح بالتنزيل</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowComment} onChange={(e) => setAllowComment(e.target.checked)} className="accent-violet" />السماح بالتعليق</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowApprove} onChange={(e) => setAllowApprove(e.target.checked)} className="accent-violet" />السماح بالاعتماد</label>
          </div>
          <Button onClick={handleCreate} disabled={isPending} size="sm">{isPending ? "جارٍ..." : "إنشاء الرابط"}</Button>
        </div>
      )}
      {links.length === 0 ? <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">لا توجد روابط مشاركة بعد.</div> : (
        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.id} className="rounded-xl border border-border p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0"><Link2 className="size-4 text-violet flex-shrink-0" /><div className="min-w-0"><div className="text-sm font-mono truncate">/share/{link.token.slice(0, 16)}...</div><div className="text-xs text-muted-foreground flex items-center gap-2">{link.revokedAt && <span className="text-danger">ملغي</span>}{link.allowComment && <span>تعليق</span>}{link.allowApprove && <span>اعتماد</span>}{link.allowDownload && <span>تنزيل</span>}{link.passwordHash && <span>محمي</span>}</div></div></div>
              <div className="flex items-center gap-1 flex-shrink-0"><button onClick={() => copyLink(link.token)} className="size-8 rounded-lg hover:bg-muted flex items-center justify-center" title="نسخ"><Copy className="size-3.5" /></button>{!link.revokedAt && <button onClick={() => handleRevoke(link.id)} className="size-8 rounded-lg hover:bg-danger/10 hover:text-danger flex items-center justify-center" title="إلغاء"><Trash2 className="size-3.5" /></button>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
