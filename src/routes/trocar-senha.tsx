import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/trocar-senha")({
  beforeLoad: () => {
    throw redirect({ to: "/cambiar-contrasena", replace: true });
  },
});
