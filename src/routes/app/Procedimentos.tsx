import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/Procedimentos")({
  beforeLoad: () => {
    throw redirect({ to: "/app/Procedimientos", replace: true });
  },
});
