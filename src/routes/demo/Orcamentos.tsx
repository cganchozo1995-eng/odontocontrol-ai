import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/Orcamentos")({
  beforeLoad: () => {
    throw redirect({ to: "/demo/Presupuestos", replace: true });
  },
});
