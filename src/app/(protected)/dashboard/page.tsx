import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { OnboardingForm } from "@/components/onboarding-form";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import { Plus, FolderOpen, Sparkles, CreditCard } from "lucide-react";
import { getMockMode } from "@/lib/ai/utils";

export const metadata = { title: "لوحة التحكم" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const [subscription, orgsCount, notifications] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.membership.count({ where: { userId: session.user.id } }),
    prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const needsOnboarding = !session.user.name;
  const mockMode = getMockMode();
  if (needsOnboarding) return <div className="mx-auto max-w-2xl px-4 py-12"><OnboardingForm onComplete={completeOnboardingAction} /></div>;
  const plan = subscription?.plan ?? "free";
  const planLabel = plan === "starter" ? "ستارتر" : plan === "professional" || plan === "pro" ? "احترافي" : plan === "agency" || plan === "business" ? "وكالة" : "مجاني";
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">مرحبًا، {session.user.name} 👋</h1>
          <p className="mt-2 text-muted-foreground">إليك نظرة سريعة على نشاطك في سِمَة</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationsDropdown notifications={notifications.map((n) => ({ id: n.id, title: n.title, message: n.message, read: n.read, createdAt: n.createdAt.toISOString() }))} />
          <Button nativeButton={false} render={<Link href="/dashboard/projects/new" />}><Plus className="size-4" />مشروع جديد</Button>
        </div>
      </div>
      {mockMode && (
        <div className="mb-6 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm flex items-center gap-2">
          <Sparkles className="size-4 text-gold" />
          <span><strong>وضع التجربة (Mock):</strong> النتائج المولّدة تجريبية. اربط مزود AI حقيقي عبر متغيرات البيئة.</span>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المشاريع</CardTitle><FolderOpen className="size-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-3xl font-bold">0</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">عمليات AI</CardTitle><Sparkles className="size-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-3xl font-bold">0</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">الرصيد المتبقي</CardTitle><CreditCard className="size-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-3xl font-bold">100</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">الخطة الحالية</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{planLabel}</div><p className="text-xs text-muted-foreground mt-1">{orgsCount} مساحة عمل</p></CardContent></Card>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center text-center py-16">
          <div className="size-16 rounded-full bg-violet/10 flex items-center justify-center mb-4"><FolderOpen className="size-8 text-violet" /></div>
          <h3 className="text-xl font-semibold mb-2">لا توجد مشاريع بعد</h3>
          <p className="text-muted-foreground mb-6 max-w-md">ابدأ رحلتك في بناء الهوية بإنشاء أول مشروع.</p>
          <Button size="lg" nativeButton={false} render={<Link href="/dashboard/projects/new" />}><Plus className="size-4" />إنشاء أول مشروع</Button>
        </CardContent>
      </Card>
    </div>
  );
}
