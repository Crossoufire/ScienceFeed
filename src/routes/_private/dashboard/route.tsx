import {createFileRoute} from "@tanstack/react-router";


export const Route = createFileRoute("/_private/dashboard")({
    component: RouteComponent,
});


function RouteComponent() {
    return <div>Hello "/_private/dashboard"!</div>;
}

