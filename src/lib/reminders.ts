import type { Tables } from "@/integrations/supabase/types";
import { formatMoney } from "@/lib/currency";
import { daysOverdue } from "@/lib/invoice-status";

export type ReminderChannel = "email" | "sms" | "both";

export type ReminderStep = {
  offset_days: number;
  channel: ReminderChannel;
  label: string;
  template: string;
};

export const MERGE_FIELDS = [
  "{client_name}",
  "{invoice_number}",
  "{amount}",
  "{due_date}",
  "{days_overdue}",
  "{business_name}",
] as const;

/** Spec default sequence: polite pre-due nudge escalating to a final notice. */
export const DEFAULT_STEPS: ReminderStep[] = [
  {
    offset_days: -3,
    channel: "email",
    label: "3 days before due",
    template:
      "Hi {client_name}, a friendly heads-up that invoice {invoice_number} for {amount} is due on {due_date}. No action needed if it's already scheduled. — {business_name}",
  },
  {
    offset_days: 0,
    channel: "both",
    label: "On the due date",
    template:
      "Hi {client_name}, invoice {invoice_number} for {amount} is due today. Here's the payment link so you can settle it in a couple of taps. Thank you! — {business_name}",
  },
  {
    offset_days: 7,
    channel: "both",
    label: "7 days overdue",
    template:
      "Hi {client_name}, invoice {invoice_number} for {amount} is now {days_overdue} days past due. Could you let us know when payment will go out? — {business_name}",
  },
  {
    offset_days: 30,
    channel: "both",
    label: "Final notice — 30 days overdue",
    template:
      "{client_name}, invoice {invoice_number} for {amount} is {days_overdue} days overdue. This is our final notice before the account is escalated for recovery. Please settle today. — {business_name}",
  },
];

/** Free plan: one fixed, non-customisable step. */
export const FREE_STEP: ReminderStep[] = [
  {
    offset_days: 3,
    channel: "email",
    label: "3 days overdue",
    template:
      "Hi {client_name}, invoice {invoice_number} for {amount} was due on {due_date}. Here's the payment link — thank you! — {business_name}",
  },
];

export function stepLabel(offset: number) {
  if (offset < 0) return `${Math.abs(offset)} day${Math.abs(offset) === 1 ? "" : "s"} before due`;
  if (offset === 0) return "On the due date";
  return `${offset} day${offset === 1 ? "" : "s"} overdue`;
}

export function parseSteps(value: unknown): ReminderStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is ReminderStep => !!s && typeof s === "object" && "offset_days" in s)
    .map((s) => ({
      offset_days: Number(s.offset_days) || 0,
      channel: (["email", "sms", "both"].includes(s.channel) ? s.channel : "email") as ReminderChannel,
      label: s.label || stepLabel(Number(s.offset_days) || 0),
      template: s.template || "",
    }))
    .sort((a, b) => a.offset_days - b.offset_days);
}

type Invoice = Tables<"invoices">;

export function renderTemplate(
  template: string,
  ctx: {
    invoice: Pick<Invoice, "invoice_number" | "total" | "currency" | "due_date">;
    clientName: string;
    businessName: string;
  },
) {
  const over = daysOverdue(ctx.invoice.due_date);
  return template
    .replaceAll("{client_name}", ctx.clientName || "there")
    .replaceAll("{invoice_number}", ctx.invoice.invoice_number)
    .replaceAll("{amount}", formatMoney(Number(ctx.invoice.total), ctx.invoice.currency))
    .replaceAll("{due_date}", new Date(ctx.invoice.due_date).toLocaleDateString())
    .replaceAll("{days_overdue}", String(Math.max(0, over)))
    .replaceAll("{business_name}", businessNameOr(ctx.businessName));
}

function businessNameOr(name: string) {
  return name?.trim() ? name : "Your Reach account";
}

/**
 * Steps that are due today for an invoice: today's offset from due date has
 * reached the step's offset and that step has not been logged yet.
 */
export function dueSteps(
  invoice: Pick<Invoice, "due_date" | "status" | "reminders_paused">,
  steps: ReminderStep[],
  sentStepIndexes: number[],
  today = new Date(),
) {
  if (invoice.reminders_paused) return [];
  if (!["sent", "viewed", "overdue"].includes(invoice.status)) return [];
  const offsetToday = daysOverdue(invoice.due_date, today);
  return steps
    .map((step, index) => ({ step, index }))
    .filter(({ step, index }) => offsetToday >= step.offset_days && !sentStepIndexes.includes(index));
}

export const CHANNEL_LABEL: Record<ReminderChannel, string> = {
  email: "Email",
  sms: "SMS",
  both: "Email + SMS",
};
