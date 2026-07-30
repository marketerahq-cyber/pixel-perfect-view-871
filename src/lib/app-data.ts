import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables, TablesInsert } from "@/integrations/supabase/types";
import { detectCurrency } from "@/lib/currency";

export type Client = Tables<"clients">;
export type Invoice = Tables<"invoices">;
export type InvoiceItem = Tables<"invoice_items">;
export type Profile = Tables<"profiles">;

async function requireUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

/* ---------------- profile (with location-aware currency) ---------------- */

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      // First run: adopt the currency that matches where the user actually is.
      const detected = detectCurrency();
      if (!data.onboarded && detected && detected !== data.currency_default) {
        const { data: updated } = await supabase
          .from("profiles")
          .update({ currency_default: detected })
          .eq("id", userId)
          .select("*")
          .maybeSingle();
        if (updated) return updated;
      }
      return data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const userId = await requireUserId();
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

/** Currency to use for new invoices: saved preference, else location, else NGN. */
export function useDefaultCurrency() {
  const { data: profile } = useProfile();
  return profile?.currency_default ?? detectCurrency() ?? "NGN";
}

/* ---------------- clients ---------------- */

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Client> & { name: string }) => {
      const userId = await requireUserId();
      if (input.id) {
        const { id, ...patch } = input;
        const { error } = await supabase.from("clients").update(patch).eq("id", id);
        if (error) throw error;
        return id;
      }
      const payload: TablesInsert<"clients"> = { ...input, user_id: userId, name: input.name };
      const { data, error } = await supabase.from("clients").insert(payload).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

/* ---------------- invoices ---------------- */

export type InvoiceWithClient = Invoice & { clients: Pick<Client, "id" | "name"> | null };

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, clients(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InvoiceWithClient[];
    },
  });
}

export type DraftItem = { description: string; quantity: number; unit_price: number };

export type CreateInvoiceInput = {
  client_id: string | null;
  invoice_number: string;
  currency: string;
  issue_date: string;
  due_date: string;
  notes: string | null;
  tax_rate: number;
  discount: number;
  status: Invoice["status"];
  items: DraftItem[];
};

export function computeTotals(items: DraftItem[], taxRate: number, discount: number) {
  const subtotal = items.reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_price || 0), 0);
  const tax = (subtotal * (taxRate || 0)) / 100;
  const total = Math.max(0, subtotal + tax - (discount || 0));
  return { subtotal, tax, total };
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateInvoiceInput) => {
      const userId = await requireUserId();
      const { subtotal, total } = computeTotals(input.items, input.tax_rate, input.discount);
      const { data, error } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          client_id: input.client_id,
          invoice_number: input.invoice_number,
          currency: input.currency,
          issue_date: input.issue_date,
          due_date: input.due_date,
          notes: input.notes,
          tax_rate: input.tax_rate,
          discount: input.discount,
          status: input.status,
          subtotal,
          total,
        })
        .select("id")
        .single();
      if (error) throw error;

      const rows = input.items
        .filter((i) => i.description.trim())
        .map((i, index) => ({
          invoice_id: data.id,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          line_total: i.quantity * i.unit_price,
          position: index,
        }));
      if (rows.length) {
        const { error: itemError } = await supabase.from("invoice_items").insert(rows);
        if (itemError) throw itemError;
      }
      return data.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Invoice["status"] }) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

