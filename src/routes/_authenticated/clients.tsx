import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { StageNotice } from "@/components/app/stage-notice";

export const Route = createFileRoute("/_authenticated/clients")({
  head: () => ({
    meta: [
      { title: "Clients | Reach by MarketEra" },
      { name: "description", content: "Client profiles, history and reliability badges." },
      { property: "og:title", content: "Clients | Reach by MarketEra" },
      { property: "og:description", content: "Client profiles, history and reliability badges." },
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
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Clients</h1>
        <p className="text-muted-foreground mt-1 text-sm">Client profiles, history and reliability badges.</p>
      </div>
      <StageNotice
        icon={Users}
        title="Coming in a later build stage"
        description="Client list, payment history and per-client reminder overrides are built in the next stage."
      />
    </div>
  );
}
