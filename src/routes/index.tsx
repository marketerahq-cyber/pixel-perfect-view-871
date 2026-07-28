import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquareText,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TITLE = "Reach by MarketEra — AI invoice & payment follow-up";
const DESCRIPTION =
  "Reach sends your invoices and chases payment for you — timed email and SMS reminders before, on and after the due date. Start free.";

export const Route = createFileRoute("/")({
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
  component: LandingPage,
});

const stats = [
  { value: "30–40%", label: "fewer late payments from pre-due reminders alone" },
  { value: "56%", label: "more likely to be paid within a week using email + SMS" },
  { value: "3x", label: "more likely to be paid before the due date with automation" },
  { value: "80%", label: "less time spent manually chasing clients" },
];

const steps = [
  {
    icon: FileText,
    title: "Create and send",
    body: "Build a branded invoice in the two-column editor and send it in a click. Your logo, your currency, your numbering.",
  },
  {
    icon: BellRing,
    title: "Reach follows up",
    body: "A reminder before the due date, escalating nudges after it, and a final notice — email and SMS, all automatic.",
  },
  {
    icon: TrendingUp,
    title: "Get paid sooner",
    body: "Watch cash land faster, see which channel works, and know exactly which clients pay on time.",
  },
];

const features = [
  { icon: Clock3, title: "Timed sequences", body: "Steps offset in days before or after the due date, fully editable." },
  { icon: MessageSquareText, title: "Email + SMS", body: "Multi-channel delivery, because SMS gets opened." },
  { icon: Sparkles, title: "Tiva, your guide", body: "A friendly in-app guide so nobody ever feels lost." },
  { icon: CheckCircle2, title: "Payment links", body: "Clients pay from the reminder itself — no back and forth." },
];

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-hero-glow relative overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="border-accent/30 bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> AI follow-up for freelancers & agencies
              </span>
              <h1 className="mt-6 text-4xl leading-[1.05] font-semibold md:text-6xl">
                Stop chasing clients <span className="text-gradient-brand">for money.</span>
              </h1>
              <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
                Reach sends your invoices and then does the awkward part for you — reminders before
                the due date, escalating nudges after it, and a final notice. Professionally,
                consistently, every single time.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/signup">
                    Start free <ArrowRight />
                  </Link>
                </Button>
                <Button variant="outlineBrand" size="xl" asChild>
                  <Link to="/pricing">See pricing</Link>
                </Button>
              </div>
              <p className="text-muted-foreground mt-4 text-xs">
                Free plan includes 6 invoices a month. No card required.
              </p>
            </div>

            <Card className="shadow-lift overflow-hidden border-0 p-0">
              <div className="bg-gradient-navy text-primary-foreground px-6 py-5">
                <p className="text-xs tracking-[0.18em] uppercase opacity-80">Follow-up sequence</p>
                <p className="mt-1 text-lg font-semibold">INV-0043 · ₦450,000</p>
              </div>
              <CardContent className="space-y-4 p-6">
                {[
                  { label: "3 days before due", channel: "Email", tone: "text-info" },
                  { label: "On the due date", channel: "Email + SMS", tone: "text-violet" },
                  { label: "7 days overdue", channel: "Email + SMS", tone: "text-accent" },
                  { label: "Payment received", channel: "Marked paid", tone: "text-success" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className={`bg-current/15 ${row.tone} h-2.5 w-2.5 rounded-full bg-current`} />
                    <span className="text-sm font-medium">{row.label}</span>
                    <span className="text-muted-foreground ml-auto text-xs">{row.channel}</span>
                  </div>
                ))}
                <div className="bg-secondary text-muted-foreground rounded-xl px-4 py-3 text-xs leading-relaxed">
                  “Hi Ada, a quick reminder that invoice INV-0043 for ₦450,000 is due on Friday.
                  You can pay here — thank you!”
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-y">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.value}>
                <p className="text-primary text-3xl font-semibold">{s.value}</p>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20">
          <h2 className="text-3xl font-semibold md:text-4xl">How Reach works</h2>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Three steps. Then you go back to doing the work you actually get paid for.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Card key={step.title} className="shadow-card">
                <CardContent className="space-y-4 p-7">
                  <div className="flex items-center gap-3">
                    <span className="bg-secondary text-primary flex h-11 w-11 items-center justify-center rounded-xl">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <span className="text-muted-foreground text-xs font-semibold tracking-[0.16em]">
                      STEP {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-secondary/40 border-y">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="bg-card shadow-card rounded-2xl p-6">
                <f.icon className="text-accent h-5 w-5" />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-20">
          <div className="bg-gradient-navy text-primary-foreground shadow-lift rounded-3xl px-8 py-14 text-center md:px-16">
            <h2 className="text-3xl font-semibold md:text-4xl">Get paid without the awkwardness</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed opacity-85 md:text-base">
              Most late payments come from forgetfulness, not inability to pay. Reach removes the
              forgetting.
            </p>
            <Button variant="hero" size="xl" className="mt-8" asChild>
              <Link to="/signup">
                Start free <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
