import { useMutation, useQuery, UseQueryOptions, UseMutationOptions } from "react-query";
import { API_URL, api } from "api";
import { AxiosError } from "axios";
import { IGetCommRes, IPostCommunityForm, IGetCommunityFormResponse, IGetCommunityFormError, IGetCommDeleteErr, IGetCommDeleteRes } from "./types";
import { GridRowId } from "@mui/x-data-grid-pro";

type IGetInterface = {
    searchKey?: string;
    lastId?: string;
    limit?: number;
    createdAt?: number;
    date_from?: string;
    date_to?: string;
};

type IGetErr = AxiosError<any>;

const useGetCommunityList = (
    { searchKey, createdAt, lastId, limit, date_from, date_to }: IGetInterface,
    options?: Omit<UseQueryOptions<IGetCommRes, IGetErr>, "queryKey" | "queryFn">
) => {
    return useQuery<IGetCommRes, IGetErr>({
        queryKey: [
            "getCommunity",
            searchKey,
            lastId,
            limit,
            createdAt,
            date_from,
            date_to
        ],
        queryFn: async () => (
            await api.get(API_URL.getCommunityList, {
                params: {
                    searchKey,
                    lastId,
                    limit,
                    createdAt,
                    date_from,
                    date_to
                },
            })
        ).data,
        ...options
    });
};


// ====================================================================================== //
const useAddCommunity = (options?: UseMutationOptions<IGetCommunityFormResponse, IGetCommunityFormError, IPostCommunityForm>) => (
    useMutation<IGetCommunityFormResponse, IGetCommunityFormError, IPostCommunityForm>({
        mutationFn: async (data: IPostCommunityForm) => await api.post(API_URL.addCommunity, data),
        ...options
    })
);

// ====================================================================================== //
interface IUpdateCommunityForm extends IPostCommunityForm {
    uuid: string
}

const useUpdateCommunity = (options?: UseMutationOptions<IGetCommunityFormResponse, IGetCommunityFormError, IUpdateCommunityForm>) => (
    useMutation<IGetCommunityFormResponse, IGetCommunityFormError, IUpdateCommunityForm>({
        mutationFn: async (data: IUpdateCommunityForm) => await api.put(API_URL.updateCommunity, data),
        ...options
    })
);

// ====================================================================================== //
type IDeleteCommunity = {
    id_list: GridRowId[];
};

const useDeleteCommunities = (options?: UseMutationOptions<IGetCommDeleteRes, IGetCommDeleteErr, IDeleteCommunity>) => (
    useMutation<IGetCommDeleteRes, IGetCommDeleteErr, IDeleteCommunity>({
        mutationFn: async (data: IDeleteCommunity) => await api.delete(API_URL.deleteCommunity, { data }),
        ...options
    })
);

export { useGetCommunityList, useAddCommunity, useUpdateCommunity, useDeleteCommunities };
