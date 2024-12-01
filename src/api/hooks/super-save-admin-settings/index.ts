import { api } from "api";
import { API_URL } from "api/url";
import {
  useMutation,
  useQuery,
  UseMutationOptions,
  UseQueryOptions,
} from "react-query";
import {
  ISuperSaveTime,
  ISuperSaveAmountHistory,
  ISuperSaveBankFeeHistory,
  ISuperSaveNotificationTime,
  IMsqStandardAmountHistory,
  ISuperSaveTimeHistory,
  ISuperSaveNotificationTimeHistory,
} from "./types";
import { AxiosError, AxiosResponse } from "axios";
import { DatePeriodTypes } from "@common/types/dates";

export type iPostSetSuperSaveTimeErr = AxiosError<{
  message?: string;
}>;
export type iPostSetSuperSaveTimeResp = AxiosResponse<{ result: string }>;
export type iPostSetSuperSaveTimeRsq = {
  timezone: string;
  start_time: string;
  end_time: string;
};

const useSetSuperSaveTime = (
  options?: Omit<
    UseMutationOptions<
      iPostSetSuperSaveTimeResp,
      iPostSetSuperSaveTimeErr,
      iPostSetSuperSaveTimeRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostSetSuperSaveTimeResp,
    iPostSetSuperSaveTimeErr,
    iPostSetSuperSaveTimeRsq
  >({
    mutationFn: (props) => api.post(API_URL.setSuperSaveTime, props),
    ...options,
  });

export type iPostSetSuperSaveBankFeeErr = AxiosError<{
  message?: string;
}>;
export type iPostSetSuperSaveBankFeeResp = AxiosResponse<{ result: string }>;
export type iPostSetSuperSaveBankFeeRsq = {
  fee: number;
  usdt: number;
};

const useSetSuperSaveBankFee = (
  options?: Omit<
    UseMutationOptions<
      iPostSetSuperSaveBankFeeResp,
      iPostSetSuperSaveBankFeeErr,
      iPostSetSuperSaveBankFeeRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostSetSuperSaveBankFeeResp,
    iPostSetSuperSaveBankFeeErr,
    iPostSetSuperSaveBankFeeRsq
  >({
    mutationFn: (props) => api.post(API_URL.setSuperSaveBankFee, props),
    ...options,
  });

export type iPostSetSuperSaveAmountErr = AxiosError<{
  message?: string;
}>;
export type iPostSetSuperSaveAmountResp = AxiosResponse<{ result: string }>;
export type iPostSetSuperSaveAmountRsq = {
  amount: number;
  discount: number;
  msqx_amount: number;
  sut_amount: number;
  msqx_discount: number;
  sut_discount: number;
  super_trust_amount: number;
  super_trust_discount: number;
  super_trust_ratio?: number;
  msqx_super_trust_amount: number;
  msqx_super_trust_discount: number;
  msqx_super_trust_ratio?: number;
  sut_super_trust_amount: number;
  sut_super_trust_discount: number;
  sut_super_trust_ratio?: number;
  p2u_super_trust_amount: number;
  credit_sale_amount: number;
  credit_sale_discount: number;
  msqx_credit_sale_amount: number;
  msqx_credit_sale_discount: number;
  sut_credit_sale_amount: number;
  sut_credit_sale_discount: number;
};

const useSetSuperSaveAmount = (
  options?: Omit<
    UseMutationOptions<
      iPostSetSuperSaveAmountResp,
      iPostSetSuperSaveAmountErr,
      iPostSetSuperSaveAmountRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostSetSuperSaveAmountResp,
    iPostSetSuperSaveAmountErr,
    iPostSetSuperSaveAmountRsq
  >({
    mutationFn: (props) => api.post(API_URL.setSuperSaveAmount, props),
    ...options,
  });

export type iPostSetSuperSaveNotificationTimeErr = AxiosError<{
  message?: string;
}>;
export type iPostSetSuperSaveNotificationTimeResp = AxiosResponse<{
  result: string;
}>;
export type iPostSetSuperSaveNotificationTimeRsq = {
  timezone: string;
  set_time: string;
  is_instantly: boolean;
};

const useSetSuperSaveNotificationTime = (
  options?: Omit<
    UseMutationOptions<
      iPostSetSuperSaveNotificationTimeResp,
      iPostSetSuperSaveNotificationTimeErr,
      iPostSetSuperSaveNotificationTimeRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostSetSuperSaveNotificationTimeResp,
    iPostSetSuperSaveNotificationTimeErr,
    iPostSetSuperSaveNotificationTimeRsq
  >({
    mutationFn: (props) =>
      api.post(API_URL.setSuperSaveNotificationTime, props),
    ...options,
  });

export type iPostSetMsqStandardAmountErr = AxiosError<{
  message?: string;
}>;
export type iPostSetMsqStandardAmountResp = AxiosResponse<{ result: string }>;
export type iPostSetMsqStandardAmountRsq = {
  name: string;
  rate?: number;
  msqx_rate?: number;
  sut_rate?: number;
};

const useSetMsqStandardAmount = (
  options?: Omit<
    UseMutationOptions<
      iPostSetMsqStandardAmountResp,
      iPostSetMsqStandardAmountErr,
      iPostSetMsqStandardAmountRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostSetMsqStandardAmountResp,
    iPostSetMsqStandardAmountErr,
    iPostSetMsqStandardAmountRsq
  >({
    mutationFn: (props) => api.post(API_URL.setMsqStandardAmount, props),
    ...options,
  });

export type iGetMsqStandardAmountHistoryResp = {
  result: string;
  allMsqRateList: IMsqStandardAmountHistory[];
  hasNext: boolean;
  lastId: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetMsqStandardAmountHistoryErr = AxiosError<any>;
export type iGetMsqStandardAmountHistoryRsq = {
  limit?: number;
  lastId?: string;
  search?: string;
  date_filter?: DatePeriodTypes;
  from_date?: string;
  to_date?: string;
};
const useGetMsqStandardAmountHistory = (
  props: iGetMsqStandardAmountHistoryRsq,
  options?: Omit<
    UseQueryOptions<
      iGetMsqStandardAmountHistoryResp,
      iGetMsqStandardAmountHistoryErr
    >,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetMsqStandardAmountHistoryResp, iGetMsqStandardAmountHistoryErr>({
    queryKey: ["msq-standard-amount-history", ...Object.values(props)],
    queryFn: async () =>
      (
        await api.get(API_URL.getMsqStandardAmountHistory, {
          params: props,
        })
      ).data,
    ...options,
  });

export type iGetSuperSaveTimeHistoryResp = {
  result: string;
  lastId?: string;
  allSuperSaveTimeSettingList: ISuperSaveTimeHistory[];
  hasNext: boolean;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetSuperSaveTimeHistoryErr = AxiosError<any>;
export type iGetSuperSaveTimeHistoryRsq = {
  limit?: number;
  lastId?: string;
  search?: string;
  date_filter?: DatePeriodTypes;
  from_date?: string;
  to_date?: string;
  hasNext?: boolean
};
const useGetSuperSaveTimeHistory = (
  props: iGetSuperSaveTimeHistoryRsq,
  options?: Omit<
    UseQueryOptions<iGetSuperSaveTimeHistoryResp, iGetSuperSaveTimeHistoryErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetSuperSaveTimeHistoryResp, iGetSuperSaveTimeHistoryErr>({
    queryKey: ["get-super-save-time-history", ...Object.values(props)],
    queryFn: async () =>
      (
        await api.get(API_URL.getSuperSaveTimeHistory, {
          params: props,
        })
      ).data,
    ...options,
  });

const useGetSuperSaveAmount = () =>
  useQuery<ISuperSaveAmountHistory>({
    queryKey: ["get-super-save-bank-amount"],
    queryFn: async () =>
      (await api.get(API_URL.getSuperSaveAmount))?.data?.superSaveRateList[0],
  });

export type iGetSuperSaveAmountHistoryResp = {
  result: string;
  allSuperSaveRateList: ISuperSaveAmountHistory[];
  hasNext: boolean;
  lastId: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetSuperSaveAmountHistoryErr = AxiosError<any>;
export type iGetSuperSaveAmountHistoryRsq = {
  limit?: number;
  lastId?: string;
  search?: string;
  date_filter?: DatePeriodTypes;
  from_date?: string;
  to_date?: string;
};
const useGetSuperSaveAmountHistory = (
  props: iGetSuperSaveAmountHistoryRsq,
  options?: Omit<
    UseQueryOptions<
      iGetSuperSaveAmountHistoryResp,
      iGetSuperSaveAmountHistoryErr
    >,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetSuperSaveAmountHistoryResp, iGetSuperSaveAmountHistoryErr>({
    queryKey: ["get-super-save-amount-history", ...Object.values(props)],
    queryFn: async () =>
      (
        await api.get(API_URL.getSuperSaveAmountHistory, {
          params: props,
        })
      ).data,
    ...options,
  });

const useGetSuperSaveBankFee = () =>
  useQuery<ISuperSaveBankFeeHistory>({
    queryKey: ["get-super-save-bank-fee"],
    queryFn: async () =>
      (await api.get(API_URL.getSuperSaveBankFee))?.data
        ?.superSaveBankFeeList[0],
  });

export type iGetSuperSaveBankFeeHistoryResp = {
  result: string;
  allSuperSaveBankFeeList: ISuperSaveBankFeeHistory[];
  hasNext: boolean;
  lastId: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetSuperSaveBankFeeHistoryErr = AxiosError<any>;
export type iGetSuperSaveBankFeeHistoryRsq = {
  limit?: number;
  lastId?: string;
  search?: string;
  date_filter?: DatePeriodTypes;
  from_date?: string;
  to_date?: string;
};
const useGetSuperSaveBankFeeHistory = (
  props: iGetSuperSaveBankFeeHistoryRsq,
  options?: Omit<
    UseQueryOptions<
      iGetSuperSaveBankFeeHistoryResp,
      iGetSuperSaveBankFeeHistoryErr
    >,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetSuperSaveBankFeeHistoryResp, iGetSuperSaveBankFeeHistoryErr>({
    queryKey: ["get-super-save-bank-fee-history", ...Object.values(props)],
    queryFn: async () =>
      (
        await api.get(API_URL.getSuperSaveBankFeeHistory, {
          params: props,
        })
      ).data,
    ...options,
  });

const useGetSuperSaveNotificationTime = () =>
  useQuery<ISuperSaveNotificationTime>({
    queryKey: ["super-save-notification-time"],
    queryFn: async () =>
      (await api.get(API_URL.getSuperSaveNotificationTime)).data
        .superSaveNotificationTimeResponse[0],
  });

export type iGetSuperSaveNotificationTimeHistoryResp = {
  result: string;
  allSuperSaveNotificationTimeList: ISuperSaveNotificationTimeHistory[];
  hasNext: boolean;
  lastId: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetSuperSaveNotificationTimeHistoryErr = AxiosError<any>;
export type iGetSuperSaveNotificationTimeHistoryRsq = {
  limit?: number;
  lastId?: string;
  search?: string;
  date_filter?: DatePeriodTypes;
  from_date?: string;
  to_date?: string;
};
const useGetSuperSaveNotificationTimeHistory = (
  props: iGetSuperSaveNotificationTimeHistoryRsq,
  options?: Omit<
    UseQueryOptions<
      iGetSuperSaveNotificationTimeHistoryResp,
      iGetSuperSaveNotificationTimeHistoryErr
    >,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<
    iGetSuperSaveNotificationTimeHistoryResp,
    iGetSuperSaveNotificationTimeHistoryErr
  >({
    queryKey: [
      "get-super-save-notification-time-history",
      ...Object.values(props),
    ],
    queryFn: async () =>
      (
        await api.get(API_URL.getSuperSaveNotificationTimeHistory, {
          params: props,
        })
      ).data,
    ...options,
  });

const useGetSuperSaveTime = () =>
  useQuery<ISuperSaveTime>({
    queryKey: ["super-save-time"],
    queryFn: async () =>
      (await api.get(API_URL.getSuperSaveTime)).data
        .superSaveTimeSettingResponse[0],
  });

// ------------------------------------
export type ISaveDBInitialTokensErr = AxiosError<{
  message: string;
  error: string;
}>;
export interface ISaveDBInitialTokensProps {
  key: string;
  value: string;
}
export interface ISaveDBInitialTokensResResult {
  createdAt: string;
  key: string;
  updatedAt: string;
  value: string;
}

export interface ISaveDBInitialTokensRes {
  result: ISaveDBInitialTokensResResult;
  status: string;
}

const useSaveDBInitialTokens = (
  options?: UseMutationOptions<
    ISaveDBInitialTokensRes,
    ISaveDBInitialTokensErr,
    ISaveDBInitialTokensProps
  >,
) =>
  useMutation<
    ISaveDBInitialTokensRes,
    ISaveDBInitialTokensErr,
    ISaveDBInitialTokensProps
  >({
    mutationFn: async ({ key, value }) =>
      (
        await api.post(API_URL.saveSettings, {
          key,
          value,
        })
      ).data,
    ...options,
  });
// ------------------------------------

export {
  useGetMsqStandardAmountHistory,
  useGetSuperSaveAmount,
  useGetSuperSaveAmountHistory,
  useGetSuperSaveBankFee,
  useGetSuperSaveBankFeeHistory,
  useGetSuperSaveNotificationTime,
  useGetSuperSaveNotificationTimeHistory,
  useGetSuperSaveTime,
  useSetSuperSaveBankFee,
  useSetSuperSaveTime,
  useSetSuperSaveAmount,
  useSetSuperSaveNotificationTime,
  useSetMsqStandardAmount,
  useGetSuperSaveTimeHistory,
  useSaveDBInitialTokens,
};
