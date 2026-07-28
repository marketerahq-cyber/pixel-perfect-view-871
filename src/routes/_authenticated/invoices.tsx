import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { StageNotice } from "@/components/app/stage-notice";

export const Route = createFileRoute("/_authenticated/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices | Reach by MarketEra" },
      { name: "description", content: "Create, send and track every invoice." },
      { property: "og:title", content: "Invoices | Reach by MarketEra" },
      { property: "og:description", content: "Create, send and track every invoice." },
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
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Invoices</h1>
        <p className="text-muted-foreground mt-1 text-sm">Create, send and track every invoice.</p>
      </div>
      <StageNotice
        icon={{FileText}}
        title="Coming in a later build stage"
        description="The sortable invoice table, filter bar and the two-column invoice builder with live branded preview are built in the next stage."
      />
    </div>
  );
}
