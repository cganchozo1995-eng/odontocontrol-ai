import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/Relatorios")({
  beforeLoad: () => {
    throw redirect({ to: "/demo/Informes", replace: true });
  },
});
