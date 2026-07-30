import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/master/configuracoes")({
  beforeLoad: () => {
    throw redirect({ to: "/master/configuracion", replace: true });
  },
});
