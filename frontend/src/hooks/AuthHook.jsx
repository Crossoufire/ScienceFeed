import {api} from "@/api/apiClient";
import {queryClient} from "@/api/queryClient";
import {useMutation, useQuery} from "@tanstack/react-query";


export const useAuth = () => {
    const { data: currentUser, isLoading } = useQuery({
        queryKey: ["currentUser"],
        queryFn: () => api.fetchCurrentUser(),
        staleTime: Infinity,
    });

    const setCurrentUser = (updates) => {
        queryClient.setQueryData(["currentUser"], updates);
    };

    const login = useMutation({
        mutationFn: ({ username, password }) => api.login(username, password),
        onSuccess: async (data) => {
            api.setAccessToken(data.body.access_token);
            await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        },
    });

    const register = useMutation({
        mutationFn: ({ params }) => api.register(params),
    });

    const logout = useMutation({
        mutationFn: () => api.logout(),
        onSuccess: () => {
            api.removeAccessToken();
            setCurrentUser(null);
        },
    });

    return { currentUser, isLoading, login, register, logout, setCurrentUser };
};