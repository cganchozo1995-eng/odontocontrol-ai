import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/master/novaClinica")({
  beforeLoad: () => {
    throw redirect({ to: "/master/nuevaClinica", replace: true });
  },
});
