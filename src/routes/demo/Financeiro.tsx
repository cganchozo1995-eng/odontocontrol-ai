import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/Financeiro")({
  beforeLoad: () => {
    throw redirect({ to: "/demo/Financiero", replace: true });
  },
});
