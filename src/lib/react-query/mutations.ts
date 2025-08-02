import {queryKeys} from "@/lib/react-query/queryOptions";
import {postGeneralSettings} from "@/server/functions/settings";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addUserKeyword, deleteUserKeyword, toggleUserKeyword} from "@/server/functions/keywords";


export const useGeneralMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postGeneralSettings,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.authKey() }),
    });
};


export const useAddKeywordMutation = () => {
    return useMutation({
        mutationFn: addUserKeyword,
    })
}


export const useDeleteKeywordMutation = () => {
    return useMutation({
        mutationFn: deleteUserKeyword,
    })
}


export const useToggleKeywordMutation = () => {
    return useMutation({
        mutationFn: toggleUserKeyword,
    })
}
