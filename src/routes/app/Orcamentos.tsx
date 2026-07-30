import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/Orcamentos")({
  beforeLoad: () => {
    throw redirect({ to: "/app/Presupuestos", replace: true });
  },
});
