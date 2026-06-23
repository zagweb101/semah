import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PLANS_ARRAY, getPlan, type PlanConfig } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ManageBillingButton } from "@/components/manage-billing-button";

export const metadata = { title: "الفوترة" };
export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const session = await auth();
  const subscription = await prisma.subscription.findUnique({ where: { userId: session?.user?.id ?? "" } });
  const currentPlan: PlanConfig | null = subscription?.plan ? getPlan(subscription.plan) : null;
  const { success } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">الفوترة والاشتراك</h1>
      <p className="mt-2 text-muted-foreground">إدارة اشتراكك ورصيدك</p>
      {success && <div className="mt-6 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm">تم تفعيل اشتراكك بنجاح!</div>}
      <Card className="mt-8"><CardHeader><CardTitle>الخطة الحالية</CardTitle></CardHeader><CardContent>
        {currentPlan && currentPlan.id !== "free" ? (
          <div className="space-y-3"><div className="flex justify-between"><span className="text-muted-foreground">الخطة</span><span className="font-medium">{currentPlan.nameAr}</span></div><div className="flex justify-between"><span className="text-muted-foreground">السعر</span><span className="font-medium">${currentPlan.priceMonthly}/شهر</span></div><div className="pt-4"><ManageBillingButton /></div></div>
        ) : (
          <div className="space-y-4"><p className="text-muted-foreground">أنت على الخطة المجانية. ترقّى لفتح المزيد من المزايا.</p><Button nativeButton={false} render={<Link href="/pricing" />}>عرض الخطط</Button></div>
        )}
      </CardContent></Card>
      <Card className="mt-6"><CardHeader><CardTitle>مقارنة الخطط</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2">{PLANS_ARRAY.map((plan) => <div key={plan.id} className={`rounded-lg border p-4 ${currentPlan?.id === plan.id ? "border-violet bg-violet/5" : "border-border"}`}><div className="font-medium">{plan.nameAr}</div><div className="text-sm text-muted-foreground">${plan.priceMonthly}/شهر</div></div>)}</div></CardContent></Card>
    </div>
  );
}
