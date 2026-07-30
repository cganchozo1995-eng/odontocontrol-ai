import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/AIGrowth")({
  beforeLoad: () => {
    throw redirect({ to: "/demo/CrecimientoIA", replace: true });
  },
});
