import { API_URL, api } from "api";
import { useMutation, useQuery, UseQueryOptions } from "react-query";
import { AxiosError } from "axios";

type IGetParamsInterface = {
    page: number;
    limit: number | string;
    platform_id: string;
};

export type MostSpentInterface = {
    balance: number;
    city: string;
    code: string;
    image_url: string;
    location_lat: number;
    location_long: number;
    name: string;
    store_details: string;
    address: string;
}

export type ResponseInterface = {
    countToday: number;
    countWeek: number;
    countMonth: number;
    countByCity: Array<{
        city: string;
        store_count: number;
        platform_id: string;
    }>;
    countByCategory: Array<{
        category: string;
        store_count: number;
        platform_id: string;
    }>;
    mostSpent: {
        count: number;
        rows: Array<MostSpentInterface>
    };
};

const useGetAffiliatedDashboard = (
    { page, limit, platform_id }: IGetParamsInterface,
    options?: Omit<UseQueryOptions<ResponseInterface, AxiosError<any>>, "queryKey" | "queryFn">
) => {
    return useQuery<ResponseInterface, AxiosError<any>>({
        queryKey: ["getAffiliatedDashboard", page, limit, platform_id],
        queryFn: async () => {
            const response = await api.get(API_URL.getPlatformAffiliatedDashboard, {
                params: {
                    page,
                    limit,
                    platform_id
                }
            });

            return response.data
        },
        ...options
    })
}

const useGetMassMostSpent = () => useMutation<ResponseInterface, void, any>({
    mutationFn: async (params) => {
        return (await api.get(API_URL.getPlatformAffiliatedDashboard, { params })).data;
    }
});

export { useGetAffiliatedDashboard, useGetMassMostSpent };
