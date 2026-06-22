import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, CreditCard, Sparkles, AlertCircle, FileText } from "lucide-react";

export const metadata = { title: "لوحة الإدارة" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  if (!adminEmails.includes(session.user.email ?? "")) {
    return <div className="mx-auto max-w-2xl px-4 py-12"><Card><CardContent className="pt-6 text-center"><AlertCircle className="size-12 text-danger mx-auto mb-4" /><h1 className="text-xl font-semibold mb-2">غير مصرح</h1><p className="text-muted-foreground">هذه الصفحة متاحة للمسؤولين فقط.</p></CardContent></Card></div>;
  }
  const [totalUsers, totalOrgs, totalProjects, activeSubs, totalAiJobs, failedJobs] = await Promise.all([
    prisma.user.count(), prisma.organization.count(), prisma.brandProject.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.aIJob.count(), prisma.aIJob.count({ where: { status: "FAILED" } }),
  ]);
  const stats = [
    { label: "المستخدمون", value: totalUsers, icon: Users, color: "text-violet" },
    { label: "المؤسسات", value: totalOrgs, icon: Building, color: "text-coral" },
    { label: "المشاريع", value: totalProjects, icon: FileText, color: "text-gold" },
    { label: "اشتراكات نشطة", value: activeSubs, icon: CreditCard, color: "text-success" },
    { label: "AI Jobs", value: totalAiJobs, icon: Sparkles, color: "text-violet" },
    { label: "Jobs فاشلة", value: failedJobs, icon: AlertCircle, color: "text-danger" },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8"><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">لوحة الإدارة</h1><p className="mt-2 text-muted-foreground">إدارة SEMAH.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => <Card key={s.label}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle><s.icon className={`size-4 ${s.color}`} /></CardHeader><CardContent><div className="text-3xl font-bold">{s.value}</div></CardContent></Card>)}
      </div>
    </div>
  );
}
