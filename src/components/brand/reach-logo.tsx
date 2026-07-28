import { cn } from "@/lib/utils";

export function ReachLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="bg-gradient-navy relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        <span className="bg-accent absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full" />
        <span className="text-primary-foreground text-base leading-none font-bold">R</span>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-foreground text-lg font-semibold tracking-tight">Reach</span>
          <span className="text-muted-foreground text-[10px] font-medium tracking-[0.16em] uppercase">
            by MarketEra
          </span>
        </span>
      )}
    </span>
  );
}
