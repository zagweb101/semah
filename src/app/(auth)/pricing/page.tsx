import { PricingTable } from "@/components/pricing-table";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Choose the plan that fits your needs. Cancel anytime.
        </p>
      </div>
      <PricingTable />
    </div>
  );
}
