import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getPlanByPriceId } from "@/lib/plans";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        const priceId = subscription.items.data[0]?.price?.id;
        const periodEnd = subscription.items.data[0]?.current_period_end;

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: periodEnd
              ? new Date(periodEnd * 1000)
              : null,
            status: "ACTIVE",
            plan: getPlanByPriceId(priceId ?? "")?.id,
          },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: periodEnd
              ? new Date(periodEnd * 1000)
              : null,
            status: "ACTIVE",
            plan: getPlanByPriceId(priceId ?? "")?.id,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        const priceId = subscription.items.data[0]?.price?.id;
        const periodEnd = subscription.items.data[0]?.current_period_end;

        await prisma.subscription.update({
          where: { userId },
          data: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: periodEnd
              ? new Date(periodEnd * 1000)
              : null,
            status: subscription.status.toUpperCase() as never,
            plan: getPlanByPriceId(priceId ?? "")?.id,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        await prisma.subscription.update({
          where: { userId },
          data: {
            status: "CANCELED",
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
