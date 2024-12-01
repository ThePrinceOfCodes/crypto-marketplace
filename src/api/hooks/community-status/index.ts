import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, API_URL } from "api";
import { ICommunityStatus } from "./types";
import { AxiosError } from "axios";


export type iGetCommunityStatusResp = {
    lastId: string;
    hasNext: boolean;
    lastCreatedAt: number;
    data: ICommunityStatus[];
};
export type iGetCronJobResp = {
    result: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetCommunityStatusErr = AxiosError<any>;
export type iGetCommunityStatusRsq = {
    limit?: number;
    searchKey?: string;
    date_from?: string;
    date_to?: string;
    lastId?: string;
    createdAt?: number;
};

const useGetCommunityStatus = (
    { limit, date_from, searchKey, date_to, lastId, createdAt }: iGetCommunityStatusRsq,
    options?: Omit<
        UseQueryOptions<iGetCommunityStatusResp, iGetCommunityStatusErr>,
        "queryKey" | "queryFn"
    >,
) =>
    useQuery<iGetCommunityStatusResp, iGetCommunityStatusErr>({
        queryKey: ["get-community-status", limit, date_from, searchKey, date_to, lastId, createdAt],
        queryFn: async () =>
            (
                await api.get(API_URL.getCommunityStatus, {
                    params: {
                        limit,
                        date_from,
                        searchKey,
                        lastId,
                        date_to,
                        createdAt
                    },
                })
            ).data,
        ...options,
    });

const useGetMassCommunityStatus = () =>
    useMutation<iGetCommunityStatusResp, void, any>({
        mutationFn: async (props) =>
            (await api.get(API_URL.getCommunityStatus, { params: props })).data,
    });

const useRefreshCronJob = () =>
    useMutation<iGetCronJobResp, void, any>({
        mutationFn: async () =>
            (await api.get(API_URL.refreshCronJob,)).data,
    });


export { useGetCommunityStatus, useGetMassCommunityStatus, useRefreshCronJob };
