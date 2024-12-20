import {api} from "@/api/apiClient";
import {queryClient} from "@/api/queryClient";
import {authOptions} from "@/api/queryOptions";
import {useMutation, useQuery} from "@tanstack/react-query";


export const useAuth = () => {
    const { data: currentUser, isLoading } = useQuery(authOptions());

    const setCurrentUser = (updates) => {
        queryClient.setQueryData(["currentUser"], updates);
    };

    const login = useMutation({
        mutationFn: ({ username, password }) => api.login(username, password),
        onSuccess: (data) => {
            api.setAccessToken(data.body.access_token);
            queryClient.setQueryData(["currentUser"], data.body.data);
        },
    });

    const logout = useMutation({
        mutationFn: () => api.logout(),
        onSuccess: () => {
            api.removeAccessToken();
            setCurrentUser(null);
        },
    });

    const register = useMutation({
        mutationFn: ({ params }) => api.register(params),
    });

    return { currentUser, isLoading, login, register, logout, setCurrentUser };
};
