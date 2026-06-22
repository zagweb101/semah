"use client";
import { useActionState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createCheckoutAction } from "@/lib/actions/stripe";
import { PLANS_ARRAY } from "@/lib/plans";
import type { PlanConfig } from "@/lib/plans";

export function PricingTable() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {PLANS_ARRAY.map((plan) => <PricingCard key={plan.id} plan={plan} />)}
    </div>
  );
}

function PricingCard({ plan }: { plan: PlanConfig }) {
  const [_state, formAction, isPending] = useActionState(async (_prev: null, formData: FormData) => { await createCheckoutAction(formData.get("priceId") as string); return null; }, null);
  const isFree = plan.priceMonthly === 0;
  return (
    <Card className={plan.highlight ? "ring-2 ring-violet relative" : "relative"}>
      {plan.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet px-3 py-1 text-xs font-medium text-white">الأكثر شيوعًا</span>}
      <CardHeader><CardTitle className="text-xl">{plan.nameAr}</CardTitle><CardDescription>{plan.descriptionAr}</CardDescription></CardHeader>
      <CardContent>
        <div className="mb-1"><span className="text-4xl font-bold">${plan.priceMonthly}</span><span className="text-muted-foreground">/شهر</span></div>
        <p className="text-xs text-muted-foreground mb-4">{plan.monthlyCredits} رصيد AI شهريًا</p>
        <form action={formAction} className="mb-6"><input type="hidden" name="priceId" value={plan.stripePriceId} /><Button type="submit" className="w-full" variant={plan.highlight ? "default" : "outline"} disabled={isPending || (!plan.stripePriceId && !isFree)}>{isFree ? "ابدأ مجانًا" : isPending ? "جارٍ التحويل..." : "اشترك الآن"}</Button></form>
        <ul className="space-y-2 text-sm">{plan.featuresAr.map((feature) => <li key={feature} className="flex items-start gap-2"><Check className="size-4 text-violet mt-0.5 flex-shrink-0" /><span className="text-muted-foreground">{feature}</span></li>)}</ul>
      </CardContent>
    </Card>
  );
}
