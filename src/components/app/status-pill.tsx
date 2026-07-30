import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_TONE, type InvoiceStatus } from "@/lib/invoice-status";
import { cn } from "@/lib/utils";

export function StatusPill({ status, className }: { status: InvoiceStatus; className?: string }) {
  return (
    <Badge className={cn("rounded-full border-0 font-medium", STATUS_TONE[status], className)}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
