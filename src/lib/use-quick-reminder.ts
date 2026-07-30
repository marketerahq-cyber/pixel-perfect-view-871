import { useCallback } from "react";
import { toast } from "sonner";

import {
  useDefaultSchedule,
  useProfile,
  useReminderLogs,
  useSendReminder,
  type InvoiceWithClient,
} from "@/lib/app-data";
import { planOf } from "@/lib/plan";
import {
  DEFAULT_STEPS,
  FREE_STEP,
  parseSteps,
  renderTemplate,
  type ReminderStep,
} from "@/lib/reminders";
import { daysOverdue } from "@/lib/invoice-status";

/** The steps this account actually runs: saved default, else the plan template. */
export function useActiveSteps(): ReminderStep[] {
  const { data: profile } = useProfile();
  const { schedule } = useDefaultSchedule();
  const plan = planOf(profile?.plan);
  const saved = parseSteps(schedule?.steps);
  if (saved.length) return plan.customSchedule ? saved : saved.slice(0, 1);
  return plan.customSchedule ? DEFAULT_STEPS : FREE_STEP;
}

/**
 * "Send reminder now" — picks the step whose timing best matches today (or the
 * next unsent one), renders its template and logs the delivery.
 */
export function useQuickReminder() {
  const steps = useActiveSteps();
  const { data: profile } = useProfile();
  const { data: logs } = useReminderLogs();
  const send = useSendReminder();

  const sendNow = useCallback(
    (invoice: InvoiceWithClient) => {
      if (!steps.length) {
        toast.error("Add at least one reminder step first.");
        return;
      }
      const sentIndexes = (logs ?? [])
        .filter((l) => l.invoice_id === invoice.id)
        .map((l) => l.step_index);
      const offsetToday = daysOverdue(invoice.due_date);
      const candidates = steps
        .map((step, index) => ({ step, index }))
        .filter(({ index }) => !sentIndexes.includes(index));
      const pick =
        candidates.filter(({ step }) => step.offset_days <= offsetToday).at(-1) ??
        candidates[0] ?? { step: steps[steps.length - 1], index: steps.length - 1 };

      const message = renderTemplate(pick.step.template, {
        invoice,
        clientName: invoice.clients?.name ?? "there",
        businessName: profile?.business_name ?? profile?.full_name ?? "",
      });

      send.mutate(
        {
          invoiceId: invoice.id,
          stepIndex: pick.index,
          stepLabel: pick.step.label,
          channel: pick.step.channel,
          message,
        },
        {
          onSuccess: () =>
            toast.success(`Reminder sent — ${pick.step.label}`, {
              description: message.slice(0, 110) + (message.length > 110 ? "…" : ""),
            }),
          onError: (e) => toast.error(e.message),
        },
      );
    },
    [steps, logs, profile, send],
  );

  return { sendNow, isPending: send.isPending };
}
