import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useInvoices, useProfile } from "@/lib/app-data";
import { invoicesThisMonth, usageState } from "@/lib/plan";

export function UsageMeter() {
  const { data: profile } = useProfile();
  const { data: invoices } = useInvoices();
  const used = invoicesThisMonth(invoices ?? []);
  const usage = usageState(profile?.plan, used);

  return (
    <Card className="shadow-card">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{usage.plan.name} plan</p>
          <span className="text-muted-foreground text-xs">
            {usage.unlimited ? "Unlimited invoices" : `${usage.used}/${usage.limit} this month`}
          </span>
        </div>
        {!usage.unlimited && <Progress value={usage.percent} className="h-2" />}
        <p className="text-muted-foreground text-xs leading-relaxed">
          {usage.unlimited
            ? "Send as many invoices as you need, with SMS and WhatsApp follow-ups."
            : usage.atLimit
              ? "You've used every invoice on this plan for the month."
              : `${usage.remaining} invoice${usage.remaining === 1 ? "" : "s"} left this month.`}
        </p>
        {usage.plan.tier !== "business" && (
          <Button variant="outlineBrand" size="sm" className="w-full" asChild>
            <Link to="/pricing">
              <Sparkles className="h-4 w-4" /> Upgrade plan
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
