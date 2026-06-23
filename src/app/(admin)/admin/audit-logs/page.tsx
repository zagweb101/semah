import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const metadata = { title: "سجل التدقيق" };
export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "تسجيل دخول", LOGOUT: "تسجيل خروج", REGISTER: "تسجيل حساب",
  PROJECT_CREATED: "إنشاء مشروع", PROJECT_UPDATED: "تحديث مشروع",
  PROJECT_DELETED: "حذف مشروع", MEMBER_INVITED: "دعوة عضو",
  MEMBER_REMOVED: "إزالة عضو", ORG_CREATED: "إنشاء مؤسسة",
  ORG_DELETED: "حذف مؤسسة", STRATEGY_GENERATED: "توليد استراتيجية",
  COLORS_GENERATED: "توليد ألوان", IMAGE_GENERATED: "توليد صورة",
};

export default async function AdminAuditLogsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  if (!adminEmails.includes(session.user.email ?? "")) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card><CardContent className="pt-6 text-center">
          <AlertCircle className="size-12 text-danger mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">غير مصرح</h1>
          <p className="text-muted-foreground">هذه الصفحة متاحة للمسؤولين فقط.</p>
        </CardContent></Card>
      </div>
    );
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } }, organization: { select: { name: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">سجل التدقيق</h1>
        <p className="mt-2 text-muted-foreground">آخر 100 نشاط في النظام.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>الأحداث</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 text-right">الوقت</th>
                <th className="py-2 text-right">المستخدم</th>
                <th className="py-2 text-right">المؤسسة</th>
                <th className="py-2 text-right">الفعل</th>
                <th className="py-2 text-right">المورد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">لا توجد سجلات.</td></tr>
              )}
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString("ar-SA")}</td>
                  <td className="py-3">{log.user?.name ?? log.user?.email ?? "—"}</td>
                  <td className="py-3">{log.organization?.name ?? "—"}</td>
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
