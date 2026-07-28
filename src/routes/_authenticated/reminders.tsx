import { createFileRoute } from "@tanstack/react-router";
import { BellRing } from "lucide-react";
import { StageNotice } from "@/components/app/stage-notice";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders | Reach by MarketEra" },
      { name: "description", content: "Your automatic follow-up sequences." },
      { property: "og:title", content: "Reminders | Reach by MarketEra" },
      { property: "og:description", content: "Your automatic follow-up sequences." },
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
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Reminders</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your automatic follow-up sequences.</p>
      </div>
      <StageNotice
        icon={BellRing}
        title="Coming in a later build stage"
        description="The schedule editor, message templates with merge fields and the delivery activity log come with the reminder engine stage."
      />
    </div>
  );
}
