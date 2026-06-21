import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { plans } from "@/lib/plans";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ManageBillingButton } from "@/components/manage-billing-button";

export const metadata = { title: "Billing" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session?.user?.id ?? "" },
  });

  const currentPlan = subscription?.plan
    ? plans.find((p) => p.id === subscription.plan)
    : null;
  const { success } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
      <p className="mt-2 text-muted-foreground">Manage your subscription</p>

      {success && (
        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
          ✓ Subscription activated successfully!
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{currentPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">
                  ${currentPlan.price}/mo
                </span>
              </div>
              {subscription?.stripeCurrentPeriodEnd && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Renews on
                  </span>
                  <span className="font-medium">
                    {new Date(
                      subscription.stripeCurrentPeriodEnd,
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">
                  {subscription?.status.toLowerCase()}
                </span>
              </div>
              <div className="pt-4">
                <ManageBillingButton />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                You don&apos;t have an active subscription.
              </p>
              <Button nativeButton={false} render={<Link href="/pricing" />}>
                View pricing plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
