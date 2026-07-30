import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/master/clinicasSuspensas")({
  beforeLoad: () => {
    throw redirect({ to: "/master/clinicasSuspendidas", replace: true });
  },
});
