import {authOptions} from "@/lib/client/react-query";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";


export const useAuth = () => {
    const queryClient = useQueryClient();
    const { data: currentUser } = useSuspenseQuery(authOptions);

    const setCurrentUser = async () => {
        await queryClient.invalidateQueries({ queryKey: authOptions.queryKey });
    };

    return { currentUser, setCurrentUser };
};
