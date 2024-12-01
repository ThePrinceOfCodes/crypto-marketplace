import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, queryClient, API_URL } from "api";
import { IAds, IAddAdsReq, IUpdateAdsReq, IDeleteAdsReq } from "./types";
import { AxiosError } from "axios";

export type iGetPopUpsResp = {
  lastId: string;
  hasNext: boolean;
  rows: IAds[];
};
export type IGetAdsStatsRsq = {
  slugOrUrl: string;
  startAt: string;
  endAt: string;
}
export interface IGetStatsCounters {
  visits: string;
  visitors: string;
  referers: string;
}

export interface IGetStatsCity {
  name: string;
  count: string;
}

export interface IGetStatsViews {
  time: string;
  visits: string;
  visitors: string;
}

export interface IGetStatsCountry {
  name: string;
  count: string;
}

export interface IGetStatsLanguage {
  name: string;
  count: string;
}

export interface IGetStatsBrowserType {
  name: string;
  count: string;
}

export interface IGetStatsReferer {
  name: string;
  count: string;
}

export interface IGetStatsSlug {
  name: string;
  count: string;
}

export interface IGetStatsBrowser {
  name: string;
  count: string;
}

export interface IGetStatsTimezone {
  name: string;
  count: string;
}

export interface IGetStatsOs {
  name: string;
  count: string;
}

export interface IGetStatsDeviceType {
  name: string;
  count: string;
}

export interface IGetStatsDevice {
  name: string;
  count: string;
}

export interface IGetStatsRegion {
  name: string;
  count: string;
}

export interface IGetStatsResponse {
  counters: IGetStatsCounters[];
  city: IGetStatsCity[];
  views: IGetStatsViews[];
  country: IGetStatsCountry[];
  language: IGetStatsLanguage[];
  browserType: IGetStatsBrowserType[];
  referer: IGetStatsReferer[];
  slug: IGetStatsSlug[];
  browser: IGetStatsBrowser[];
  timezone: IGetStatsTimezone[];
  os: IGetStatsOs[];
  deviceType: IGetStatsDeviceType[];
  device: IGetStatsDevice[];
  region: IGetStatsRegion[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetPopUpsErr = AxiosError<any>;
export type IGetAdsStatsErr = AxiosError<{message: string}>;
export type iGetPopUpsRsq = {
  searchKey?: string;
  searchValue?: string;
  lastId?: string;
  limit?: number;
  page?: number;
  date_from?: string;
  date_to?: string;
};
const useGetAllAds = (
  {
    searchKey,
    searchValue,
    lastId,
    limit,
    page,
    date_to,
    date_from,
  }: iGetPopUpsRsq,
  options?: Omit<
    UseQueryOptions<iGetPopUpsResp, iGetPopUpsErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetPopUpsResp, iGetPopUpsErr>({
    queryKey: [
      "all-ads",
      searchKey,
      searchValue,
      lastId,
      limit,
      page,
      date_to,
      date_from,
    ],
    queryFn: async () =>
      (
        await api.get(API_URL.getAllAds, {
          params: {
            searchKey,
            searchValue,
            lastId,
            limit,
            page,
            date_to,
            date_from,
          },
        })
      ).data,
    ...options,
  });

const useAddAds = () =>
  useMutation<void, void, IAddAdsReq>({
    mutationFn: async (props) =>
      (
        await api.post("/ads", props, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data,
  });

const useUpdateAds = () =>
  useMutation<void, void, IUpdateAdsReq>({
    mutationFn: async (props) => {
      const { id, adData } = props;
      (await api.patch(`/ads/${id}`, adData)).data;
    },
    onSuccess: () => queryClient.invalidateQueries("all-ads"),
  });


  const useDeleteAds = () =>
    useMutation<void, void, IDeleteAdsReq>({
      mutationFn: async (props) =>
        (await api.delete(`ads`, { data: { id_list: props.id } })).data,
      onSuccess: () => queryClient.invalidateQueries("delete-inquiry"),
    });

const useGetAdsStats = (
  {
    slugOrUrl,
    startAt,
    endAt,
  }: IGetAdsStatsRsq,
  options?: Omit<
    UseQueryOptions<IGetStatsResponse, IGetAdsStatsErr>,
    "queryKey" | "queryFn"
  >,
  enabled = true
) =>
  useQuery<IGetStatsResponse, IGetAdsStatsErr>({
    queryKey: ["ads-stats", slugOrUrl, startAt, endAt],
    queryFn: async () =>
      (
        await api.get(API_URL.getAdsStats, {
          params: {
            slugOrUrl,
            startAt,
            endAt,
          },
        })
      ).data,
      enabled,
      ...options,
  });

export { useAddAds, useDeleteAds, useUpdateAds, useGetAllAds, useGetAdsStats };
