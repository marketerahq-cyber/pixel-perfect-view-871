import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, detectCurrency, formatMoney } from "@/lib/currency";
import {
  computeTotals,
  nextInvoiceNumber,
  useClients,
  useCreateInvoice,
  useInvoices,
  useProfile,
  type DraftItem,
} from "@/lib/app-data";

const TITLE = "New invoice | Reach by MarketEra";
const DESCRIPTION = "Build a branded invoice with live preview and automatic follow-up.";

export const Route = createFileRoute("/_authenticated/invoices/new")({
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
  component: NewInvoicePage,
});

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function NewInvoicePage() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: clients } = useClients();
  const { data: invoices } = useInvoices();
  const createInvoice = useCreateInvoice();

  const [clientId, setClientId] = useState<string>("");
  const [currency, setCurrency] = useState<string>("");
  const [number, setNumber] = useState("");
  const [issueDate, setIssueDate] = useState(toISODate(new Date()));
  const [dueDate, setDueDate] = useState(toISODate(new Date(Date.now() + 14 * 864e5)));
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);

  // Currency follows the saved preference, otherwise the user's location.
  useEffect(() => {
    if (currency) return;
    setCurrency(profile?.currency_default ?? detectCurrency() ?? "NGN");
  }, [profile, currency]);

  useEffect(() => {
    if (number || !invoices) return;
    setNumber(
      nextInvoiceNumber(
        profile?.invoice_number_format ?? "INV-{0000}",
        invoices.map((i) => i.invoice_number),
      ),
    );
  }, [invoices, profile, number]);

  const totals = useMemo(
    () => computeTotals(items, taxRate, discount),
    [items, taxRate, discount],
  );

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function submit(status: "draft" | "sent") {
    if (!number.trim()) return toast.error("Give the invoice a number.");
    if (!items.some((i) => i.description.trim())) return toast.error("Add at least one line item.");

    createInvoice.mutate(
      {
        client_id: clientId || null,
        invoice_number: number.trim(),
        currency: currency || "NGN",
        issue_date: issueDate,
        due_date: dueDate,
        notes: notes.trim() || null,
        tax_rate: taxRate,
        discount,
        status,
        items,
      },
      {
        onSuccess: () => {
          toast.success(status === "sent" ? "Invoice created and marked sent" : "Draft saved");
          navigate({ to: "/invoices" });
        },
        onError: (error: unknown) =>
          toast.error(error instanceof Error ? error.message : "Could not save the invoice"),
      },
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate({ to: "/invoices" })}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">New invoice</h1>
            <p className="text-muted-foreground mt-1 text-sm">{DESCRIPTION}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outlineBrand" onClick={() => submit("draft")} disabled={createInvoice.isPending}>
            Save draft
          </Button>
          <Button variant="hero" onClick={() => submit("sent")} disabled={createInvoice.isPending}>
            Create & send
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="shadow-card">
          <CardContent className="space-y-5 p-5 md:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {(clients ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Invoice number</Label>
                <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue">Issue date</Label>
                <Input id="issue" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due">Due date</Label>
                <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} · {c.code} — {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  Preset from your location. Change it any time per invoice.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Line items</Label>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_4.5rem_6.5rem_2.5rem] gap-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                  />
                  <Input
                    type="number"
                    min={0}
                    aria-label="Quantity"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    min={0}
                    aria-label="Unit price"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove line"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="text-muted-foreground h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="soft"
                size="sm"
                onClick={() => setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }])}
              >
                <Plus /> Add line
              </Button>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tax">Tax rate (%)</Label>
                <Input id="tax" type="number" min={0} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount</Label>
                <Input id="discount" type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, thank-you note…" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lift h-fit overflow-hidden border-0 p-0">
          <div className="bg-gradient-navy text-primary-foreground px-6 py-5">
            <p className="text-xs tracking-[0.18em] uppercase opacity-80">
              {profile?.business_name || "Your business"}
            </p>
            <p className="mt-1 text-lg font-semibold">{number || "INV-0001"}</p>
          </div>
          <CardContent className="space-y-4 p-6">
            <div className="text-sm">
              <p className="text-muted-foreground text-xs">Billed to</p>
              <p className="font-medium">
                {clients?.find((c) => c.id === clientId)?.name ?? "No client selected"}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              {items
                .filter((i) => i.description.trim())
                .map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {item.description} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatMoney(item.quantity * item.unit_price, currency || "NGN")}
                    </span>
                  </div>
                ))}
              {!items.some((i) => i.description.trim()) && (
                <p className="text-muted-foreground text-sm">Line items appear here as you type.</p>
              )}
            </div>
            <Separator />
            <div className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatMoney(totals.subtotal, currency || "NGN")} />
              <Row label={`Tax (${taxRate}%)`} value={formatMoney(totals.tax, currency || "NGN")} />
              <Row label="Discount" value={`− ${formatMoney(discount, currency || "NGN")}`} />
              <div className="flex justify-between pt-2 text-base font-semibold">
                <span>Total due</span>
                <span>{formatMoney(totals.total, currency || "NGN")}</span>
              </div>
            </div>
            <div className="bg-secondary text-muted-foreground rounded-xl px-4 py-3 text-xs leading-relaxed">
              Due {new Date(dueDate).toLocaleDateString()} · Reach will follow up automatically
              before and after this date.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
