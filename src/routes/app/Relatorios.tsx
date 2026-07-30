import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/Relatorios")({
  beforeLoad: () => {
    throw redirect({ to: "/app/Informes", replace: true });
  },
});
