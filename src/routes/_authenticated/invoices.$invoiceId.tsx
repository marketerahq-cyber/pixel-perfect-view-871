import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BellRing, CheckCircle2, PauseCircle, PlayCircle, Send } from "lucide-react";
import { toast } from "sonner";

import { StatusPill } from "@/components/app/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/currency";
import { daysOverdue } from "@/lib/invoice-status";
import {
  useInvoice,
  useRecordPayment,
  useReminderLogs,
  useUpdateInvoice,
} from "@/lib/app-data";
import { useQuickReminder } from "@/lib/use-quick-reminder";

const TITLE = "Invoice | Reach by MarketEra";
const DESCRIPTION = "Review an invoice, its follow-up history and payment status.";

export const Route = createFileRoute("/_authenticated/invoices/$invoiceId")({
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
  component: InvoiceDetailPage,
});

function InvoiceDetailPage() {
  const { invoiceId } = Route.useParams();
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const { data: logs } = useReminderLogs(invoiceId);
  const update = useUpdateInvoice();
  const recordPayment = useRecordPayment();
  const { sendNow, isPending } = useQuickReminder();

  if (isLoading) return <Skeleton className="mx-auto h-96 w-full max-w-4xl" />;
  if (!invoice)
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-muted-foreground text-sm">That invoice no longer exists.</p>
        <Button variant="outlineBrand" className="mt-4" asChild>
          <Link to="/invoices">Back to invoices</Link>
        </Button>
      </div>
    );

  const outstanding = Number(invoice.total) - Number(invoice.paid_amount ?? 0);
  const over = daysOverdue(invoice.due_date);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <Link
        to="/invoices"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> All invoices
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{invoice.invoice_number}</h1>
            <StatusPill status={invoice.status} />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {invoice.clients?.name ?? "No client"} · due{" "}
            {new Date(invoice.due_date).toLocaleDateString()}
            {over > 0 && invoice.status !== "paid" ? ` · ${over} days overdue` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {invoice.status === "draft" && (
            <Button
              variant="brand"
              onClick={() =>
                update.mutate(
                  {
                    id: invoice.id,
                    patch: { status: "sent", sent_at: new Date().toISOString() },
                  },
                  { onSuccess: () => toast.success("Invoice sent — follow-ups are now live.") },
                )
              }
            >
              <Send /> Send invoice
            </Button>
          )}
          {["sent", "viewed", "overdue"].includes(invoice.status) && (
            <>
              <Button variant="accent" onClick={() => sendNow(invoice)} disabled={isPending}>
                <BellRing /> Send reminder now
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  update.mutate({
                    id: invoice.id,
                    patch: { reminders_paused: !invoice.reminders_paused },
                  })
                }
              >
                {invoice.reminders_paused ? <PlayCircle /> : <PauseCircle />}
                {invoice.reminders_paused ? "Resume follow-ups" : "Pause follow-ups"}
              </Button>
            </>
          )}
          {invoice.status !== "paid" && invoice.status !== "draft" && (
            <Button
              variant="outlineBrand"
              onClick={() =>
                recordPayment.mutate(
                  { invoice, amount: outstanding },
                  { onSuccess: () => toast.success("Payment recorded — follow-ups stopped.") },
                )
              }
            >
              <CheckCircle2 /> Mark paid
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Line items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {invoice.invoice_items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
              <span className="flex-1">
                {item.description}
                <span className="text-muted-foreground">
                  {" "}
                  × {item.quantity} @ {formatMoney(Number(item.unit_price), invoice.currency)}
                </span>
              </span>
              <span className="font-medium">
                {formatMoney(Number(item.quantity) * Number(item.unit_price), invoice.currency)}
              </span>
            </div>
          ))}
          <div className="space-y-1 border-t pt-3 text-sm">
            <Row label="Subtotal" value={formatMoney(Number(invoice.subtotal), invoice.currency)} />
            {Number(invoice.discount) > 0 && (
              <Row
                label="Discount"
                value={`−${formatMoney(Number(invoice.discount), invoice.currency)}`}
              />
            )}
            {Number(invoice.tax_rate) > 0 && (
              <Row label={`Tax (${invoice.tax_rate}%)`} value={formatMoney(Number(invoice.tax_amount ?? 0), invoice.currency)} />
            )}
            <div className="flex justify-between pt-1 text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(Number(invoice.total), invoice.currency)}</span>
            </div>
            {Number(invoice.paid_amount ?? 0) > 0 && (
              <Row
                label="Outstanding"
                value={formatMoney(outstanding, invoice.currency)}
              />
            )}
          </div>
          {invoice.notes && (
            <p className="text-muted-foreground border-t pt-3 text-sm">{invoice.notes}</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Follow-up history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(logs ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No reminders sent yet. Reach will nudge automatically as the due date approaches.
            </p>
          ) : (
            (logs ?? []).map((log) => (
              <div key={log.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{log.step_label ?? "Reminder"}</p>
                  <span className="text-muted-foreground text-xs">
                    {new Date(log.sent_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{log.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-muted-foreground flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
