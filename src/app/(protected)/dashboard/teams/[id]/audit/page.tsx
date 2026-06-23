import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "سجل نشاط الفريق" };
export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "تسجيل دخول", LOGOUT: "تسجيل خروج", REGISTER: "تسجيل حساب",
  PROJECT_CREATED: "إنشاء مشروع", PROJECT_UPDATED: "تحديث مشروع",
  PROJECT_DELETED: "حذف مشروع", MEMBER_INVITED: "دعوة عضو",
  MEMBER_REMOVED: "إزالة عضو", ORG_CREATED: "إنشاء مؤسسة",
  ORG_DELETED: "حذف مؤسسة", STRATEGY_GENERATED: "توليد استراتيجية",
  COLORS_GENERATED: "توليد ألوان", IMAGE_GENERATED: "توليد صورة",
};

export default async function TeamAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return notFound();
  const { id } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: id } },
    include: { organization: true },
  });
  if (!membership) return notFound();
  if (!["OWNER", "ADMIN"].includes(membership.role)) return notFound();

  const logs = await prisma.auditLog.findMany({
    where: { organizationId: id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      <Link href={`/dashboard/teams/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />العودة للفريق</Link>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">سجل نشاط {membership.organization.name}</h1>
        <p className="mt-2 text-muted-foreground">آخر 100 نشاط داخل المؤسسة.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>الأحداث</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 text-right">الوقت</th>
                <th className="py-2 text-right">المستخدم</th>
                <th className="py-2 text-right">الفعل</th>
                <th className="py-2 text-right">المورد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">لا توجد سجلات.</td></tr>
              )}
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString("ar-SA")}</td>
                  <td className="py-3">{log.user?.name ?? log.user?.email ?? "—"}</td>
                  <td className="py-3"><span className="font-medium">{ACTION_LABELS[log.action] ?? log.action}</span></td>
                  <td className="py-3 text-muted-foreground">{log.resourceType}{log.resourceId ? ` #${log.resourceId.slice(-6)}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
