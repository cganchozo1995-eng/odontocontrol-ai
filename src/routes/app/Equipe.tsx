import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/Equipe")({
  beforeLoad: () => {
    throw redirect({ to: "/app/Equipo", replace: true });
  },
});
