import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

type Props = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
  to?: string;
};

export function KpiCard({ label, value, icon, hint, to }: Props) {
  const body = (
    <Card className={to ? "cursor-pointer transition hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40" : ""}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
          {icon && <span className="text-primary">{icon}</span>}
        </div>
        <div className="text-2xl font-semibold mt-2">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <Link to={to as any} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
        {body}
      </Link>
    );
  }
  return body;
}
