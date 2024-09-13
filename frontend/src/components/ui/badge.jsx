import * as React from "react";
import {cn} from "@/utils/functions";
import {cva} from "class-variance-authority";


const badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-1.5 text-sm font-semibold " +
    "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
    {
        variants: {
            variant: {
                outline: "text-foreground",
                default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
                label: "cursor-pointer border-transparent bg-green-700 text-secondary-foreground hover:bg-green-700/80",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);


function Badge({ className, variant, ...props }) {
    return (
        <div
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export {Badge, badgeVariants};
