export type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  stripePriceId: string;
  features: string[];
  highlight?: boolean;
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for side projects and small apps",
    price: 9,
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "",
    features: [
      "Up to 100 users",
      "Email support",
      "Community access",
      "1 project",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing SaaS and startups",
    price: 29,
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? "",
    features: [
      "Up to 1,000 users",
      "Priority support",
      "Teams (up to 10 members)",
      "Unlimited projects",
      "Analytics",
    ],
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    description: "For established businesses",
    price: 99,
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_BUSINESS ?? "",
    features: [
      "Unlimited users",
      "Priority support",
      "Unlimited teams",
      "SSO & SAML",
      "SLA guarantee",
    ],
  },
];

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return plans.find((p) => p.stripePriceId === priceId);
}
