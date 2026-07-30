import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/AIGrowth")({
  beforeLoad: () => {
    throw redirect({ to: "/app/CrecimientoIA", replace: true });
  },
});
