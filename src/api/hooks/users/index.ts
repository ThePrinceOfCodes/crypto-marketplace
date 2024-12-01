import { api, queryClient } from "api";
import { API_URL } from "api/url";
import { AxiosError } from "axios";
import { omit } from "lodash";
import {
  useInfiniteQuery,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  useQueryClient,
} from "react-query";
import {
  GetCardPointsProps,
  GetUserCardProps,
  GetUserHistoryType,
  GetUserTokensType,
  GetUserTransactionHistoryType,
  IGetCardPointsResponse,
  IGetUserTransactionResponse,
  IPrices,
  IToken,
  IUserCard,
  IUserHistory,
  GetUserRpaHistoryType,
  IGetUserRPAResponse,
  ICardInfo,
  GetUserCardInfoType,
  IGetUserRpaErrorLogsResponse,
  GetUserRpaErrorLogsType,
  IAppConnection,
  GetUserAppConnectionType,
  GetUserNotificationType,
  INotification,
} from "./types";

export type iGetUserTransactionHistoryResp = IGetUserTransactionResponse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetUserTransactionHistoryErr = AxiosError<any>;
export type iGetUserTransactionHistoryRsq = GetUserTransactionHistoryType;
const useGetUserTransactionHistory = ({
  email,
  searchKey,
  limit,
  lastId,
  includeDraft,
}: iGetUserTransactionHistoryRsq) => {
  const query = useInfiniteQuery<
    iGetUserTransactionHistoryResp,
    iGetUserTransactionHistoryErr
  >({
    queryKey: ["user-transaction-history", email, searchKey, includeDraft],
    queryFn: async ({ pageParam = {} }) => {
      return (
        await api.get(API_URL.getUserHistory, {
          params: {
            email,
            includeDraft,
            limit: limit,
            searchKey,
            lastId,
            ...pageParam,
          },
        })
      ).data;
    },
    enabled: !!email,
  });

  return {
    ...query,
    data: {
      ...query.data?.pages[query.data?.pages.length - 1],
      user_transaction: query.data?.pages
        .flat()
        .map((item) => item?.transactions)
        .flat()
        .filter((item) => item?.uuid),
    },
  };
};

export type IGetUserTokensErr = AxiosError<{
  result: string;
}>;
const useGetUserTokens = (
  { email }: GetUserTokensType,
  options?: UseQueryOptions<IToken[], IGetUserTokensErr>,
) =>
  useQuery<IToken[], IGetUserTokensErr>({
    queryKey: ["user-tokens", email],
    queryFn: async () =>
      (await api.get(API_URL.getUserTokens, { params: { email } })).data
        .userTokens,
    enabled: !!email,
    cacheTime: 1000,
    retry: false,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...omit(options, "queryKey"),
  });

const useGetUserHistory = (props: GetUserHistoryType) =>
  useQuery<IUserHistory>({
    queryKey: ["user-history", ...Object.values(props)],
    queryFn: async () =>
      (await api.get(API_URL.getUserLogActivity, { params: props })).data,
    enabled: !!props.user_id,
  });

const useGetUserNotification = ({
  user_id,
  limit,
}: GetUserNotificationType) => {
  const query = useInfiniteQuery<INotification>({
    queryKey: ["user-notification", user_id, limit],
    queryFn: async ({ pageParam = {} }) => {
      return (
        await api.get(API_URL.getUserNotification, {
          params: { user_id, limit, ...pageParam },
        })
      ).data;
    },
  });

  return {
    ...query,
    data: {
      ...query.data?.pages[query.data?.pages.length - 1],
      notifications: query.data?.pages
        .flat()
        .map((item) => item?.notifications)
        .flat()
        .filter((item) => item?.id),
    },
  };
};

