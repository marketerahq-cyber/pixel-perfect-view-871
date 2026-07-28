import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { StageNotice } from "@/components/app/stage-notice";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Reach by MarketEra" },
      { name: "description", content: "Profile, billing, team and integrations." },
      { property: "og:title", content: "Settings | Reach by MarketEra" },
      { property: "og:description", content: "Profile, billing, team and integrations." },
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
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Profile, billing, team and integrations.</p>
      </div>
      <StageNotice
        icon={Settings}
        title="Coming in a later build stage"
        description="Profile details, plan and usage meters, team seats and integration health are wired up in a later stage."
      />
    </div>
  );
}
