import {createFileRoute} from "@tanstack/react-router";


export const Route = createFileRoute("/_private/dashboard/archived")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div> Welcome to the Archived Page!</div>
    );
}
