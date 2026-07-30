import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/Configuracoes")({
  beforeLoad: () => {
    throw redirect({ to: "/app/Configuracion", replace: true });
  },
});
