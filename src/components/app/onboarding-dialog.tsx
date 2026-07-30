import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Tiva, type TivaGesture } from "@/components/app/tiva";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES, detectCurrency } from "@/lib/currency";
import { useProfile, useUpdateProfile } from "@/lib/app-data";

type StepDef = { gesture: TivaGesture; title: string; body: string };

const STEPS: StepDef[] = [
  {
    gesture: "wave",
    title: "Hi, I'm Tiva 👋",
    body: "I'll set Reach up with you — it takes about a minute, then your follow-ups run themselves.",
  },
  {
    gesture: "point",
    title: "What should invoices say?",
    body: "Your business name and address appear on every invoice and reminder you send.",
  },
  {
    gesture: "point",
    title: "Which currency do you bill in?",
    body: "We picked one based on where you are — change it any time in Settings.",
  },
  {
    gesture: "thumbs-up",
    title: "You're all set",
    body: "Create an invoice and Reach starts chasing payment: a nudge before it's due, escalating follow-ups after.",
  },
];

export function OnboardingDialog() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("NGN");

  useEffect(() => {
    if (isLoading || !profile || profile.onboarded) return;
    setBusinessName(profile.business_name ?? "");
    setAddress(profile.business_address ?? "");
    setCurrency(profile.currency_default ?? detectCurrency() ?? "NGN");
    setOpen(true);
  }, [profile, isLoading]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  async function next() {
    if (step === 1 && !businessName.trim()) {
      toast.error("Add a business name so clients recognise your invoices.");
      return;
    }
    if (isLast) {
      try {
        await update.mutateAsync({
          business_name: businessName.trim() || null,
          business_address: address.trim() || null,
          currency_default: currency,
          onboarded: true,
        });
        setOpen(false);
        toast.success("Reach is ready — let's send your first invoice.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save your details.");
      }
      return;
    }
    setStep((s) => s + 1);
  }

  async function skip() {
    setOpen(false);
    await update.mutateAsync({ onboarded: true }).catch(() => undefined);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : void skip())}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center">
          <Tiva gesture={current.gesture} className="h-24 w-24" />
          <h2 className="mt-3 text-xl font-semibold tracking-tight">{current.title}</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{current.body}</p>
        </div>

        {step === 1 && (
          <div className="mt-5 space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="ob-business">Business name</Label>
              <Input
                id="ob-business"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="MarketEra Studio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ob-address">Business address (optional)</Label>
              <Textarea
                id="ob-address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="12 Admiralty Way, Lekki, Lagos"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-2 text-left">
            <Label htmlFor="ob-currency">Default currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="ob-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "bg-accent w-6" : "bg-border w-1.5"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {!isLast && (
              <Button variant="ghost" size="sm" onClick={skip}>
                Skip
              </Button>
            )}
            <Button variant="hero" size="sm" onClick={next} disabled={update.isPending}>
              {update.isPending && <Loader2 className="animate-spin" />}
              {isLast ? "Start using Reach" : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