const useGetUserCards = (args: GetUserCardProps) =>
  useQuery({
    queryKey: ["list-user-cards", args.page, args.pageSize],
    queryFn: async () => {
      const { page = 0, pageSize = 10 } = args;
      const res = await api.get(API_URL.cards, {
        params: { skip: page * pageSize, limit: pageSize },
      });
      const users = res.data as [IUserCard];
      return { data: users, total: res.data.total };
    },
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

const useGetCardPoints = ({ page, pageSize }: GetCardPointsProps) =>
  useQuery<IGetCardPointsResponse>({
    queryKey: ["list-card-points", page, pageSize],
    queryFn: async () => {
      const resp = await api.get(API_URL.cardPoints, {
        params: { skip: page * pageSize, limit: pageSize },
      });

      return {
        data: resp.data,
        total: resp.data.total,
      };
    },
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

const useGetDashboardPrices = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useQuery<any>({
    queryKey: ["dashboard-prices"],
    queryFn: async () => {
      const prices = (await api.get(API_URL.getPrices)).data.tokens;
      const result = Object.keys(prices)
        .map((el) => ({
          token: el,
          data: {
            ...prices[el],
            price: parseFloat(
              prices[el].price.toFixed(2).replace(/[.,]00$/, ""),
            ),
          },
        }))
        .filter((el) => ["MSQ", "MSQX", "POL"].includes(el.token));

      return result;
    },
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

const useGetP2PWalletBalance = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useQuery<any>({
    queryKey: ["company-wallet-balance"],
    queryFn: async () => {
      const walletBalance = (await api.get(API_URL.getP2PWalletBalance)).data.data;

            const pol = walletBalance.polBalance.toFixed(1).replace(/[.,]0$/, "");
            const msq = walletBalance.msqBalance.toFixed(1).replace(/[.,]0$/, "");
            const msqx = walletBalance.msqxBalance.toFixed(1).replace(/[.,]0$/, "");

            return { pol, msq, msqx };
    },
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

export type IGetPricesErr = AxiosError<{
  //need to confirm
  result: string;
}>;
const useGetPrices = (
  options?: Omit<UseQueryOptions<IPrices, IGetPricesErr>, "queryFn">,
) =>
  useQuery<IPrices, IGetPricesErr>({
    queryKey: ["get-prices"],
    queryFn: async () => (await api.get(API_URL.getPrices)).data.tokens,
    refetchOnMount: false,
    ...omit(options, "queryKey"),
  });

export type IAddTokenExchangeRateErr = AxiosError<{
  message: string;
  error: string;
}>;
export interface IAddTokenExchangeRateRes {
  createdAt: number;
  source_token_name: string;
  source_token_price: number;
  target_token_name: string;
  target_token_price: number;
  updatedAt: number;
  uuid: string;
}
export interface IAddTokenExchangeRateProps {
  source_token_price: number;
  target_token_price: number;
  source_token_name: string;
  target_token_name: string;
}

const useAddTokenExchangeRate = (
  options?: UseMutationOptions<
    IAddTokenExchangeRateRes,
    IAddTokenExchangeRateErr,
    IAddTokenExchangeRateProps
  >,
) =>
  useMutation<
    IAddTokenExchangeRateRes,
    IAddTokenExchangeRateErr,
    IAddTokenExchangeRateProps
  >({
    mutationFn: async (props) =>
      (
        await api.post(API_URL.addTokensExchangeRates, {
          ...props,
        })
      ).data,
    ...options,
  });

// ----------------------------------------------
export type IUpdateUserPasswordErr =
  | AxiosError<string>
  | AxiosError<{ message: string; status?: string }>;
export interface IUpdateUserPasswordProps {
  currentPassword: string;
  newPassword: string;
}
export interface IUpdateUserPasswordRes {
  message: string;
}

const useUpdateUserPassword = (
  options?: UseMutationOptions<
    IUpdateUserPasswordRes,
    IUpdateUserPasswordErr,
    IUpdateUserPasswordProps
  >,
) =>
  useMutation<
    IUpdateUserPasswordRes,
    IUpdateUserPasswordErr,
    IUpdateUserPasswordProps
  >({
    mutationFn: async ({ currentPassword, newPassword }) =>
      (
        await api.post(API_URL.updateUserPassword, {
          currentPassword,
          newPassword,
        })
      ).data,
    ...options,
  });

// ----------------------------------------------

export type IAddTokensErr = AxiosError<{ message: string; status: string }>;

export interface IAddTokensProps extends FormData {
  tokenName: string;
  price: string;
  file: string;
}

export interface IAddTokensRes {
  message: string;
}

const useAddTokens = (
  options?: UseMutationOptions<IAddTokensRes, IAddTokensErr, FormData>,
) =>
  useMutation<IAddTokensRes, IAddTokensErr, FormData>({
    mutationFn: async (props: FormData) =>
      (
        await api.post(API_URL.addTokens, props, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data,
    ...options,
  });
// ----------------------------------------------
export type IAddFreeTokensErr = AxiosError<{ message: string; error: string }>;

export interface IAddFreeTokensProps {
  token: string;
  amount: string;
}

export interface IAddFreeTokensRes {
  amount: string;
  createdAt: string;
  token: string;
  updatedAt: string;
}

const useAddFreeTokens = (
  options?: UseMutationOptions<
    IAddFreeTokensRes,
    IAddFreeTokensErr,
    IAddFreeTokensProps
  >,
) =>
  useMutation<IAddFreeTokensRes, IAddFreeTokensErr, IAddFreeTokensProps>({
    mutationFn: async (props) =>
      (
        await api.post(API_URL.addFreeTokens, {
          token: props.token,
          amount: props.amount,
        })
      ).data,
    ...options,
  });
// ----------------------------------------------
export interface IGetFreeTokensRes {
  amount: string;
  token: string;
}
export type IGetFreeTokensErr = AxiosError<{ message: string; error: string }>;

const useGetFreeTokens = (
  options?: UseQueryOptions<IGetFreeTokensRes[], IGetFreeTokensErr>,
) =>
  useQuery<IGetFreeTokensRes[], IGetFreeTokensErr>({
    queryKey: ["free-tokens-list"],
    queryFn: async () => {
      const res = await api.get(API_URL.getFreeTokens);
      return res?.data;
    },
    ...options,
  });
// ----------------------------------------------
export type IGetCardHistoriesErr = AxiosError<{ status: string }>;
export interface IGetCardHistoriesProps {
  query?: {
    userId?: string | number;
  };
}

const useGetCardHistories = (
  props: IGetCardHistoriesProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: UseQueryOptions<any, IGetCardHistoriesErr>,
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useQuery<any, IGetCardHistoriesErr>({
    queryKey: ["card-histories", props?.query?.userId],
    queryFn: async () => {
      const res = await api.get(
        `${API_URL.cardHistories}/${props?.query?.userId}`,
      );
      return res.data;
    },
    ...options,
  });
// ----------------------------------------------
export type IApprovePlatformRequestsErr = AxiosError<{
  message?: string;
  err?: string;
  status?: string;
}>;

export interface IApprovePlatformRequestProps {
  platform_uuid: string;
}

export interface IApprovePlatformRequestRes {
  status: string;
  message: string;
}

const useApprovePlatformRequest = (
  options?: UseMutationOptions<
    IApprovePlatformRequestRes,
    IApprovePlatformRequestsErr,
    IApprovePlatformRequestProps
  >,
) =>
  useMutation<
    IApprovePlatformRequestRes,
    IApprovePlatformRequestsErr,
    IApprovePlatformRequestProps
  >({
    mutationFn: async (props) =>
      (
        await api.patch(API_URL.approvePlatFormRequest, {
          platform_uuid: props.platform_uuid,
        })
      ).data,
    ...options,
  });
// ----------------------------------------------
export type IDeclinePlatformRequestsErr = AxiosError<{
  message?: string;
  err?: string;
  status?: string;
}>;

export interface IDeclinePlatformRequestProps {
  platform_uuid: string;
}

export interface IDeclinePlatformRequestRes {
  status: string;
  message: string;
}

const useDeclinePlatformRequest = (
  options?: UseMutationOptions<
    IDeclinePlatformRequestRes,
    IDeclinePlatformRequestsErr,
    IDeclinePlatformRequestProps
  >,
) =>
  useMutation<
    IDeclinePlatformRequestRes,
    IDeclinePlatformRequestsErr,
    IDeclinePlatformRequestProps
  >({
    mutationFn: async (props) =>
      (
        await api.patch(API_URL.declinePlatFormRequest, {
          platform_uuid: props.platform_uuid,
        })
      ).data,
    ...options,
  });
// ----------------------------------------------
export type IResetPasswordErr = AxiosError<{
  message?: string;
  result?: string;
  error?: string;
}>;

export interface IResetPasswordProps {
  newPassword: string;
  token: string;
}

export interface IResetPasswordRes {
  message: string;
}

const useResetPassword = (
  options?: UseMutationOptions<
    IResetPasswordRes,
    IResetPasswordErr,
    IResetPasswordProps
  >,
) =>
  useMutation<IResetPasswordRes, IResetPasswordErr, IResetPasswordProps>({
    mutationFn: async (props) =>
      (
        await api.post(API_URL.resetPwd, {
          newPassword: props.newPassword,
          token: props.token,
        })
      ).data,
    ...options,
  });
// ----------------------------------------------
export type IResetPasswordRequestErr = AxiosError<{
  message: string;
  error?: string;
}>;

export interface IResetPasswordRequestProps {
  email: string;
}

export interface IResetPasswordRequestRes {
  status: string;
}

const useResetPasswordRequest = (
  options?: UseMutationOptions<
    IResetPasswordRequestRes,
    IResetPasswordRequestErr,
    IResetPasswordRequestProps
  >,
) =>
  useMutation<
    IResetPasswordRequestRes,
    IResetPasswordRequestErr,
    IResetPasswordRequestProps
  >({
    mutationFn: async (props) =>
      (await api.post(API_URL.resetPwdRequest, { email: props?.email })).data,
    ...options,
  });
// ----------------------------------------------

export type IAddPlatformsErr = AxiosError<{ message: string }>;
export interface IAddPlatformsProps {
  file: string;
  name: string;
  platform: string;
  url: string;
}
export interface IAddPlatformsRes {
  status: string;
}

const useAddPlatforms = () =>
  useMutation<IAddPlatformsRes, IAddPlatformsErr, FormData>({
    mutationFn: async (props: FormData) =>
      (
        await api.post(API_URL.addPlatform, props, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries(["list-platforms"]);
      await queryClient.invalidateQueries(["all-platforms"]);
    },
  });
// ----------------------------------------------

const useGetUser = (
  { token }: { token: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: UseQueryOptions<any, IGetCardHistoriesErr>,
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useQuery<any, IGetCardHistoriesErr>({
    queryKey: ["user"],
    queryFn: async () =>
      await api.get(API_URL.getUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ...options,
  });

// ----------------------------------------------
export type iPostUserSignUpErr = AxiosError<{
  message?: string;
  error?: string;
}>;
export type iPostUserSignUpResp = {
  status: string;
  data: {
    email: string;
    name: string;
    phone_number: string;
    token: string;
    role: number;
  };
};
export type iPostUserSignUpRsq = {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
};

const usePostUserSignUp = (
  options?: Omit<
    UseMutationOptions<
      iPostUserSignUpResp,
      iPostUserSignUpErr,
      iPostUserSignUpRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<iPostUserSignUpResp, iPostUserSignUpErr, iPostUserSignUpRsq>({
    mutationFn: async (props) =>
      (
        await api.post(API_URL.signUp, {
          ...props,
          phone_number: props.phoneNumber,
        })
      ).data,
    ...options,
  });
// ----------------------------------------------
export type iPostUserSignInErr = AxiosError<{
  message?: string;
  error?: string;
}>;
export type iPostUserSignInResp = {
  status: string;
  data: {
    avatar: string;
    email: string;
    name: string;
    phone_number: string;
    role: number;
    token: string;
  };
};
export type iPostUserSignInRsq = {
  email: string;
  password: string;
};

const usePostUserSignIn = (
  options?: Omit<
    UseMutationOptions<
      iPostUserSignInResp,
      iPostUserSignInErr,
      iPostUserSignInRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<iPostUserSignInResp, iPostUserSignInErr, iPostUserSignInRsq>({
    mutationFn: async (props) =>
      (
        await api.post(API_URL.signIn, {
          ...props,
        })
      ).data,
    ...options,
  });
// ----------------------------------------------
export type iPostResendOTPErr = AxiosError<{
  error: string;
}>;
export type iPostResendOTPResp = {
  status: string;
};
export type iPostResendOTPRsq = {
  email: string;
  phoneNumber?: string;
};

const usePostResendOTP = (
  options?: Omit<
    UseMutationOptions<
      iPostResendOTPResp,
      iPostResendOTPErr,
      iPostResendOTPRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<iPostResendOTPResp, iPostResendOTPErr, iPostResendOTPRsq>({
    mutationFn: async (props) =>
      (
        await api.post(API_URL.resendOTP, {
          ...props,
        })
      ).data,
    ...options,
  });

// ----------------------------------------------
export type iPostVerifyOTPErr = AxiosError<{
  error?: string;
  message?: string;
  status?: string;
}>;
export type iPostVerifyOTPResp = {
  status: string;
  data: {
    avatar: string;
    email: string;
    name: string;
    phone_number: string;
    role: number;
    token: string;
  };
};
export type iPostVerifyOTPRsq = {
  email: string;
  OTP?: string;
  phoneNumber?: string;
};

const usePostVerifyOTP = (
  options?: Omit<
    UseMutationOptions<
      iPostVerifyOTPResp,
      iPostVerifyOTPErr,
      iPostVerifyOTPRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<iPostVerifyOTPResp, iPostVerifyOTPErr, iPostVerifyOTPRsq>({
    mutationFn: async (props) =>
      (
        await api.post(API_URL.verifyOTP, {
          ...props,
        })
      ).data,
    ...options,
  });
// ----------------------------------------------
export type iPostUpdateUserErr = AxiosError<{
  error?: string;
  message?: string;
  status?: string;
}>;
export type iPostUpdateUserResp = {
  status: string;
  user: {
    avatar: string;
    email: string;
    name: string;
    phone_number: string;
    roles: number;
    token: string;
  };
};
export type iPostUpdateUserRsq = {
  formData: FormData;
};

const usePostUpdateUser = (
  options?: Omit<
    UseMutationOptions<
      iPostUpdateUserResp,
      iPostUpdateUserErr,
      iPostUpdateUserRsq
    >,
    "mutationFn"
  >,
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMutation<iPostUpdateUserResp, iPostUpdateUserErr, any>({
    mutationFn: async (props) =>
      (
        await api.post(API_URL.updateUser, props, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data,
    ...options,
  });

// ----------------------------------------------

export type IUserBankAccountsResponse = {
  bank_account_number: string;
  bank_name: string;
  createdAt: string;
  created_at: string;
  is_main_account: boolean;
  updatedAt: string;
  user_id: string;
  uuid: string;
};
export type IGetAllBankAccountListRes = {
  result: string;
  userBankAccountsResponse: IUserBankAccountsResponse[];
};
export type IGetAllBankAccountListErr = AxiosError<{
  message: string;
  error: string;
}>;

export type IGetAllBankAccountListRsq = {
  user_id?: string;
};
const useGetAllBankAccountList = (
  props: IGetAllBankAccountListRsq,
  options?: UseQueryOptions<
    IGetAllBankAccountListRes,
    IGetAllBankAccountListErr
  >,
) =>
  useQuery<IGetAllBankAccountListRes, IGetAllBankAccountListErr>({
    queryKey: ["get-user-bank-list", props.user_id],
    queryFn: async () => {
      const res = await api.get(
        `${API_URL.getUserAllBankAccount}?user_id=${props.user_id}`,
      );
      return res?.data;
    },
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    ...options,
  });

// ----------------------------------------------

export type IAddUserBankAccountRsq = {
  user_id: "string";
  bank_name: "string";
  bank_account_number: "string";
};

const usePostUserBankAccount = (
  options?: Omit<
    UseMutationOptions<
      iPostVerifyOTPResp,
      iPostVerifyOTPErr,
      IAddUserBankAccountRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<iPostVerifyOTPResp, iPostVerifyOTPErr, IAddUserBankAccountRsq>({
    mutationFn: async (props) =>
      (
        await api.post(API_URL.addUserBankAccount, {
          ...props,
        })
      ).data,
    ...options,
  });

// ----------------------------------------------

export type IDeleteUserBankAccountRsq = {
  bank_ids: string[];
};

export type IDeleteUserBankAccountErr = AxiosError<{
  message: string;
  result: string;
}>;

export type IDeleteUserBankAccountResp = {
  result: string;
};

const useDeleteUserBankAccount = (
  options?: Omit<
    UseMutationOptions<
      IDeleteUserBankAccountResp,
      IDeleteUserBankAccountErr,
      IDeleteUserBankAccountRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    IDeleteUserBankAccountResp,
    IDeleteUserBankAccountErr,
    IDeleteUserBankAccountRsq
  >({
    mutationFn: async (props) =>
      (
        await api.delete(API_URL.deleteUserBankAccount, {
          data: { bank_ids: [...props.bank_ids] },
        })
      ).data,
    ...omit(options, "queryKey"),
  });

// ----------------------------------------------

export type IPostSetUserMainBankAccountRsq = {
  user_id?: string;
  bank_id: string;
};

export type IPostSetUserMainBankAccountResp = {
  result: string;
};

export type IPostSetUserMainBankAccountErr = AxiosError<{
  message?: string;
  result?: string;
}>;

const usePostSetUserMainBankAccount = (
  options?: Omit<
    UseMutationOptions<
      IPostSetUserMainBankAccountResp,
      IPostSetUserMainBankAccountErr,
      IPostSetUserMainBankAccountRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    IPostSetUserMainBankAccountResp,
    IPostSetUserMainBankAccountErr,
    IPostSetUserMainBankAccountRsq
  >({
    mutationFn: async (props) =>
      (
        await api.post(API_URL.setUserMainBankAccount, {
          ...props,
        })
      ).data,
    ...options,
  });

// ----------------------------------------------

export type IGetAllWalletAccountListErr = AxiosError<{
  message: string;
  error: string;
}>;

export type IGetAllWalletAccountListRsq = {
  user_id?: string;
};

export interface UserWalletAccount {
  user_id: string;
  created_at: string;
  wallet_type: string;
  updatedAt: string;
  is_main_wallet: boolean;
  createdAt: string;
  uuid: string;
  wallet_id: string;
}

interface IGetAllWalletAccountListRes {
  result: string;
  userWalletAccountsResponse: UserWalletAccount[];
}

const useGetAllWalletAccountList = (
  props: IGetAllWalletAccountListRsq,
  options?: UseQueryOptions<
    IGetAllWalletAccountListRes,
    IGetAllWalletAccountListErr
  >,
) =>
  useQuery<IGetAllWalletAccountListRes, IGetAllWalletAccountListErr>({
    queryKey: ["get-user-wallet-list", props.user_id],
    queryFn: async () => {
      const res = await api.get(
        `${API_URL.getUserAllWalletAccount}?user_id=${props.user_id}`,
      );
      return res?.data;
    },
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    ...options,
  });

// ----------------------------------------------

export type IDeleteUserWalletAccountRsq = {
  wallet_ids: string[];
};

export type IDeleteUserWalletAccountErr = AxiosError<{
  message: string;
  result: string;
}>;

export type IDeleteUserWalletAccountResp = {
  result: string;
};

const useDeleteUserWalletAccount = (
  options?: Omit<
    UseMutationOptions<
      IDeleteUserWalletAccountResp,
      IDeleteUserWalletAccountErr,
      IDeleteUserWalletAccountRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    IDeleteUserWalletAccountResp,
    IDeleteUserWalletAccountErr,
    IDeleteUserWalletAccountRsq
  >({
    mutationFn: async (props) =>
      (
        await api.delete(API_URL.deleteUserWalletAccount, {
          data: { wallet_ids: [...props.wallet_ids] },
        })
      ).data,
    ...omit(options, "queryKey"),
  });

// ----------------------------------------------

export type IPostSetUserMainWalletAccountRsq = {
  user_id?: string;
  id: string;
};
export type IPostSetUserMainWalletAccountResp = {
  result: string;
};
export type IPostSetUserMainWalletAccountErr = AxiosError<{
  message?: string;
  result?: string;
}>;

const usePostSetUserMainWalletAccount = (
  options?: Omit<
    UseMutationOptions<
      IPostSetUserMainWalletAccountResp,
      IPostSetUserMainWalletAccountErr,
      IPostSetUserMainWalletAccountRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    IPostSetUserMainWalletAccountResp,
    IPostSetUserMainWalletAccountErr,
    IPostSetUserMainWalletAccountRsq
  >({
    mutationFn: async (props) =>
      (
        await api.post(API_URL.setUserMainWalletAccount, {
          ...props,
        })
      ).data,
    ...options,
  });

export type iGetUserRpaHistoryResp = IGetUserRPAResponse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetUserRpaHistoryErr = AxiosError<any>;
export type iGetUserRpaHistoryRsq = GetUserRpaHistoryType;
const useGetUserRpaHistory = (props: iGetUserRpaHistoryRsq,options?: UseQueryOptions< iGetUserRpaHistoryResp, AxiosError<any>>,) =>
   useQuery<iGetUserRpaHistoryResp, iGetUserRpaHistoryErr>({
      queryKey: ["user-rpa-history", ...Object.values(props)],
      queryFn: async () =>
       (
          await api.get(API_URL.getUserRPAHistory, {
            params: props,
          })
        ).data,
        ...options
      },
    );


    const useGetMassRpaHistory = () =>
      useMutation<iGetUserRpaHistoryResp, void, iGetUserRpaHistoryRsq>({
    mutationFn: async (props) =>
      (await api.get(API_URL.getUserRPAHistory, { params: props })).data,
  });


export type iGetUserCardInfoResp = ICardInfo;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetUserCardInfoErr = AxiosError<any>;
export type iGetUserCardInfoRsq = GetUserCardInfoType;
const useGetCardInformation = ({ email }: iGetUserCardInfoRsq) => {
  const query = useInfiniteQuery<iGetUserCardInfoResp, iGetUserCardInfoErr>({
    queryKey: ["user-card-info", email],
    queryFn: async () => {
      return (
        await api.get(API_URL.getUserCardInformation, {
          params: { email },
        })
      ).data;
    },
    enabled: !!email,
  });

  return {
    ...query,
    data: {
      ...query.data?.pages[query.data?.pages.length - 1],
    },
  };
};

// -----------------------------------------------------------

interface DeleteUserCardDetailsRequest {
  email: string;
  card_id: string;
  company_code: string;
  memo: string;
}

const deleteUserCardDetails = async (
  request: DeleteUserCardDetailsRequest,
): Promise<{ code: number; msg: string }> => {
  const response = await api.delete<{ code: number; msg: string }>(
    API_URL.deleteCardDetails,
    { data: request },
  );
  return response.data;
};

const useDeleteUserCardDetails = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (request: DeleteUserCardDetailsRequest) => deleteUserCardDetails(request),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user-card-info");
      },
    },
  );

  return mutation;
};

// -----------------------------------------------------------

export type iGetUserRpaErrorLogsResp = IGetUserRpaErrorLogsResponse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetUserRpaErrorLogsErr = AxiosError<any>;
export type iGetUserRpaErrorLogsRsq = GetUserRpaErrorLogsType;

const useGetUserRpaErrorLogs = (props: iGetUserRpaErrorLogsRsq,options?: UseQueryOptions< iGetUserRpaErrorLogsResp, AxiosError<any>>,) =>
  useQuery<iGetUserRpaErrorLogsResp, iGetUserRpaErrorLogsErr>({
     queryKey: ["user-rpa-errors", ...Object.values(props)],
     queryFn: async () =>
      (
         await api.get(API_URL.getUserRPAErrorLogs, {
           params: props,
         })
       ).data,
       ...options
     },
   );

const useGetMassRpaErrorLogs = () =>
  useMutation<iGetUserRpaErrorLogsResp, void, GetUserRpaErrorLogsType>({
mutationFn: async (props) =>
  (await api.get(API_URL.getUserRPAErrorLogs, { params: props })).data,
});

//-----------------------------------------------------------------------------

export type iGetUserAppConnectionResp = IAppConnection;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetUserAppConnectionErr = AxiosError<any>;
export type iGetUserAppConnectionRsq = GetUserAppConnectionType;
const useGetUserAppConnection = ({ email }: iGetUserAppConnectionRsq) => {
  const query = useInfiniteQuery<
    iGetUserAppConnectionResp,
    iGetUserAppConnectionErr
  >({
    queryKey: ["user-app-connection", email],
    queryFn: async () => {
      return (
        await api.get(API_URL.getUserappConnections, {
          params: { email },
        })
      ).data;
    },
  });

  return {
    ...query,
    data: {
      ...query.data?.pages[query.data?.pages.length - 1],
    },
  };
};

//-----------------------------------------------------------------

interface DisconnectAppRequest {
  email: string;
  request_key: string;
}

const disconnectUserApp = async (
  request: DisconnectAppRequest,
): Promise<string> => {
  const response = await api.delete<string>(API_URL.deleteAppConnection, {
    data: request,
  });
  return response.data;
};

const useDisconnectApp = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (request: DisconnectAppRequest) => disconnectUserApp(request),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user-app-connection-info");
      },
    },
  );

  return mutation;
};

//--------------------------------------------------------------------

// const useGetUserRpaErrorLogs = (
//   { email,
//     lastCreatedAt,
//     lastEmail,
//     limit }: iGetUserRpaErrorLogsRsq,
//   options?: Omit<
//     UseQueryOptions<iGetUserRpaErrorLogsResp, iGetUserRpaErrorLogsErr>,
//     "queryKey" | "queryFn"
//   >,
// ) =>
//   useQuery<iGetUserRpaErrorLogsResp, iGetUserRpaErrorLogsErr>({
//     queryKey: ["user-rpa-errors", email, limit, lastEmail, lastCreatedAt],
//     queryFn: async () =>
//       (
//         await api.get(API_URL.getUserRPAErrorLogs, {
//           params: { email, limit, lastEmail, lastCreatedAt },
//         })
//       ).data,
//     ...options,
//   });

export {
  useGetCardPoints,
  useGetDashboardPrices,
  useGetPrices,
  useGetUserTransactionHistory,
  useGetUserTokens,
  useGetUserCards,
  useAddTokenExchangeRate,
  useUpdateUserPassword,
  useAddTokens,
  useAddFreeTokens,
  useGetFreeTokens,
  useGetCardHistories,
  useApprovePlatformRequest,
  useDeclinePlatformRequest,
  useResetPassword,
  useAddPlatforms,
  useResetPasswordRequest,
  useGetUser,
  usePostUserSignUp,
  usePostUserSignIn,
  usePostResendOTP,
  usePostVerifyOTP,
  usePostUpdateUser,
  useGetUserHistory,
  useGetAllBankAccountList,
  usePostUserBankAccount,
  useDeleteUserBankAccount,
  usePostSetUserMainBankAccount,
  useGetAllWalletAccountList,
  usePostSetUserMainWalletAccount,
  useDeleteUserWalletAccount,
  useGetUserRpaHistory,
  useGetCardInformation,
  useGetUserRpaErrorLogs,
  useGetUserAppConnection,
  useDisconnectApp,
  useDeleteUserCardDetails,
  useGetUserNotification,
  useGetMassRpaHistory,
  useGetMassRpaErrorLogs,
  useGetP2PWalletBalance,
};
