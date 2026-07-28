import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TITLE = "Pricing | Reach by MarketEra";
const DESCRIPTION =
  "Free, Pro and Business plans for Reach. Start with 6 invoices a month free, upgrade for custom reminder schedules, SMS and team seats.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Free",
    price: "₦0",
    cadence: "forever",
    blurb: "Prove that automated follow-up gets you paid.",
    cta: "Start free",
    featured: false,
    points: [
      "6 invoices per month (hard cap)",
      "1 fixed reminder step, email only",
      "Branded invoice template",
      "Payment links",
    ],
  },
  {
    name: "Pro",
    price: "₦9,500",
    cadence: "per month",
    blurb: "For freelancers and small studios running on invoices.",
    cta: "Start free, upgrade anytime",
    featured: true,
    points: [
      "50 invoices per month",
      "Fully custom reminder schedules",
      "Email + SMS delivery",
      "Client reliability insights",
      "Analytics and channel performance",
    ],
  },
  {
    name: "Business",
    price: "₦24,000",
    cadence: "per month",
    blurb: "For agencies with a real receivables pipeline.",
    cta: "Start free, upgrade anytime",
    featured: false,
    points: [
      "Unlimited invoices",
      "Email + SMS + WhatsApp",
      "Up to 5 team seats with roles",
      "Per-client reminder rules",
      "Priority support",
    ],
  },
];

const matrix: { label: string; free: string | boolean; pro: string | boolean; business: string | boolean }[] = [
  { label: "Invoices per month", free: "6", pro: "50", business: "Unlimited" },
  { label: "Reminder steps", free: "1 fixed", pro: "Custom", business: "Custom" },
  { label: "Email reminders", free: true, pro: true, business: true },
  { label: "SMS reminders", free: false, pro: true, business: true },
  { label: "WhatsApp reminders", free: false, pro: false, business: true },
  { label: "Per-client reminder rules", free: false, pro: false, business: true },
  { label: "Analytics", free: false, pro: true, business: true },
  { label: "Team seats", free: "1", pro: "1", business: "Up to 5" },
  { label: "Billing cycle", free: "Monthly, hard cap", pro: "Monthly", business: "Monthly" },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="text-success mx-auto h-4 w-4" />;
  if (value === false) return <Minus className="text-muted-foreground mx-auto h-4 w-4" />;
  return <span className="text-sm">{value}</span>;
}

function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-hero-glow">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 text-center md:py-20">
            <h1 className="text-4xl font-semibold md:text-5xl">Simple plans, faster payments</h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
              Start free. Upgrade when invoice number seven — or a second reminder step — matters
              more than the subscription.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.featured
                    ? "border-accent/40 shadow-lift relative border-2"
                    : "shadow-card relative"
                }
              >
                {plan.featured && (
                  <span className="bg-gradient-pink text-accent-foreground absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-semibold">
                    Most popular
                  </span>
                )}
                <CardContent className="space-y-6 p-7">
                  <div>
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    <p className="text-muted-foreground mt-1 text-sm">{plan.blurb}</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    <span className="text-muted-foreground pb-1 text-sm">{plan.cadence}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.points.map((p) => (
                      <li key={p} className="flex gap-3 text-sm">
                        <Check className="text-accent mt-0.5 h-4 w-4 shrink-0" />
                        <span className="text-muted-foreground">{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.featured ? "hero" : "outlineBrand"}
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link to="/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-20">
          <h2 className="text-2xl font-semibold">Compare every plan</h2>
          <div className="bg-card shadow-card mt-6 overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="bg-secondary/60">
                  <th className="px-5 py-4 text-sm font-semibold">Feature</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold">Free</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold">Pro</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold">Business</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.label} className="border-t">
                    <td className="text-muted-foreground px-5 py-4 text-sm">{row.label}</td>
                    <td className="px-5 py-4 text-center">
                      <Cell value={row.free} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Cell value={row.pro} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Cell value={row.business} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
