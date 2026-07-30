import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/Financeiro")({
  beforeLoad: () => {
    throw redirect({ to: "/app/Financiero", replace: true });
  },
});
