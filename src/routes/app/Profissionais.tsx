import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/Profissionais")({
  beforeLoad: () => {
    throw redirect({ to: "/app/Profesionales", replace: true });
  },
});
