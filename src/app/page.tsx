import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { PricingTable } from "@/components/pricing-table";
import {
  Database,
  CreditCard,
  Users,
  ShieldCheck,
  Moon,
  Zap,
  GitBranch,
  Rocket,
  Mail,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Auth.js v5",
    description: "Google OAuth + credentials, JWT sessions, protected routes",
  },
  {
    icon: Database,
    title: "Prisma 7 + PostgreSQL",
    description: "Type-safe ORM with migrations, seed data, and a client singleton",
  },
  {
    icon: CreditCard,
    title: "Stripe Subscriptions",
    description: "Checkout, billing portal, webhooks, and 3 pricing plans ready",
  },
  {
    icon: Users,
    title: "Teams & Multi-tenancy",
    description: "Organizations, roles (Owner/Admin/Member), and invite system",
  },
  {
    icon: Mail,
    title: "Email (Resend)",
    description: "Welcome and password-reset emails with React Email templates",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    description: "System-aware theme with next-themes and a toggle in the navbar",
  },
  {
    icon: Zap,
    title: "shadcn/ui (Base UI)",
    description: "15+ accessible components with Tailwind v4 and CSS variables",
  },
  {
    icon: GitBranch,
    title: "CI/CD Pipeline",
    description: "GitHub Actions for lint, typecheck, build, and Railway auto-deploy",
  },
  {
    icon: Rocket,
    title: "Railway Deploy Ready",
    description: "Dockerfile, railway.toml, health check, and auto migrations",
  },
];

const faqs = [
  {
    q: "What's included?",
    a: "Next.js 16, Prisma 7, PostgreSQL, Auth.js v5, Stripe subscriptions, teams/multi-tenancy, Resend emails, shadcn/ui, dark mode, rate limiting, CI/CD, and Railway deployment config.",
  },
  {
    q: "Can I use it for multiple projects?",
    a: "Yes — the Unlimited license lets you build as many projects as you want. The Single license covers one project.",
  },
  {
    q: "Do I get updates?",
    a: "Yes, all future updates to the boilerplate are included with your purchase.",
  },
  {
    q: "Is there support?",
    a: "The Pro plan includes 6 months of email support. Otherwise, documentation and README are comprehensive.",
  },
  {
    q: "Can I customize it?",
    a: "Absolutely — the code is yours. Modify, extend, or strip out anything you don't need.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Next.js 16 + Prisma 7 + Tailwind v4
        </div>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
          Ship your SaaS in{" "}
          <span className="text-primary">minutes</span>, not weeks
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          A production-ready Next.js boilerplate with auth, billing, teams,
          emails, and deployment — all pre-configured.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {session ? (
            <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/pricing" />}
              >
                View Pricing
              </Button>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          No credit card required to try the demo
        </p>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need
          </h2>
          <p className="mt-2 text-muted-foreground">
            9 production-grade features out of the box
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <f.icon className="size-6 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-2 text-muted-foreground">
            One-time payment. Use it forever.
          </p>
        </div>
        <PricingTable />
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">FAQ</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h3 className="font-semibold">{faq.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Ready to build your SaaS?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Stop reinventing the wheel. Start shipping today.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
            Get Started Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/pricing" />}
          >
            View Pricing
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          Built with Next Boilerplate — {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
