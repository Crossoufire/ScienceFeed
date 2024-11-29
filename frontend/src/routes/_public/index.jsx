import {Hero} from "@/components/homepage/Hero";
import {PageTitle} from "@/components/app/PageTitle";
import {createFileRoute} from "@tanstack/react-router";
import {Features} from "@/components/homepage/Features";


// noinspection JSCheckFunctionSignatures,JSUnusedGlobalSymbols
export const Route = createFileRoute("/_public/")({
    component: HomePage,
});


function HomePage() {
    return (
        <PageTitle title="HomePage" onlyHelmet>
            <Hero/>
            <Features/>
        </PageTitle>
    );
}