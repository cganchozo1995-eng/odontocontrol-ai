import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/Tratamentos")({
  beforeLoad: () => {
    throw redirect({ to: "/app/Tratamientos", replace: true });
  },
});
