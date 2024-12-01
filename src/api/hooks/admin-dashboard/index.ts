import { api, API_URL, queryClient } from "api";
import { useMutation, UseMutationOptions, useQuery } from "react-query";
import {
  GetTokensProps,
  GetUsersProps,
  IGetAffiliatesResponse,
  IGetUsersResponse,
  ILanguage,
  ITokens,
  IUser,
  SetLanguageProps,
  GetStartAndEndDate,
} from "./types";
import { AxiosError, AxiosResponse } from "axios";

const useSetLanguage = () =>
  useMutation<ILanguage, string, SetLanguageProps>({
    mutationFn: async (props) => {
      return (await api.post(API_URL.setLanguage, { ...props })).data;
    },
    onSuccess: () => queryClient.invalidateQueries("get-language"),
  });

export type iPostRefreshUserBalanceErr = AxiosError<{
  msg?: string;
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iPostChangeBankErr = AxiosError<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iPostChangeBanResp = AxiosResponse<any>;

export type iPostRefreshUserBalanceResp = AxiosResponse<{
  message_ids: string[];
}>;
export type iPostRefreshUserBalanceRsq = {
  user_email: string;
};

const useRefreshUserBalance = (
  options?: Omit<
    UseMutationOptions<
      iPostRefreshUserBalanceResp,
      iPostRefreshUserBalanceErr,
      iPostRefreshUserBalanceRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostRefreshUserBalanceResp,
    iPostRefreshUserBalanceErr,
    iPostRefreshUserBalanceRsq
  >({
    mutationFn: async (props) => api.post(API_URL.refreshUserBalance, props),
    ...options,
  });

const useGetUsers = (props: GetUsersProps) =>
  useQuery<IGetUsersResponse>({
    queryKey: ["list-users", props.page, props.pageSize],
    queryFn: async () => {
      const { page = 0, pageSize = 10 } = props;
      const res = await api.get(API_URL.getAllUsers, {
        params: { skip: page * pageSize, limit: pageSize },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users: any = res.data as [IUser];

      return users?.users.sort(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any, b: any) =>
          new Date(b?.createdAt).valueOf() - new Date(a?.createdAt).valueOf(),
      );
    },
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

const useGetTransactionsStatistics = (props: GetStartAndEndDate) =>
  useQuery({
    queryKey: ["list-transactions-statistics"],
    queryFn: async () => {
      const { startDate, endDate } = props;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await api.get(
        API_URL.getDashboardTransactionsStatistics,
        { params: { startDate, endDate } },
      );

      return res.data?.data;
    },
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

const useGetTopTokens = () =>
  useQuery({
    queryKey: ["list-top-tokens"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await api.get(API_URL.getTopTokens);

      return res.data?.data;
    },
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

const useGetTokens = (props: GetTokensProps) =>
  useQuery<IGetAffiliatesResponse>({
    queryKey: ["list-affiliate", props.page, props.pageSize],
    queryFn: async () => {
      const { page = 0, pageSize = 10 } = props;
      const res = await api.get(API_URL.getTokens, {
        params: { skip: page * pageSize, limit: pageSize },
      });
      const users = res.data.allTokensData as [ITokens];

      return { data: users };
    },
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

const useSaveCorporateBankChange = (
  options?: UseMutationOptions<
    iPostChangeBanResp,
    iPostChangeBankErr,
    FormData
  >,
) =>
  useMutation<iPostChangeBanResp, iPostChangeBankErr, FormData>({
    mutationFn: async (props: FormData) =>
      (
        await api.post(API_URL.changeCorporateBankAccount, props, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data,
    ...options,
  });

export {
  useSetLanguage,
  useGetUsers,
  useGetTransactionsStatistics,
  useGetTopTokens,
  useGetTokens,
  useRefreshUserBalance,
  useSaveCorporateBankChange,
};
