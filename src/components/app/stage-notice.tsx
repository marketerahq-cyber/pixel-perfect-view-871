import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function StageNotice({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="shadow-card border-dashed">
      <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="bg-secondary text-primary flex h-14 w-14 items-center justify-center rounded-2xl">
          <Icon className="h-6 w-6" />
        </span>
        <div className="max-w-md space-y-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
