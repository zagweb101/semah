"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { clientCommentAction, clientApproveAction } from "@/lib/actions/share-links";

interface Props { token: string; projectName: string; allowComment: boolean; allowApprove: boolean; comments: Array<{ id: string; authorName: string; authorType: string; body: string; createdAt: Date; status: string; }>; approvalStatus?: "PENDING" | "APPROVED" | "REJECTED"; }

export function ClientPortal({ token, projectName, allowComment, allowApprove, comments, approvalStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleComment() { if (!comment.trim()) return; setError(null); startTransition(async () => { const result = await clientCommentAction(token, { body: comment.trim() }); if (result && "error" in result) { setError(result.error ?? "خطأ"); toast.error(result.error ?? "خطأ"); } else { toast.success("تم إرسال تعليقك"); setComment(""); router.refresh(); } }); }
  function handleApprove() { if (!confirm("هل أنت متأكد من اعتماد هذا المشروع؟")) return; startTransition(async () => { const result = await clientApproveAction(token, { entityType: "PROJECT", entityId: "", comment: "تم الاعتماد" }); if (result && "error" in result) toast.error(result.error); else { toast.success("تم الاعتماد"); router.refresh(); } }); }

  return (
    <div className="space-y-6">
      {approvalStatus === "APPROVED" && <div className="rounded-xl border border-success/30 bg-success/5 p-4 flex items-center gap-2"><CheckCircle2 className="size-5 text-success" /><span className="font-medium">تم اعتماد هذا المشروع</span></div>}
      {allowComment && (
        <section className="card-premium p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MessageSquare className="size-4 text-violet" />التعليقات</h2>
          <div className="space-y-3 mb-4"><Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب تعليقك..." rows={3} /><Button onClick={handleComment} disabled={isPending || !comment.trim()} size="sm">{isPending ? "جارٍ..." : "إرسال"}</Button></div>
          {error && <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm flex items-center gap-2 mb-4"><AlertCircle className="size-4 text-danger" />{error}</div>}
          {comments.length > 0 ? <div className="space-y-3">{comments.map((c) => <div key={c.id} className="rounded-lg border border-border p-3"><div className="flex items-center gap-2 mb-1 text-xs"><span className={`px-2 py-0.5 rounded-full ${c.authorType === "CLIENT" ? "bg-coral/10 text-coral" : "bg-violet/10 text-violet"}`}>{c.authorType === "CLIENT" ? "عميل" : "فريق"}</span><span className="text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("ar-SA")}</span></div><p className="text-sm">{c.body}</p></div>)}</div> : <p className="text-sm text-muted-foreground text-center py-4">لا توجد تعليقات بعد</p>}
        </section>
      )}
      {allowApprove && approvalStatus !== "APPROVED" && (
        <section className="card-premium p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">اعتماد المشروع</h2>
          <p className="text-sm text-muted-foreground mb-4">بالضغط على الاعتماد، فإنك تؤكد موافقتك على المشروع.</p>
          <Button onClick={handleApprove} disabled={isPending} size="lg" className="bg-success hover:bg-success/90"><CheckCircle2 className="size-4" />اعتماد المشروع</Button>
        </section>
      )}
    </div>
  );
}

export function PasswordGate({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  function handleSubmit(e: React.FormEvent) { e.preventDefault(); window.location.href = `/share/${token}?pw=${encodeURIComponent(password)}`; }
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <form onSubmit={handleSubmit} className="card-premium p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">كلمة مرور مطلوبة</h1>
        <p className="text-sm text-muted-foreground text-center">هذا الرابط محمي بكلمة مرور.</p>
        <div className="space-y-2"><Label htmlFor="pw">كلمة المرور</Label><Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus /></div>
        <Button type="submit" className="w-full">دخول</Button>
      </form>
    </div>
  );
}
