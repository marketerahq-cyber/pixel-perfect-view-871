import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  CircleDollarSign,
  Clock,
  FileText,
  Plus,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/app/status-pill";
import { UsageMeter } from "@/components/app/usage-meter";
import { OnboardingDialog } from "@/components/app/onboarding-dialog";
import { formatMoney } from "@/lib/currency";
import { daysOverdue } from "@/lib/invoice-status";
import {
  useDefaultCurrency,
  useInvoices,
  usePayments,
  useReminderLogs,
  type InvoiceWithClient,
} from "@/lib/app-data";
import { useQuickReminder } from "@/lib/use-quick-reminder";

const TITLE = "Dashboard | Reach by MarketEra";
const DESCRIPTION =
  "Track outstanding invoices, overdue amounts and payment activity in one calm view.";

export const Route = createFileRoute("/_authenticated/dashboard")({
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
  component: DashboardPage,
});

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function DashboardPage() {
  const { data: invoices, isLoading } = useInvoices();
  const { data: payments } = usePayments();
  const { data: logs } = useReminderLogs();
  const currency = useDefaultCurrency();
  const { sendNow, isPending } = useQuickReminder();

  const list = useMemo(() => invoices ?? [], [invoices]);

  const stats = useMemo(() => {
    const outstanding = list
      .filter((i) => ["sent", "viewed", "overdue"].includes(i.status))
      .reduce((sum, i) => sum + (Number(i.total) - Number(i.paid_amount ?? 0)), 0);

    const overdue = list
      .filter((i) => i.status === "overdue" || (i.status !== "paid" && i.status !== "draft" && i.status !== "cancelled" && daysOverdue(i.due_date) > 0))
      .reduce((sum, i) => sum + (Number(i.total) - Number(i.paid_amount ?? 0)), 0);

    const now = new Date();
    const paidThisMonth = list
      .filter(
        (i) =>
          i.paid_at &&
          new Date(i.paid_at).getMonth() === now.getMonth() &&
          new Date(i.paid_at).getFullYear() === now.getFullYear(),
      )
      .reduce((sum, i) => sum + Number(i.total), 0);

    const settled = list.filter((i) => i.paid_at);
    const avgDays = settled.length
      ? Math.round(
          settled.reduce(
            (sum, i) =>
              sum +
              Math.max(
                0,
                (new Date(i.paid_at as string).getTime() - new Date(i.issue_date).getTime()) /
                  86_400_000,
              ),
            0,
          ) / settled.length,
        )
      : null;

    return { outstanding, overdue, paidThisMonth, avgDays };
  }, [list]);

  const chartData = useMemo(() => {
    const months: { key: string; label: string; collected: number; invoiced: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: monthKey(d),
        label: d.toLocaleDateString(undefined, { month: "short" }),
        collected: 0,
        invoiced: 0,
      });
    }
    for (const inv of list) {
      const issued = months.find((m) => m.key === monthKey(new Date(inv.issue_date)));
      if (issued) issued.invoiced += Number(inv.total);
      if (inv.paid_at) {
        const paid = months.find((m) => m.key === monthKey(new Date(inv.paid_at as string)));
        if (paid) paid.collected += Number(inv.total);
      }
    }
    return months;
  }, [list]);

  const needsAttention = useMemo(
    () =>
      list
        .filter(
          (i) =>
            ["sent", "viewed", "overdue"].includes(i.status) && daysOverdue(i.due_date) > 0,
        )
        .sort((a, b) => daysOverdue(b.due_date) - daysOverdue(a.due_date))
        .slice(0, 5),
    [list],
  );

  const activity = useMemo(() => {
    type Item = { id: string; at: string; kind: string; text: string };
    const items: Item[] = [];
    for (const inv of list) {
      if (inv.sent_at)
        items.push({
          id: `s-${inv.id}`,
          at: inv.sent_at,
          kind: "sent",
          text: `Invoice ${inv.invoice_number} sent to ${inv.clients?.name ?? "client"}`,
        });
      if (inv.paid_at)
        items.push({
          id: `p-${inv.id}`,
          at: inv.paid_at,
          kind: "paid",
          text: `${formatMoney(Number(inv.total), inv.currency)} received for ${inv.invoice_number}`,
        });
    }
    for (const log of logs ?? [])
      items.push({
        id: `r-${log.id}`,
        at: log.sent_at,
        kind: "reminder",
        text: `${log.step_label ?? "Reminder"} sent for ${log.invoices?.invoice_number ?? "invoice"}`,
      });
    for (const pay of payments ?? [])
      items.push({
        id: `pay-${pay.id}`,
        at: pay.paid_at,
        kind: "paid",
        text: `Payment of ${formatMoney(Number(pay.amount), currency)} recorded`,
      });
    return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 8);
  }, [list, logs, payments, currency]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <OnboardingDialog />
        <Card className="shadow-card border-dashed">
          <CardContent className="flex flex-col items-center gap-5 px-6 py-16 text-center">
            <span className="bg-hero-glow border-accent/20 flex h-20 w-20 items-center justify-center rounded-3xl border">
              <FileText className="text-primary h-8 w-8" />
            </span>
            <div className="max-w-md space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Let's get your first invoice out
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Create an invoice and Reach starts chasing payment for you — a nudge before it's
                due, escalating follow-ups after, across email and SMS.
              </p>
            </div>
            <Button variant="hero" size="lg" asChild data-tour="new-invoice">
              <Link to="/invoices/new">
                <Plus /> Create your first invoice
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <OnboardingDialog />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">{DESCRIPTION}</p>
        </div>
        <Button variant="hero" asChild data-tour="new-invoice">
          <Link to="/invoices/new">
            <Plus /> New invoice
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-tour="stats">
        <StatCard
          icon={Wallet}
          label="Total outstanding"
          value={formatMoney(stats.outstanding, currency)}
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue amount"
          value={formatMoney(stats.overdue, currency)}
          tone={stats.overdue > 0 ? "danger" : "default"}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Paid this month"
          value={formatMoney(stats.paidThisMonth, currency)}
          tone="success"
        />
        <StatCard
          icon={Clock}
          label="Avg. days to pay"
          value={stats.avgDays === null ? "—" : `${stats.avgDays} days`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Cash flow — last 6 months</CardTitle>
            <Link to="/analytics" className="text-accent inline-flex items-center gap-1 text-xs">
              Analytics <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="h-64 pr-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -12, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="collected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={70} />
                <Tooltip
                  formatter={(v: number) => formatMoney(Number(v), currency)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  name="Collected"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fill="url(#collected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <UsageMeter />
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Needs attention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {needsAttention.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nothing overdue. Reach is keeping it that way.
                </p>
              ) : (
                needsAttention.map((inv) => (
                  <AttentionRow
                    key={inv.id}
                    invoice={inv}
                    onSend={() => sendNow(inv)}
                    disabled={isPending}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.length === 0 ? (
            <p className="text-muted-foreground text-sm">Activity shows up here as you send.</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 text-sm">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    item.kind === "paid"
                      ? "bg-success"
                      : item.kind === "reminder"
                        ? "bg-accent"
                        : "bg-info"
                  }`}
                />
                <span className="flex-1">{item.text}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {new Date(item.at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone?: "default" | "danger" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "text-accent bg-accent/10"
      : tone === "success"
        ? "text-success bg-success/10"
        : "text-primary bg-secondary";
  return (
    <Card className="shadow-card">
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium">{label}</p>
          <p className="truncate text-xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AttentionRow({
  invoice,
  onSend,
  disabled,
}: {
  invoice: InvoiceWithClient;
  onSend: () => void;
  disabled: boolean;
}) {
  const over = daysOverdue(invoice.due_date);
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      <div className="min-w-0 flex-1">
        <Link
          to="/invoices/$invoiceId"
          params={{ invoiceId: invoice.id }}
          className="truncate text-sm font-medium hover:underline"
        >
          {invoice.invoice_number} · {invoice.clients?.name ?? "No client"}
        </Link>
        <p className="text-muted-foreground text-xs">
          {formatMoney(Number(invoice.total), invoice.currency)} · {over} days overdue
        </p>
      </div>
      <StatusPill status={invoice.status} className="hidden sm:inline-flex" />
      <Button size="sm" variant="accent" onClick={onSend} disabled={disabled}>
        <BellRing className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Remind</span>
      </Button>
    </div>
  );
}
