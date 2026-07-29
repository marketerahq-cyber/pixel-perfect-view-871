import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/currency";
import {
  useDeleteInvoice,
  useInvoices,
  useUpdateInvoiceStatus,
  type Invoice,
} from "@/lib/app-data";

const TITLE = "Invoices | Reach by MarketEra";
const DESCRIPTION = "Create, send and track every invoice from one place.";

export const Route = createFileRoute("/_authenticated/invoices/")({
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
  component: InvoicesPage,
});

const STATUS_TONE: Record<Invoice["status"], string> = {
  draft: "bg-secondary text-secondary-foreground",
  sent: "bg-info/15 text-info",
  paid: "bg-success/15 text-success",
  overdue: "bg-accent/15 text-accent",
  cancelled: "bg-muted text-muted-foreground",
};

function InvoicesPage() {
  const { data: invoices, isLoading } = useInvoices();
  const updateStatus = useUpdateInvoiceStatus();
  const removeInvoice = useDeleteInvoice();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const rows = useMemo(() => {
    return (invoices ?? []).filter((inv) => {
      const matchesStatus = status === "all" || inv.status === status;
      const haystack = `${inv.invoice_number} ${inv.clients?.name ?? ""}`.toLowerCase();
      return matchesStatus && haystack.includes(query.toLowerCase());
    });
  }, [invoices, query, status]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Invoices</h1>
          <p className="text-muted-foreground mt-1 text-sm">{DESCRIPTION}</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/invoices/new">
            <Plus /> New invoice
          </Link>
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="space-y-5 p-5 md:p-6">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by number or client"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {["all", "draft", "sent", "paid", "overdue", "cancelled"].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s === "all" ? "All statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-14 text-center">
              <span className="bg-secondary text-primary flex h-14 w-14 items-center justify-center rounded-2xl">
                <FileText className="h-6 w-6" />
              </span>
              <div className="max-w-sm space-y-1">
                <h2 className="font-semibold">No invoices yet</h2>
                <p className="text-muted-foreground text-sm">
                  Create your first branded invoice and Reach will handle the follow-up.
                </p>
              </div>
              <Button variant="hero" asChild>
                <Link to="/invoices/new">
                  <Plus /> New invoice
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{inv.clients?.name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(inv.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMoney(Number(inv.total), inv.currency)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={inv.status}
                          onValueChange={(value) =>
                            updateStatus.mutate(
                              { id: inv.id, status: value as Invoice["status"] },
                              { onSuccess: () => toast.success("Status updated") },
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-32 border-0 bg-transparent px-1 shadow-none">
                            <Badge className={`${STATUS_TONE[inv.status]} capitalize`}>
                              {inv.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {["draft", "sent", "paid", "overdue", "cancelled"].map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${inv.invoice_number}`}
                          onClick={() =>
                            removeInvoice.mutate(inv.id, {
                              onSuccess: () => toast.success("Invoice deleted"),
                            })
                          }
                        >
                          <Trash2 className="text-muted-foreground h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
