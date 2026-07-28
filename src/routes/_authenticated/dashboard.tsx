import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { StageNotice } from "@/components/app/stage-notice";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Reach by MarketEra" },
      {
        name: "description",
        content: "Track outstanding invoices, overdue amounts and payment activity in Reach.",
      },
      { property: "og:title", content: "Dashboard | Reach by MarketEra" },
      {
        property: "og:description",
        content: "Track outstanding invoices, overdue amounts and payment activity in Reach.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your cash position at a glance — stat cards, cash flow chart and the overdue queue land
          here.
        </p>
      </div>
      <StageNotice
        icon={LayoutDashboard}
        title="Dashboard insights arrive in a later stage"
        description="Foundation, auth and the app shell are live. Next up: invoices and clients, then the reminder engine, then this insight layer."
      />
    </div>
  );
}
