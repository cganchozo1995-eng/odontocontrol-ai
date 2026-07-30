import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/master/painel")({
  beforeLoad: () => {
    throw redirect({ to: "/master/panel", replace: true });
  },
});
