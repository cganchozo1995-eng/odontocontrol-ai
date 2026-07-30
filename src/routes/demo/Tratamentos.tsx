import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/Tratamentos")({
  beforeLoad: () => {
    throw redirect({ to: "/demo/Tratamientos", replace: true });
  },
});