/** Next invoice number using the profile's format, e.g. INV-{0000}. */
export function nextInvoiceNumber(format: string, existing: string[]) {
  const match = format.match(/\{(0+)\}/);
  const pad = match ? match[1].length : 4;
  const prefix = format.split("{")[0] ?? "INV-";
  const highest = existing.reduce((max, num) => {
    const digits = num.replace(prefix, "").match(/\d+/);
    return digits ? Math.max(max, parseInt(digits[0], 10)) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(pad, "0")}`;
}

/* ---------------- single invoice (with items + client) ---------------- */

export type FullInvoice = Invoice & {
  clients: Client | null;
  invoice_items: InvoiceItem[];
};

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, clients(*), invoice_items(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const full = data as unknown as FullInvoice;
      full.invoice_items = [...(full.invoice_items ?? [])].sort((a, b) => a.position - b.position);
      return full;
    },
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Invoice> }) => {
      const { error } = await supabase.from("invoices").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoice", vars.id] });
    },
  });
}

/* ---------------- payments ---------------- */

export type Payment = Tables<"payments">;

export function usePayments(invoiceId?: string) {
  return useQuery({
    queryKey: ["payments", invoiceId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("payments").select("*").order("paid_at", { ascending: false });
      if (invoiceId) q = q.eq("invoice_id", invoiceId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

/** Record a payment; marks the invoice paid (and halts reminders) once fully settled. */
export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      invoice,
      amount,
      method = "manual",
      reference,
    }: {
      invoice: Invoice;
      amount: number;
      method?: string;
      reference?: string | null;
    }) => {
      const userId = await requireUserId();
      const { error } = await supabase.from("payments").insert({
        user_id: userId,
        invoice_id: invoice.id,
        amount,
        method,
        reference: reference ?? null,
      });
      if (error) throw error;

      const paidTotal = Number(invoice.paid_amount ?? 0) + amount;
      const settled = paidTotal + 0.005 >= Number(invoice.total);
      const { error: invErr } = await supabase
        .from("invoices")
        .update({
          paid_amount: paidTotal,
          status: settled ? "paid" : invoice.status,
          paid_at: settled ? new Date().toISOString() : null,
          reminders_paused: settled ? true : invoice.reminders_paused,
        })
        .eq("id", invoice.id);
      if (invErr) throw invErr;

      // Credit the most recent reminder for this invoice with the payment.
      const { data: lastLog } = await supabase
        .from("reminder_logs")
        .select("id")
        .eq("invoice_id", invoice.id)
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastLog) {
        await supabase
          .from("reminder_logs")
          .update({ resulted_in_payment: true })
          .eq("id", lastLog.id);
      }
      return { settled };
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoice", vars.invoice.id] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["reminder-logs"] });
    },
  });
}

/* ---------------- reminder schedules ---------------- */

export type ReminderSchedule = Tables<"reminder_schedules">;

export function useSchedules() {
  return useQuery({
    queryKey: ["reminder-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminder_schedules")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

/** The account-wide default sequence, seeded from the plan template on first read. */
export function useDefaultSchedule() {
  const { data: schedules, isLoading } = useSchedules();
  const schedule = (schedules ?? []).find((s) => s.is_default && !s.invoice_id && !s.client_id);
  return { schedule, isLoading };
}

export function useSaveSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      name?: string;
      steps: Json;
      is_default?: boolean;
      invoice_id?: string | null;
      client_id?: string | null;
    }) => {
      const userId = await requireUserId();
      if (input.id) {
        const { id, ...patch } = input;
        const { error } = await supabase.from("reminder_schedules").update(patch).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("reminder_schedules")
        .insert({
          user_id: userId,
          name: input.name ?? "Default sequence",
          is_default: input.is_default ?? false,
          steps: input.steps,
          invoice_id: input.invoice_id ?? null,
          client_id: input.client_id ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminder-schedules"] }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminder_schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminder-schedules"] }),
  });
}

/* ---------------- reminder logs ---------------- */

export type ReminderLog = Tables<"reminder_logs">;
export type ReminderLogWithInvoice = ReminderLog & {
  invoices: (Pick<Invoice, "id" | "invoice_number" | "total" | "currency" | "status"> & {
    clients: Pick<Client, "id" | "name"> | null;
  }) | null;
};

export function useReminderLogs(invoiceId?: string) {
  return useQuery({
    queryKey: ["reminder-logs", invoiceId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("reminder_logs")
        .select("*, invoices(id, invoice_number, total, currency, status, clients(id, name))")
        .order("sent_at", { ascending: false });
      if (invoiceId) q = q.eq("invoice_id", invoiceId);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as ReminderLogWithInvoice[];
    },
  });
}

/** Send (simulate delivery of) one reminder step and log it. */
export function useSendReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      invoiceId: string;
      stepIndex: number;
      stepLabel: string;
      channel: string;
      message: string;
    }) => {
      const userId = await requireUserId();
      const { error } = await supabase.from("reminder_logs").insert({
        user_id: userId,
        invoice_id: input.invoiceId,
        step_index: input.stepIndex,
        step_label: input.stepLabel,
        channel: input.channel,
        message: input.message,
        delivery_status: "sent",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminder-logs"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
