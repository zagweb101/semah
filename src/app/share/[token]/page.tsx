import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { validateShareLinkAction } from "@/lib/actions/share-links";
import { ClientPortal, PasswordGate } from "@/components/client-portal";
import { Sparkles, Layers, Palette, Type } from "lucide-react";
import type { BrandStrategyOutput } from "@/lib/ai/schemas/brand-strategy-output";
import type { VisualDirectionOutput } from "@/lib/ai/schemas/visual-direction-output";

export const metadata = { title: "مراجعة المشروع", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ShareTokenPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ pw?: string }> }) {
  const { token } = await params;
  const { pw } = await searchParams;
  const result = await validateShareLinkAction(token, pw);
  if (result && "error" in result) { if (result.needsPassword) return <PasswordGate token={token} />; notFound(); }
  const { link, project } = result!;
  const [strategy, directions, palette, typography, comments, approval] = await Promise.all([
    prisma.brandStrategy.findFirst({ where: { brandProjectId: project.id, isCurrent: true }, select: { data: true, version: true } }),
    prisma.visualDirection.findMany({ where: { brandProjectId: project.id, isCurrent: true }, select: { id: true, data: true, status: true } }),
    prisma.colorPalette.findFirst({ where: { brandProjectId: project.id, isCurrent: true }, include: { swatches: true } }),
    prisma.typographySystem.findFirst({ where: { brandProjectId: project.id, isCurrent: true }, select: { data: true } }),
    prisma.comment.findMany({ where: { brandProjectId: project.id, authorType: "CLIENT" }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.approval.findFirst({ where: { brandProjectId: project.id, approvedEntityType: "PROJECT" }, orderBy: { createdAt: "desc" } }),
  ]);
  const strategyData = strategy?.data as BrandStrategyOutput | null;
  const approved = !!approval;
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><span className="px-2 py-0.5 rounded-full bg-coral/10 text-coral">بوابة العميل</span></div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{project.nameAr}</h1>{project.nameEn && <p className="text-sm text-muted-foreground" dir="ltr">{project.nameEn}</p>}</div>
      <ClientPortal token={token} allowComment={link.allowComment} allowApprove={link.allowApprove} approvalStatus={approved ? "APPROVED" : "PENDING"} comments={comments.map((c) => ({ id: c.id, authorName: c.authorName, authorType: c.authorType, body: c.body, createdAt: c.createdAt, status: c.status }))} />
      <div className="mt-12 space-y-6">
        {strategyData && <section className="card-premium p-6"><div className="flex items-center gap-2 mb-3"><Sparkles className="size-4 text-violet" /><h2 className="text-lg font-semibold">استراتيجية العلامة</h2></div><div className="space-y-3 text-sm"><div><div className="text-xs font-medium text-muted-foreground mb-1">الرؤية</div><p>{strategyData.vision}</p></div><div><div className="text-xs font-medium text-muted-foreground mb-1">الرسالة</div><p>{strategyData.mission}</p></div></div></section>}
        {directions.length > 0 && <section className="card-premium p-6"><div className="flex items-center gap-2 mb-4"><Layers className="size-4 text-violet" /><h2 className="text-lg font-semibold">الاتجاهات المؤسسية</h2></div><div className="grid gap-4 sm:grid-cols-3">{directions.map((d, i) => { const data = d.data as VisualDirectionOutput["directions"][number]; return <div key={d.id} className={`rounded-lg border p-4 ${d.status === "SELECTED" ? "border-success bg-success/5" : "border-border"}`}><div className="font-medium mb-1">{i + 1}. {data.name}</div><p className="text-xs text-muted-foreground">{data.title}</p></div>; })}</div></section>}
        {palette && palette.swatches.length > 0 && <section className="card-premium p-6"><div className="flex items-center gap-2 mb-4"><Palette className="size-4 text-violet" /><h2 className="text-lg font-semibold">لوحة الألوان</h2></div><div className="grid grid-cols-4 sm:grid-cols-6 gap-3">{palette.swatches.slice(0, 8).map((sw) => <div key={sw.id} className="text-center"><div className="aspect-square rounded-lg mb-1" style={{ backgroundColor: sw.hex }} /><div className="text-xs font-mono">{sw.hex}</div></div>)}</div></section>}
        {typography && typography.data && <section className="card-premium p-6"><div className="flex items-center gap-2 mb-4"><Type className="size-4 text-violet" /><h2 className="text-lg font-semibold">نظام الخطوط</h2></div><div className="space-y-2 text-sm"><div><span className="text-muted-foreground">عربي:</span> <span className="font-medium">{((typography.data as Record<string, unknown>).arabicBodyFont as Record<string, unknown>)?.family as string ?? "—"}</span></div></div></section>}
      </div>
      <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground"><p>SEMAH AI Brand Studio · بوابة العميل</p><p className="mt-1">هذه الصفحة غير مفهرسة</p></div>
    </div>
  );
}
