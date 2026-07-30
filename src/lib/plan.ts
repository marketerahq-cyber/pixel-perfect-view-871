import type { Tables } from "@/integrations/supabase/types";

export type PlanTier = Tables<"profiles">["plan"];

export type PlanLimits = {
  tier: PlanTier;
  name: string;
  priceLabel: string;
  invoicesPerMonth: number | null; // null = unlimited
  customSchedule: boolean;
  perClientRules: boolean;
  sms: boolean;
  whatsapp: boolean;
  seats: number;
  analytics: "basic" | "full" | "full+scoring";
};

export const PLANS: Record<PlanTier, PlanLimits> = {
  free: {
    tier: "free",
    name: "Free",
    priceLabel: "$0",
    invoicesPerMonth: 6,
    customSchedule: false,
    perClientRules: false,
    sms: false,
    whatsapp: false,
    seats: 1,
    analytics: "basic",
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceLabel: "$35/mo",
    invoicesPerMonth: 50,
    customSchedule: true,
    perClientRules: false,
    sms: true,
    whatsapp: false,
    seats: 1,
    analytics: "full",
  },
  business: {
    tier: "business",
    name: "Business",
    priceLabel: "$75/mo",
    invoicesPerMonth: null,
    customSchedule: true,
    perClientRules: true,
    sms: true,
    whatsapp: true,
    seats: 5,
    analytics: "full+scoring",
  },
};

export function planOf(tier: PlanTier | undefined | null) {
  return PLANS[tier ?? "free"];
}

export function invoicesThisMonth(invoices: { created_at: string }[]) {
  const now = new Date();
  return invoices.filter((inv) => {
    const d = new Date(inv.created_at);
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
  }).length;
}

export function usageState(tier: PlanTier | undefined | null, used: number) {
  const plan = planOf(tier);
  const limit = plan.invoicesPerMonth;
  const unlimited = limit === null;
  const remaining = unlimited ? Infinity : Math.max(0, limit - used);
  return {
    plan,
    used,
    limit,
    unlimited,
    remaining,
    percent: unlimited ? 0 : Math.min(100, Math.round((used / (limit || 1)) * 100)),
    atLimit: !unlimited && used >= (limit ?? 0),
    nearLimit: !unlimited && used >= (limit ?? 0) - 1,
  };
}
