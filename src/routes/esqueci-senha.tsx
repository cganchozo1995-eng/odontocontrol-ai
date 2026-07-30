import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/esqueci-senha")({
  beforeLoad: () => {
    throw redirect({ to: "/olvide-contrasena", replace: true });
  },
});
