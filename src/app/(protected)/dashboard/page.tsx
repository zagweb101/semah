import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { OnboardingForm } from "@/components/onboarding-form";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import { Plus, FolderOpen, Sparkles, CreditCard, ArrowLeft, Activity } from "lucide-react";
import { getMockMode } from "@/lib/ai/utils";
import { getPlan } from "@/lib/plans";

export const metadata = { title: "لوحة التحكم" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "مسودة",
  BRIEF_IN_PROGRESS: "جاري تعبئة الـBrief",
  READY_FOR_ANALYSIS: "جاهز للتحليل",
  ANALYZING: "جاري التحليل",
  STRATEGY_READY: "الاستراتيجية جاهزة",
  VISUAL_DIRECTIONS_READY: "الاتجاهات المؤسسية جاهزة",
  INTERNAL_REVIEW: "مراجعة داخلية",
  CLIENT_REVIEW: "مراجعة العميل",
  REVISION_REQUESTED: "طلب تعديل",
  APPROVED: "معتمد",
  DELIVERED: "تم التسليم",
  ARCHIVED: "مؤرشف",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { organization: { include: { creditWallet: true } } },
  });
  const orgIds = memberships.map((m) => m.organizationId);
  const planId = (await prisma.subscription.findUnique({ where: { userId: session.user.id } }))?.plan;
  const plan = getPlan(planId);

  const [projectsCount, aiJobsCount, recentProjects, recentActivities, notifications] = await Promise.all([
    prisma.brandProject.count({ where: { organizationId: { in: orgIds }, archivedAt: null } }),
    prisma.aIJob.count({ where: { organizationId: { in: orgIds } } }),
    prisma.brandProject.findMany({
      where: { organizationId: { in: orgIds }, archivedAt: null },
      include: { organization: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.projectActivity.findMany({
      where: { brandProject: { organizationId: { in: orgIds } } },
      include: { brandProject: { select: { nameAr: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const totalCredits = memberships.reduce((sum, m) => sum + (m.organization.creditWallet?.balance ?? 0), 0);
  const needsOnboarding = !session.user.name;
  const mockMode = getMockMode();

  if (needsOnboarding) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <OnboardingForm onComplete={completeOnboardingAction} />
      </div>
    );
  }

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المشاريع</CardTitle>
            <FolderOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projectsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">من أصل {plan.maxProjects} في خطة {plan.nameAr}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">عمليات AI</CardTitle>
            <Sparkles className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aiJobsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">عمليات توليد ومناقلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الرصيد المتبقي</CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground mt-1">رصيد AI / شهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الخطة الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{plan.nameAr}</div>
            <p className="text-xs text-muted-foreground mt-1">{memberships.length} مساحة عمل</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>المشاريع الحديثة</CardTitle>
              <CardDescription>آخر 5 مشاريع نشاطًا</CardDescription>
            </div>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/dashboard/projects" />}>عرض الكل<ArrowLeft className="size-3" /></Button>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="size-8 mx-auto mb-2 text-violet" />
                <p>لا توجد مشاريع بعد. ابدأ بإنشاء مشروعك الأول.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((p) => (
                  <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-violet/40 hover:bg-violet/5 transition-colors">
                    <div>
                      <div className="font-medium">{p.nameAr}</div>
                      <div className="text-xs text-muted-foreground">{p.organization.name} · {p.updatedAt.toLocaleDateString("ar-SA")}</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-violet/10 text-violet">{STATUS_LABELS[p.status] ?? p.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="size-4 text-violet" />آخر النشاطات</CardTitle>
            <CardDescription>تحديثات على مشاريعك</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد نشاطات بعد.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((a) => (
                  <div key={a.id} className="text-sm border-r-2 border-violet pr-3">
                    <div className="font-medium">{a.brandProject?.nameAr ?? "مشروع"}</div>
                    <div className="text-xs text-muted-foreground">{ACTIVITY_LABELS[a.type] ?? a.type}</div>
                    <div className="text-[10px] text-muted-foreground">{a.createdAt.toLocaleDateString("ar-SA")}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {recentProjects.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center text-center py-16">
            <div className="size-16 rounded-full bg-violet/10 flex items-center justify-center mb-4"><FolderOpen className="size-8 text-violet" /></div>
            <h3 className="text-xl font-semibold mb-2">لا توجد مشاريع بعد</h3>
            <p className="text-muted-foreground mb-6 max-w-md">ابدأ رحلتك في بناء الهوية المؤسسية بإنشاء أول مشروع.</p>
            <Button size="lg" nativeButton={false} render={<Link href="/dashboard/projects/new" />}><Plus className="size-4" />إنشاء أول مشروع</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const ACTIVITY_LABELS: Record<string, string> = {
  CREATED: "تم إنشاء المشروع",
  BRIEF_UPDATED: "تم تحديث الـBrief",
  STRATEGY_GENERATED: "تم توليد الاستراتيجية",
  DIRECTION_SELECTED: "تم اختيار اتجاه بصري",
  PALETTE_GENERATED: "تم توليد لوحة الألوان",
  TYPOGRAPHY_GENERATED: "تم توليد نظام الخطوط",
  MOODBOARD_UPDATED: "تم تحديث Mood Board",
  LOGO_GENERATED: "تم توليد مفاهيم الشعار",
  SHEET_CREATED: "تم إنشاء Brand Sheet",
  BOOK_CREATED: "تم إنشاء Brand Book",
  SHARED: "تم مشاركة المشروع",
  COMMENTED: "تعليق جديد",
  APPROVED: "تم اعتماد عنصر",
  REVISION_REQUESTED: "طلب تعديل جديد",
  STATUS_CHANGED: "تم تغيير حالة المشروع",
  ARCHIVED: "تم أرشفة المشروع",
  RESTORED: "تم استعادة المشروع",
};
