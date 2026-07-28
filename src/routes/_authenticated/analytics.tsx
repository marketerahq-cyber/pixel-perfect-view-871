import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { StageNotice } from "@/components/app/stage-notice";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics | Reach by MarketEra" },
      { name: "description", content: "Cash flow, payment speed and channel performance." },
      { property: "og:title", content: "Analytics | Reach by MarketEra" },
      { property: "og:description", content: "Cash flow, payment speed and channel performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Cash flow, payment speed and channel performance.</p>
      </div>
      <StageNotice
        icon={BarChart3}
        title="Coming in a later build stage"
        description="Days-to-pay trends, channel effectiveness and top late payers arrive with the insight layer stage."
      />
    </div>
  );
}
