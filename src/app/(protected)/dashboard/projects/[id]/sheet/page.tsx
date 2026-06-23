import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, FileText } from "lucide-react";
import { BrandAssetGenerator } from "@/components/brand-asset-generator";
import { generateBrandSheetAction, getBrandSheetAction } from "@/lib/actions/brand-book";
import { getMockMode } from "@/lib/ai/utils";

export const metadata = { title: "Brand Sheet" };
export const dynamic = "force-dynamic";

export default async function BrandSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: projectId } = await params;
  const project = await prisma.brandProject.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true, nameAr: true, organizationId: true } });
  if (!project) notFound();
  const sheet = await getBrandSheetAction(project.id);
  const mockMode = getMockMode();
  const data = sheet?.data as Record<string, unknown> | undefined;
  const fields = (data?.fields ?? {}) as Record<string, unknown>;
  const primaryColor = fields.primaryColor as string | undefined;
  const secondaryColor = fields.secondaryColor as string | undefined;
  const accentColor = fields.accentColor as string | undefined;
  const arabicFont = fields.arabicFont as string | undefined;
  const englishFont = fields.englishFont as string | undefined;
  const personality = (fields.personality as string[] | undefined) ?? [];
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      <Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />العودة للمشروع</Link>
      <div className="mb-8"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><FileText className="size-4 text-violet" /><span>Brand Sheet</span></div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Brand Sheet — {project.nameAr}</h1><p className="mt-2 text-muted-foreground">صفحة ملخص قابلة للتصدير.</p></div>
      <div className="card-premium p-6 mb-8"><BrandAssetGenerator projectId={project.id} hasExisting={!!sheet} mockMode={mockMode} cost={2} label="توليد Brand Sheet" generateAction={generateBrandSheetAction} /></div>
      {sheet && data ? (
        <div className="card-premium p-8 space-y-6">
          <div className="text-center pb-6 border-b border-border"><div className="size-20 rounded-2xl bg-gradient-to-br from-violet to-violet-dark flex items-center justify-center mx-auto mb-3"><span className="text-3xl font-bold text-white">{project.nameAr.charAt(0)}</span></div><h2 className="text-2xl font-bold">{project.nameAr}</h2></div>
          {primaryColor && <div><h3 className="text-sm font-medium text-muted-foreground mb-3">الألوان</h3><div className="grid grid-cols-3 gap-3"><div className="text-center"><div className="h-16 rounded-lg mb-1" style={{ backgroundColor: primaryColor }} /><div className="text-xs font-mono">{primaryColor}</div></div><div className="text-center"><div className="h-16 rounded-lg mb-1" style={{ backgroundColor: secondaryColor }} /><div className="text-xs font-mono">{secondaryColor}</div></div><div className="text-center"><div className="h-16 rounded-lg mb-1" style={{ backgroundColor: accentColor }} /><div className="text-xs font-mono">{accentColor}</div></div></div></div>}
          {arabicFont && <div><h3 className="text-sm font-medium text-muted-foreground mb-3">الخطوط</h3><div className="grid sm:grid-cols-2 gap-3"><div className="rounded-lg border border-border p-3"><div className="text-xs text-muted-foreground mb-1">عربي</div><div className="font-medium">{arabicFont}</div></div><div className="rounded-lg border border-border p-3"><div className="text-xs text-muted-foreground mb-1">إنجليزي</div><div className="font-medium" dir="ltr">{englishFont}</div></div></div></div>}
          {personality?.length > 0 && <div><h3 className="text-sm font-medium text-muted-foreground mb-3">شخصية العلامة</h3><div className="flex flex-wrap gap-2">{personality.map((p: string, i: number) => <span key={i} className="px-3 py-1 rounded-full bg-violet/10 text-violet text-sm">{p}</span>)}</div></div>}
          <div className="pt-6 border-t border-border"><a href={`/api/projects/${project.id}/sheet/export`} download className="inline-block px-6 py-2.5 rounded-lg bg-violet text-white font-medium hover:bg-violet-dark transition-colors">تصدير PDF</a></div>
        </div>
      ) : <div className="rounded-2xl border border-dashed border-border p-12 text-center"><div className="size-16 rounded-full bg-violet/10 flex items-center justify-center mx-auto mb-4"><FileText className="size-8 text-violet" /></div><h3 className="text-xl font-semibold mb-2">لا يوجد Brand Sheet بعد</h3><p className="text-muted-foreground max-w-md mx-auto">اضغط على «توليد Brand Sheet» أعلاه.</p></div>}
    </div>
  );
}
