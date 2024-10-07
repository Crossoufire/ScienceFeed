import {Toaster as Sonner} from "sonner";


export const Toaster = ({ ...props }) => {
    return (
        <Sonner
            theme="dark"
            duration={4000}
            position="bottom-right"
            {...props}
        />
    );
};
