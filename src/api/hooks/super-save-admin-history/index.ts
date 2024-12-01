import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "react-query";
import { API_URL, api } from "api";
import { IGetAdminLogActivityUsers } from "./types";
import { DatePeriodTypes } from "@common/types/dates";
import { AxiosError, AxiosResponse } from "axios";

export type iGetAdminLogActivityResp = {
  message: string;
  lastId: string;
  nbElements: number;
  nbTotalElements: number;
  nbTotalPage: number;
  hasNext: boolean;
  users: IGetAdminLogActivityUsers[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetAdminLogActivityErr = AxiosError<any>;
export type iGetAdminLogActivityRsq = {
  limit?: number;
  searchKey?: string;
  lastId?: string;
  date_filter?: DatePeriodTypes;
  from_date?: string;
  to_date?: string;
  page: number;
  type?: "access" | "excel";
};

const useGetAdminLogActivity = (
  props: iGetAdminLogActivityRsq,
  options?: Omit<
    UseQueryOptions<iGetAdminLogActivityResp, iGetAdminLogActivityErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetAdminLogActivityResp, iGetAdminLogActivityErr>({
    queryKey: ["admin-history", ...Object.values(props)],
    queryFn: async () =>
      (
        await api.get("/super-save/get_admin_log_activity", {
          params: props,
        })
      ).data,
    ...options,
  });

const useGetMassAdminLogActivity = () =>
  useMutation<iGetAdminLogActivityResp, void, any>({
    mutationFn: async (props) =>
      (await api.get("/super-save/get_admin_log_activity", {
        params: props,
      })
      ).data
  });


// --------------------------------------------------

export type iPostAdminHistoryLogErr = AxiosError<{
  message?: string;
}>;
export type iPostAdminHistoryLogResp = AxiosResponse<{ result: string }>;
export type iPostAdminHistoryLogRsq = {
  content_en: string;
  content_kr: string;
  uuid?: string;
};

const usePostAdminHistoryLog = (
  options?: Omit<
    UseMutationOptions<
      iPostAdminHistoryLogResp,
      iPostAdminHistoryLogErr,
      iPostAdminHistoryLogRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostAdminHistoryLogResp,
    iPostAdminHistoryLogErr,
    iPostAdminHistoryLogRsq
  >({
    mutationFn: (props) => api.post(API_URL.postAdminHistoryLog, props),
    ...options,
  });

export { useGetAdminLogActivity, usePostAdminHistoryLog, useGetMassAdminLogActivity };
