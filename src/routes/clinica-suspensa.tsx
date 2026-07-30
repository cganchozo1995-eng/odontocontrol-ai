import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/clinica-suspensa")({
  beforeLoad: () => {
    throw redirect({ to: "/clinica-suspendida", replace: true });
  },
});
