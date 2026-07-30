import type { Tables } from "@/integrations/supabase/types";

export type InvoiceStatus = Tables<"invoices">["status"];

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "sent",
  "viewed",
  "overdue",
  "paid",
  "cancelled",
];

/** Status pill tone: 15% tinted fill with full-opacity text of the same hue. */
export const STATUS_TONE: Record<InvoiceStatus, string> = {
  draft: "bg-secondary text-secondary-foreground",
  sent: "bg-info/15 text-info",
  viewed: "bg-violet/15 text-violet",
  overdue: "bg-accent/15 text-accent",
  paid: "bg-success/15 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  overdue: "Overdue",
  paid: "Paid",
  cancelled: "Cancelled",
};

/** Statuses the reminder engine keeps chasing. */
export const CHASEABLE: InvoiceStatus[] = ["sent", "viewed", "overdue"];

export function isOutstanding(status: InvoiceStatus) {
  return CHASEABLE.includes(status);
}

export function daysBetween(from: Date, to: Date) {
  const ms = new Date(to).setHours(0, 0, 0, 0) - new Date(from).setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

/** Positive = overdue by n days, negative = n days until due. */
export function daysOverdue(dueDate: string, today = new Date()) {
  return daysBetween(new Date(dueDate), today);
}
