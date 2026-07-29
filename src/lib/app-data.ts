import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
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
