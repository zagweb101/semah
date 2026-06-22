import Stripe from "stripe";
import { PLANS_ARRAY, getPlanByStripePriceId, type PlanConfig } from "@/lib/plans";
export { PLANS_ARRAY as plans, getPlanByStripePriceId as getPlanByPriceId, type PlanConfig as Plan };

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  return _stripe;
}
