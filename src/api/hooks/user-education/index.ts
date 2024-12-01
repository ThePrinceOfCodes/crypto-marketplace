import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, queryClient, API_URL } from "api";
import { IUserEducation, IUpdateUserEducationReq, IEducationHistoryItem } from "./types";
import { AxiosError } from "axios";

export type iGetUserEducationResp = {
  lastId: string;
  hasNext: boolean;
  nbElements: number;
  nbTotalElements: number;
  dataList: IUserEducation[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetUserEducationErr = AxiosError<any>;
export type iGetUserEducationRsq = {
  searchKey?: string;
  to_date?: string;
  from_date?: string;
  searchValue?: string;
  lastId?: string;
  limit?: number;
  page?: number;
  super_save_education_status?: string;
};
const useGetUserEducation = (
  {
    searchKey,
    searchValue,
    lastId,
    from_date,
    to_date,
    limit,
    page,
    super_save_education_status,
  }: iGetUserEducationRsq,
  options?: Omit<
    UseQueryOptions<iGetUserEducationResp, iGetUserEducationErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetUserEducationResp, iGetUserEducationErr>({
    queryKey: [
      "all-user-education",
      searchKey,
      searchValue,
      lastId,
      limit,
      page,
      from_date,
      to_date,
      super_save_education_status,
    ],
    queryFn: async () =>
      (
        await api.get(API_URL.getAllUserEducation, {
          params: {
            searchKey,
            searchValue,
            lastId,
            limit,
            page,
            from_date,
            to_date,
            super_save_education_status,
          },
        })
      ).data,
    ...options,
  });

const useUpdateUserEducation = () =>
  useMutation<void, void, IUpdateUserEducationReq>({
    mutationFn: async (props) => {
      (await api.post(API_URL.updateUserEducationStatus, props)).data;
    },
    onSuccess: () => queryClient.invalidateQueries("all-user-education"),
  });

const useResetEducationManual = () =>
  useMutation<
    void,
    void,
    {
      date: string;
    }
  >({
    mutationFn: async ({ date }) => {
      (
        await api.get(API_URL.resetUserEducationManual, {
          params: {
            date,
          },
        })
      ).data;
    },
    onSuccess: () => queryClient.invalidateQueries("all-user-education"),
  });

const useApproveEducationAll = () =>
  useMutation<void, void, null>({
    mutationFn: async () => {
      (await api.get(API_URL.approveUserEducationAll)).data;
    },
    onSuccess: () => queryClient.invalidateQueries("all-user-education"),
  });


export type iGetUserEducationHistoryResp = {
  createdAt: number;
  lastId: string;
  hasNext: boolean;
  nbTotalElements: number;
  dataList: IEducationHistoryItem[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetUserEducationHistoryErr = AxiosError<any>;
export type iGetUserEducationHistoryRsq = {
  lastId?: string;
  createdAt?: number;
  limit?: number;
  user_id?: string;
};
const useGetUserEducationHistory = (
  {
    lastId,
    limit,
    user_id,
    createdAt,
  }: iGetUserEducationHistoryRsq,
  options?: Omit<
    UseQueryOptions<iGetUserEducationHistoryResp, iGetUserEducationHistoryErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetUserEducationHistoryResp, iGetUserEducationHistoryErr>({
    queryKey: [
      "user-education-history",
      lastId,
      limit,
      user_id,
      createdAt,
    ],
    queryFn: async () =>
      (
        await api.get(API_URL.getUserEducationHistory, {
          params: {
            lastId,
            limit,
            user_id,
            createdAt,
          },
        })
      ).data,
    ...options,
  });


export {
  useUpdateUserEducation,
  useGetUserEducation,
  useResetEducationManual,
  useApproveEducationAll,
  useGetUserEducationHistory
};


