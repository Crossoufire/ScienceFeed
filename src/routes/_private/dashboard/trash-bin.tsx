import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/dashboard/trash-bin")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_private/dashboard/trash-bin"!</div>;
}
