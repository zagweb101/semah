"use server";

import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createCheckoutAction(priceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const stripe = getStripe();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: session.user.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: session.user.id },
    success_url: `${process.env.AUTH_URL ?? "http://localhost:3000"}/billing?success=true`,
    cancel_url: `${process.env.AUTH_URL ?? "http://localhost:3000"}/pricing?canceled=true`,
  });

  redirect(checkoutSession.url!);
}

export async function createPortalAction() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const subscription = await import("@/lib/prisma").then((m) =>
    m.prisma.subscription.findUnique({ where: { userId: session.user!.id } }),
  );

  if (!subscription?.stripeCustomerId) {
    redirect("/pricing");
  }

  const stripe = getStripe();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.AUTH_URL ?? "http://localhost:3000"}/billing`,
  });

  redirect(portalSession.url!);
}
