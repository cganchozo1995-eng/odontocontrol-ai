import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/reset-senha")({
  beforeLoad: () => {
    throw redirect({ to: "/restablecer-contrasena", replace: true });
  },
});
