"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createCheckoutAction } from "@/lib/actions/stripe";
import { plans } from "@/lib/plans";

export function PricingTable() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <PricingCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function PricingCard({ plan }: { plan: (typeof plans)[number] }) {
  const [_state, formAction, isPending] = useActionState(
    async (_prev: null, formData: FormData) => {
      await createCheckoutAction(formData.get("priceId") as string);
      return null;
    },
    null,
  );

  return (
    <Card
      className={
        plan.highlight
          ? "ring-2 ring-primary relative"
          : "relative"
      }
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Most Popular
        </span>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-4xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground">/mo</span>
        </div>
        <form action={formAction} className="mb-6">
          <input type="hidden" name="priceId" value={plan.stripePriceId} />
          <Button
            type="submit"
            className="w-full"
            variant={plan.highlight ? "default" : "outline"}
            disabled={isPending || !plan.stripePriceId}
          >
            {isPending ? "Redirecting..." : "Subscribe"}
          </Button>
        </form>
        <ul className="space-y-2 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="size-4 text-primary" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
