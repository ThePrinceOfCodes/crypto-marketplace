import {
  useInfiniteQuery,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
} from "react-query";
import { api, API_URL } from "api";
import { LocalsType } from "locale";
import {
  GetUsersBalanceType,
  GetUserTokenTransactionHistoryType,
  IGetPlatformBalanceResponse,
  IGetUsersBalanceResponse,
  IGetUserTokenTransactionHistoryResponse,
  IPlatforms,
  IMsqPlatformUsers,
} from "./types";
import { useLazyQuery } from "@common/hooks";
import { AxiosError } from "axios";
import { omit } from "lodash";
import { toast } from "react-toastify";

const useGetDashboardStatistics = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useQuery<any>({
    queryKey: ["data-stats"],
    queryFn: async () => (await api.get(API_URL.getDashboardStatistics)).data,
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

const useGetLanguage = () =>
  useQuery<LocalsType>({
    queryKey: ["get-language"],
    queryFn: async () => (await api.get(API_URL.getlanguage))?.data.language,
  });

// ===================================================
export type iGetPlatformsRequestsResp = {
  status: string;
  lastId: string;
  hasNext: boolean;
  platforms: IPlatforms[];
};
export type iGetPlatformsRequestsErr = AxiosError<{
  error?: string;
  message: string;
}>;
export type iGetPlatformsRequestsRsq = {
  limit: number;
  lastId?: string;
  searchKey?: string;
};
const useGetPlatformsRequests = (
  props: iGetPlatformsRequestsRsq,
  options?: Omit<
    UseQueryOptions<iGetPlatformsRequestsResp, iGetPlatformsRequestsErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetPlatformsRequestsResp, iGetPlatformsRequestsErr>({
    queryKey: ["list-platforms-requests", ...Object.values(props)],
    queryFn: async () =>
      (await api.get(API_URL.getPlatformRequests, { params: props })).data,
    ...options,
  });

// ===================================================

export type IGetSettingsResp = {
  createdAt: string;
  value: string;
  key: string;
  updatedAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useGetSettings = () =>
  useQuery<IGetSettingsResp[], void>({
    queryKey: ["list-settings"],
    queryFn: async () => (await api.get(API_URL.getAllSettings)).data,
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

// ===================================================

export interface PointAccumulationType {
  ENABLE_P2U_ACCUMULATION: string;
  P2U_STORE_PERCENTAGE: string;
  NON_P2U_STORE_PERCENTAGE: string;
  CALCULATE_THRESHOLD: string;
  CALCULATE_POINTS_WITH: string;
  ACCUMULATE_POINTS_FOR: string;
  MULTIPLE_CARD_ACCUMULATION: string;
  SAME_CARD_ACCUMULATION: string;
}

export interface IPointAccumulationSettingsRes {
  message: string;
  settings: PointAccumulationType;
}

const useGetPointAccumulationSettings = () =>
  useQuery<IPointAccumulationSettingsRes, void>({
    queryKey: ["point-accumulation-settings"],
    queryFn: async () => (await api.get(API_URL.getPointAccumulation)).data,
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

// ===================================================

export type ISavePointAccumulationErr = AxiosError<{
  message: string;
  error: string;
}>;
export interface ISavePointAccumulationProps {
  ENABLE_P2U_ACCUMULATION: string;
  P2U_STORE_PERCENTAGE: string;
  NON_P2U_STORE_PERCENTAGE: string;
  CALCULATE_THRESHOLD: string;
  CALCULATE_POINTS_WITH: string;
  ACCUMULATE_POINTS_FOR: string;
  MULTIPLE_CARD_ACCUMULATION: string;
  SAME_CARD_ACCUMULATION: string;
}

export interface ExtendedISavePointAccumulationProps extends ISavePointAccumulationProps {
  CRON_DATE?: string;
  CRON_TIME?: string;
}

export interface ISavePointAccumulationRes {
  message: string;
}

const useSavePointAccumulation = (
  options?: UseMutationOptions<
    ISavePointAccumulationRes,
    ISavePointAccumulationErr,
    ISavePointAccumulationProps
  >,
) =>
  useMutation<
    ISavePointAccumulationRes,
    ISavePointAccumulationErr,
    ISavePointAccumulationProps
  >({
    mutationFn: async (props) =>
      (await api.post(API_URL.postPointAccumulation, props)).data,
    ...options,
  });

// ===================================================

export type iPostOTPResp = {
  status: string;
};
export type iPostOTPErr = AxiosError<{
  error: string;
}>;
export type iPostOTPRsq = {
  email?: string;
  phone_number: string;
};
const usePostSendOTP = (
  options?: Omit<
    UseMutationOptions<iPostOTPResp, iPostOTPErr, iPostOTPRsq>,
    "mutationFn"
  >,
) =>
  useMutation<iPostOTPResp, iPostOTPErr, iPostOTPRsq>({
    mutationFn: async (props) =>
      (await api.post(API_URL.postSendOTP, props)).data,
    ...options,
  });
const usePostInitiatePhoneNumberUpdate = (
  options?: Omit<
    UseMutationOptions<iPostOTPResp, iPostOTPErr, iPostOTPRsq>,
    "mutationFn"
  >,
) =>
  useMutation<iPostOTPResp, iPostOTPErr, iPostOTPRsq>({
    mutationFn: async (props) =>
      (await api.post(API_URL.postInitiatePhoneUpdate, props)).data,
    ...options,
  });

export type iGetVerifyAccountResp = void;
export type iGetVerifyAccountErr = AxiosError<{
  error: string;
  message: string;
}>;
export type iGetVerifyAccountRsq = { token: string };
const useLazyGetVerifyAccount = (
  { token }: iGetVerifyAccountRsq,
  options?: Omit<
    UseQueryOptions<iGetVerifyAccountResp, iGetVerifyAccountErr>,
    "queryKey" | "queryFn"
  >,
) => {
  return useLazyQuery<iGetVerifyAccountResp, iGetVerifyAccountErr>({
    queryKey: ["verify-account"],
    queryFn: async () => {
      await api.get(API_URL.verifyAccount, { params: { token } });
    },
    options,
  });
};

export type iGetAllPlatformsResp = {
  platforms: IPlatforms[];
  nbElements: number;
  nbTotalElements: number;
  hasNext: boolean;
  lastId: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetAllPlatformsErr = AxiosError<any>;
export type iGetAllPlatformsRsq = {
  limit: number;
  lastId?: string;
  searchKey?: string;
  hasNext?: boolean
};
const useGetAllPlatforms = (
  { limit, lastId, searchKey }: iGetAllPlatformsRsq,
  options?: Omit<
    UseQueryOptions<iGetAllPlatformsResp, iGetAllPlatformsErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetAllPlatformsResp, iGetAllPlatformsErr>({
    queryKey: ["all-platforms", limit, lastId, searchKey],
    queryFn: async () =>
      (
        await api.get(API_URL.getAllPlatforms, {
          params: { limit, lastId, searchKey },
        })
      ).data,
    ...options,
  });

export type iGetPlatformAPIKeyResp = string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetPlatformAPIKeyErr = AxiosError<any>;
export type iGetPlatformAPIKeyRsq = {
  platform_id: string;
};
const useGetPlatformAPIKey = (
  { platform_id }: iGetPlatformAPIKeyRsq,
  options?: Omit<
    UseQueryOptions<iGetPlatformAPIKeyResp, iGetPlatformAPIKeyErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetPlatformAPIKeyResp, iGetPlatformAPIKeyErr>({
    queryKey: ["get-api-key", platform_id],
    queryFn: async () =>
      (
        await api.get(API_URL.getPlatformAPIKey, {
          params: { platform_id },
        })
      ).data.api_keys?.[0]?.api_key || "",
    ...options,
  });

export type IPostApiKeyResp = {
  message: string;
};
export type IPostApiKeyErr = AxiosError<{
  message?: string;
  msg?: string;
  status?: string;
}>;
export type IPostApiKeyRsq = {
  platform_id: string;
};
const usePostApiKey = (
  options?: Omit<
    UseMutationOptions<IPostApiKeyResp, IPostApiKeyErr, IPostApiKeyRsq>,
    "mutationFn"
  >,
) =>
  useMutation<IPostApiKeyResp, IPostApiKeyErr, IPostApiKeyRsq>({
    mutationFn: async (props) =>
      (await api.post(API_URL.addPlatformAPIKey, props)).data,
    ...omit(options, "queryKey"),
  });

export type IDeleteApiKeyErr = AxiosError<{
  message?: string;
  msg?: string;
  status?: string;
  result?: string;
}>;
export type IDeleteApiKeyResp = {
  message: string;
};
export type IDeleteApiKeyRsq = {
  platform_id: string[];
};

const useDeleteApiKey = (
  options?: Omit<
    UseMutationOptions<IDeleteApiKeyResp, IDeleteApiKeyErr, IDeleteApiKeyRsq>,
    "mutationFn"
  >,
) =>
  useMutation<IDeleteApiKeyResp, IDeleteApiKeyErr, IDeleteApiKeyRsq>({
    mutationFn: async (props) =>
      (
        await api.delete(API_URL.deletePlatformAPIKey, {
          data: { platform_id_list: props.platform_id },
        })
      ).data,
    ...omit(options, "queryKey"),
  });

export type iPostAddMultiAdminPlatformErr = AxiosError<{ status: string }>;
export type iPostAddMultiAdminPlatformResp = { status: string };
export type iPostAddMultiAdminPlatformRsq = { id: string; email: string };

const usePostAddMultiAdminPlatform = (
  options?: Omit<
    UseMutationOptions<
      iPostAddMultiAdminPlatformResp,
      iPostAddMultiAdminPlatformErr,
      iPostAddMultiAdminPlatformRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostAddMultiAdminPlatformResp,
    iPostAddMultiAdminPlatformErr,
    iPostAddMultiAdminPlatformRsq
  >({
    mutationFn: async (props) =>
      api.post(API_URL.postAddMultiAdminPlatform, props),
    ...options,
  });

export type AllTokensDataType = {
  swappable: boolean;
  isApproved: boolean;
  platform_id: string;
  updatedAt: string;
  createdAt: string;
  status: number;
  address: string;
  onChain: boolean;
  price: number;
  name: string;
  logo: string;
  total_tokens: number;
};
export type iGetAllTokensResp = {
  allTokensData: Array<AllTokensDataType>;
  lastId?: string;
  hasNext?: boolean;
};
export type iGetAllTokensErr = AxiosError<{ message?: string; error?: string }>;
export type iGetAllTokensRsq = {
  limit?: number;
  lastId?: string;
  searchKey?: string;
};
const useGetAllTokens = (
  { limit, lastId, searchKey }: iGetAllTokensRsq,
  options?: Omit<
    UseQueryOptions<iGetAllTokensResp, iGetAllTokensErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetAllTokensResp, iGetAllTokensErr>({
    queryKey: ["all-tokens", limit, lastId, searchKey],
    queryFn: async () =>
      (
        await api.get(API_URL.getAllTokens, {
          params: { limit, lastId, searchKey },
        })
      ).data || [],
    ...options,
  });

const useGetTokensInfScroll = ({ limit, searchKey }: iGetAllTokensRsq) =>
  useInfiniteQuery<iGetAllTokensResp, iGetAllTokensErr>({
    queryKey: ["infScrollToken", { searchKey }],
    queryFn: async ({ pageParam }) =>
      (
        await api.get(API_URL.getAllTokens, {
          params: { limit, lastId: pageParam, searchKey },
        })
      ).data,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.lastId : undefined;
    },
    getPreviousPageParam: (firstPage) => firstPage.lastId ?? undefined,
  });

export type iPostAddPlatformTokenErr = AxiosError<{ msg: string }>;
export type iPostAddPlatformTokenResp = { status: string };
export type iPostAddPlatformTokenRsq = {
  platformId?: string;
  tokenName: string;
};

const usePostAddPlatformToken = (
  options?: Omit<
    UseMutationOptions<
      iPostAddPlatformTokenResp,
      iPostAddPlatformTokenErr,
      iPostAddPlatformTokenRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostAddPlatformTokenResp,
    iPostAddPlatformTokenErr,
    iPostAddPlatformTokenRsq
  >({
    mutationFn: async (props) =>
      api.post(API_URL.postAddPlatformToken, {
        platform_id: props.platformId,
        token_name: props.tokenName,
      }),
    ...options,
  });

export type MerchantCodeType = {
  merchant_code: string;
  merchant_company: string;
};

export type PlatformAffiliateType = {
  code: string;
  balance: number;
  rate: number;
  location: {
    lng: number;
    lat: number;
  };
  activated: boolean;
  createdAt: string | number;
  updatedAt: string | number;
  address: string;
  name: string;
  store_details: string;
  company_document: string;
  merchant_codes: MerchantCodeType[];
  image_url: string;
  map_link: string;
  user_id: string;
  city: string;
  category: string;
  approved?: boolean;
};
export type iGetPlatformAffiliatesResp = {
  data: PlatformAffiliateType[];
  nbElements: number;
  nbTotalElements: number;
  nbTotalPage: number;
  hasNext: boolean;
  lastId: string;
};
export type iGetPlatformAffiliatesErr = AxiosError<{ message: string }>;
export type iGetAffiliatesRsq = {
  platform_id: string;
  activated?: boolean;
  approved?: boolean;
  version: number;
  page: number;
  limit: number;
  name?: string;
  city: string | undefined;
  category: string[];
};
const useGetPlatformAffiliates = (
  {
    platform_id,
    activated,
    approved,
    version,
    page,
    limit,
    name,
    city,
    category,
  }: iGetAffiliatesRsq,
  options?: Omit<
    UseQueryOptions<iGetPlatformAffiliatesResp, iGetPlatformAffiliatesErr>,
    "queryFn"
  >,
) =>
  useQuery<iGetPlatformAffiliatesResp, iGetPlatformAffiliatesErr>({
    queryKey: ["list-platform-affiliates", ...(options?.queryKey || [])],
    queryFn: async () =>
      (
        await api.get(API_URL.getAffiliates, {
          params: {
            platform_id,
            activated,
            approved,
            version,
            page,
            limit,
            name,
            city,
            category,
          },
        })
      ).data || [],
    ...omit(options, "queryKey"),
    cacheTime: options?.cacheTime || 1000,
    keepPreviousData: options?.keepPreviousData || true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus || false,
  });

const useGetPlatformAffiliateMutation = (
  options?: UseMutationOptions<
    iGetPlatformAffiliatesResp,
    iGetPlatformAffiliatesErr,
    Partial<iGetAffiliatesRsq>
  >,
) =>
  useMutation<
    iGetPlatformAffiliatesResp,
    iGetPlatformAffiliatesErr,
    Partial<iGetAffiliatesRsq>
  >({
    mutationFn: async (props: Partial<iGetAffiliatesRsq>) =>
      (
        await api.get(API_URL.getAffiliates, {
          params: { ...props },
        })
      ).data,
    ...options,
  });

export type AffiliatesCompaniesType = {
  code: string;
  name: string;
  createdAt: string;
};
export type iGetPlatformAffiliatesCompaniesResp = {
  msg: string;
  result: AffiliatesCompaniesType[];
};
export type iGetPlatformAffiliatesCompaniesErr = AxiosError<{
  message: string;
}>;
const useGetPlatformAffiliatesCompanies = (
  props?: null,
  options?: Omit<
    UseQueryOptions<
      iGetPlatformAffiliatesCompaniesResp,
      iGetPlatformAffiliatesCompaniesErr
    >,
    "queryFn"
  >,
) =>
  useQuery<
    iGetPlatformAffiliatesCompaniesResp,
    iGetPlatformAffiliatesCompaniesErr
  >({
    queryKey: [
      "list-platform-affiliates-companies",
      ...(options?.queryKey || []),
    ],
    queryFn: async () => (await api.get(API_URL.getCompanies)).data || [],
    ...omit(options, "queryKey"),
  });

export type iGetPlatformAffiliatesCategoryListAdminResp = {
  data: string[];
  result: string;
};
export type iGetPlatformAffiliatesCategoryListAdminErr = AxiosError<{
  message: string;
}>;
const useGetPlatformAffiliatesCategoryListAdmin = (
  props?: null,
  options?: Omit<
    UseQueryOptions<
      iGetPlatformAffiliatesCategoryListAdminResp,
      iGetPlatformAffiliatesCategoryListAdminErr
    >,
    "queryFn"
  >,
) =>
  useQuery<
    iGetPlatformAffiliatesCategoryListAdminResp,
    iGetPlatformAffiliatesCategoryListAdminErr
  >({
    queryKey: [
      "list-platform-affiliates-category-list-admin",
      ...(options?.queryKey || []),
    ],
    queryFn: async () =>
      (await api.get(API_URL.getStoreCategoryListAdmin)).data,
    ...omit(options, "queryKey"),
  });

export type AdminType = {
  createdAt: string;
  updatedAt: string;
  platform_admin: string;
  platform_id: string;
  status: number;
  uuid: string;
};
export type iGetMultiAdminsResp = AdminType[];
export type iGetMultiAdminsErr = AxiosError<{
  status: string;
}>;
export type iGetMultiAdminsRsq = { id: string };
const useGetMultiAdmins = (
  { id }: iGetMultiAdminsRsq,
  options?: Omit<
    UseQueryOptions<iGetMultiAdminsResp, iGetMultiAdminsErr>,
    "queryFn"
  >,
) =>
  useQuery<iGetMultiAdminsResp, iGetMultiAdminsErr>({
    queryKey: ["list-multi-admin-platform", id, ...(options?.queryKey || [])],
    queryFn: async () =>
      (await api.get(API_URL.getMultiAdminPlatform, { params: { id } })).data
        .msg,
    ...options,
    cacheTime: options?.cacheTime || 1000,
    keepPreviousData: options?.keepPreviousData || true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus || false,
  });

// incorrect response in swagger doc
// no error response in swagger doc
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export type iPostAddAffiliateErr = AxiosError<any>; // -- not in swagger, I'm guessing
// export type iPostAddAffiliateResp = {
//   code: string;
//   message: string;
// };
// export type iPostAddAffiliateRsq = {
//     code: string;
//     name: string;
//     address: string;
//     platform_id: string;
//     location: {
//       lat: number;
//       lng: number;
//     };
//     store_details: string;
//    FormData;
// };

// const usePostAddAffiliate = (
//   options?: Omit<
//     UseMutationOptions<
//       iPostAddAffiliateResp,
//       iPostAddAffiliateErr,
//       iPostAddAffiliateRsq,
//       FormData
//     >,
//     "mutationFn"
//   >,
// ) =>
//   useMutation<
//     iPostAddAffiliateResp,
//     iPostAddAffiliateErr,
//     iPostAddAffiliateRsq,
//     FormData
//   >({
//     mutationFn: async (props: FormData) =>
//       (await api.post(API_URL.postAddAffiliate, props, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       })
//     ).data,
//     ...options,
//   });

export type iPostAddAffiliateErr = AxiosError<{
  message: string;
  status: string;
}>;

export interface iPostAddAffiliateProps extends FormData {
  file: string;
  code: string;
  name: string;
  address: string;
  platform_id: string;
  location: {
    lat: number;
    lng: number;
  };
  store_details: string;
}

export interface iPostAddAffiliateRes {
  code: string;
  message: string;
}

const usePostAddAffiliate = (
  options?: UseMutationOptions<
    iPostAddAffiliateRes,
    iPostAddAffiliateErr,
    FormData
  >,
) =>
  useMutation<iPostAddAffiliateRes, iPostAddAffiliateErr, FormData>({
    mutationFn: async (props: FormData) =>
      (
        await api.post(API_URL.postAddAffiliate, props, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data,
    ...options,
  });

const usePostUpdateAffiliateDetail = (
  options?: UseMutationOptions<
    iPostAddAffiliateRes,
    iPostAddAffiliateErr,
    FormData
  >,
) =>
  useMutation<iPostAddAffiliateRes, iPostAddAffiliateErr, FormData>({
    mutationFn: async (props: FormData) =>
      (
        await api.post(API_URL.postUpdateAffiliate, props, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data,
    ...options,
  });

// incorrect response in swagger doc
// no error response in swagger doc
// returning server error
export type iPatchUpdateAffiliateStatusErr = AxiosError<{
  error: string;
  message: string;
}>;
export type iPatchUpdateAffiliateStatusResp = {
  code: string;
  message: string;
};
export type iPatchUpdateAffiliateStatusRsq = {
  code: string;
  activated: boolean;
  approved?: boolean;
};

const usePatchUpdateAffiliateStatus = (
  options?: Omit<
    UseMutationOptions<
      iPatchUpdateAffiliateStatusResp,
      iPatchUpdateAffiliateStatusErr,
      iPatchUpdateAffiliateStatusRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPatchUpdateAffiliateStatusResp,
    iPatchUpdateAffiliateStatusErr,
    iPatchUpdateAffiliateStatusRsq
  >({
    mutationFn: async (props) =>
      (await api.patch(API_URL.patchAffiliate, props)).data,
    ...options,
  });

export type iGetCheckStoresRegisteredErr = AxiosError<{
  error: string;
  message: string;
}>;
export type iGetCheckStoresRegisteredResp = {
  message: string;
  activated: boolean;
  approved: boolean;
};
export type iGetCheckStoresRegisteredRsq = {
  code: string;
};

const useGetCheckStoresRegistered = (
  options?: Omit<
    UseMutationOptions<
      iGetCheckStoresRegisteredResp,
      iGetCheckStoresRegisteredErr,
      iGetCheckStoresRegisteredRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iGetCheckStoresRegisteredResp,
    iGetCheckStoresRegisteredErr,
    iGetCheckStoresRegisteredRsq
  >({
    mutationFn: async (props) =>
      (
        await api.get(API_URL.checkStoreRegistered, {
          params: props,
        })
      ).data,
    ...options,
  });

export type PlatformSupportedTokenType = {
  balance: number;
  createdAt: string;
  name: string;
  platform_id: string;
  status: number;
  updatedAt: string;
  uuid: string;
};
export type iGetPlatformSupportedTokensResp = PlatformSupportedTokenType[];
export type iGetPlatformSupportedTokensErr = AxiosError<{
  error: string;
  message: string;
}>;
export type iGetPlatformSupportedTokensRsq = { platformId: string };
const useGetPlatformSupportedTokens = (
  { platformId }: iGetPlatformSupportedTokensRsq,
  options?: Omit<
    UseQueryOptions<
      iGetPlatformSupportedTokensResp,
      iGetPlatformSupportedTokensErr
    >,
    "queryFn"
  >,
) =>
  useQuery<iGetPlatformSupportedTokensResp, iGetPlatformSupportedTokensErr>({
    queryKey: ["list-platform-supported-tokens", ...(options?.queryKey || [])],
    queryFn: async () =>
      (
        await api.get(API_URL.getPlatformSupportedTokens, {
          params: { platform_id: platformId },
        })
      ).data.data,
    ...options,
    cacheTime: options?.cacheTime || 1000,
    keepPreviousData: options?.keepPreviousData || true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus || false,
  });

// api not found in swagger doc
export type iDeletePlatformTokenErr = AxiosError<{
  message: string;
  error: string;
}>;
export type iDeletePlatformTokenResp = {
  message: string;
};
export type iDeletePlatformTokenRsq = {
  ids: string;
};

const useDeletePlatformToken = (
  options?: Omit<
    UseMutationOptions<
      iDeletePlatformTokenResp,
      iDeletePlatformTokenErr,
      iDeletePlatformTokenRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iDeletePlatformTokenResp,
    iDeletePlatformTokenErr,
    iDeletePlatformTokenRsq
  >({
    mutationFn: async (props) =>
      (
        await api.delete(API_URL.deletePlatformToken, {
          data: { id_list: [props?.ids] },
        })
      ).data,
    ...omit(options, "queryKey"),
  });

// wrong swagger doc, 200 response actually giving error response
// even that error response is wrong
export type iGetTransactionsHistoryResp = {
  msg: string;
  transactions: Array<{
    amount: number;
    currency: string;
    createdAt: string;
    email: string;
    from: string;
    platfrom_request: string;
    to: string;
    tx_action: string;
    tx_hash: string;
    type: string;
    uuid: string;
    tx_status?: string;
  }>;
  lastId: string;
  hasNext: boolean;
  nbTotalElements: number;
  createdAt: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetTransactionsHistoryErr = AxiosError<any>;
export type iGetTransactionsHistoryRsq = {
  platformId: string;
  limit: number;
  lastId?: string;
  searchKey?: string;
  createdAt?: string;
};
const useGetTransactionsHistory = (
  {
    platformId,
    limit,
    lastId,
    searchKey,
    createdAt,
  }: iGetTransactionsHistoryRsq,
  options?: Omit<
    UseQueryOptions<iGetTransactionsHistoryResp, iGetTransactionsHistoryErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetTransactionsHistoryResp, iGetTransactionsHistoryErr>({
    queryKey: [
      "list-transactions",
      platformId,
      limit,
      lastId,
      createdAt,
      searchKey,
    ],
    queryFn: async () =>
      (
        await api.get(API_URL.getPlatformTransactions, {
          params: {
            platform_id: platformId,
            limit,
            lastId,
            createdAt,
            searchKey,
          },
        })
      ).data,
    enabled: !!platformId,
    ...options,
  });

export type iGetPlatformsResp = {
  message: string;
  platforms: Array<IPlatforms>;
  nbTotalElements: number;
  nbElements: number;
  lastId?: string;
  hasNext: boolean;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetPlatformsErr = AxiosError<any>;
export type iGetPlatformsRsq = {
  limit: number;
  lastId?: string;
  searchKey?: string;
};
const useGetUserPlatforms = (
  { limit, lastId, searchKey }: iGetPlatformsRsq,
  options?: Omit<
    UseQueryOptions<iGetPlatformsResp, iGetPlatformsErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetPlatformsResp, iGetPlatformsErr>({
    queryKey: ["list-platforms", limit, lastId, searchKey],
    queryFn: async () =>
      (
        await api.get(API_URL.getUserPlatforms, {
          params: { limit, lastId, searchKey },
        })
      ).data,
    ...options,
    cacheTime: options?.cacheTime || 1000,
    keepPreviousData: options?.keepPreviousData || true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus || false,
  });

export type iGetMsqPlatformUsersResp = {
  message: string;
  allUsers: Array<IMsqPlatformUsers>;
  nbTotalElements: number;
  nbElements: number;
  lastId?: string;
  hasNext: boolean;
};
export type iGetMsqPlatformUsersErr = AxiosError<any>;
export type iGetMsqPlatformUsersRsq = {
  limit: number;
  lastId?: string;
  searchKey?: string;
};
const useGetMsqPlatformUsers = (
  { limit, lastId, searchKey }: iGetMsqPlatformUsersRsq,
  options?: Omit<
    UseQueryOptions<iGetMsqPlatformUsersResp, iGetMsqPlatformUsersErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetMsqPlatformUsersResp, iGetMsqPlatformUsersErr>({
    queryKey: ["list-platforms", limit, lastId, searchKey],
    queryFn: async () =>
      (
        await api.get(API_URL.getMsqPlatformUsers, {
          params: { limit, lastId, searchKey },
        })
      ).data,
    ...options,
    cacheTime: options?.cacheTime || 1000,
    keepPreviousData: options?.keepPreviousData || true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus || false,
  });

export type Interface = {
  approve: boolean;
  email: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useUpdateUserRole = (): UseMutationResult<any, unknown, Interface> =>
  useMutation({
    mutationFn: async ({ approve, email }: Interface) => {
      const url = approve
        ? API_URL.disapproveMsqPlatformUser
        : API_URL.approveMsqPlatformUser;
        return await api.put(url, { email });
    }
  });

const useUpdateUserVerify = (options?: any) =>
  useMutation({
    mutationFn: async (email: string) => {
      return await api.patch(API_URL.forceVerified + "/" + email);
    },
    ...options,
  });

export type RolesInterface = {
  name: string;
  value: Array<string>;
};

export type UpdateAdminRolesInterface = {
  email: string;
  roles_v2: RolesInterface;
};

const useUpdateAdminRoles = (options?: any) =>
  useMutation({
    mutationFn: async ({ email, roles_v2 }: UpdateAdminRolesInterface) => {
      return await api.put(API_URL.updateAdminRoles, { email, roles_v2 });
    },
    ...options,
  });
export interface IGetTokensExchangeRatesRes {
  uuid: string;
  source_token_name: string;
  source_token_price: string;
  target_token_name: string;
  target_token_price: string;
}
export type IGetTokensExchangeRatesErr = AxiosError<{
  message: string;
  error: string;
}>;

const useGetTokensExchangeRates = (
  options?: UseQueryOptions<
    IGetTokensExchangeRatesRes[],
    IGetTokensExchangeRatesErr
  >,
) =>
  useQuery<IGetTokensExchangeRatesRes[], IGetTokensExchangeRatesErr>({
    queryKey: ["tokens-exchange-rate"],
    queryFn: async () => {
      const res = await api.get(API_URL.getTokensExchangeRates);
      return res.data;
    },
    ...options,
  });

export type iPostAddCategoryErr = AxiosError<{ status: string }>;
export type iPostAddCategoryResp = { status: string; message: string };
export type iPostAddCategoryRsq = { platform_id: string; category: string };

const usePostAddCategory = (
  options?: Omit<
    UseMutationOptions<
      iPostAddCategoryResp,
      iPostAddCategoryErr,
      iPostAddCategoryRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<iPostAddCategoryResp, iPostAddCategoryErr, iPostAddCategoryRsq>({
    mutationFn: async (props) => api.post(API_URL.postAddCategory, props),
    ...options,
  });

export type IDeleteCategoryListErr = AxiosError<{
  result?: string;
}>;
export type IDeleteCategoryListResp = {
  result: string;
  data: string[];
};
export type IDeleteCategoryListRsq = {
  platform_id: string;
  categories: string[];
};

const useDeleteCategoryList = (
  options?: Omit<
    UseMutationOptions<
      IDeleteCategoryListResp,
      IDeleteCategoryListErr,
      IDeleteCategoryListRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    IDeleteCategoryListResp,
    IDeleteCategoryListErr,
    IDeleteCategoryListRsq
  >({
    mutationFn: async (props) =>
      (
        await api.delete(API_URL.deleteCategory, {
          data: {
            platform_id: props.platform_id,
            categories: props.categories,
          },
        })
      ).data,
    ...omit(options, "queryKey"),
  });

export type iGetUsersBalanceResp = IGetUsersBalanceResponse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetUsersBalanceErr = AxiosError<any>;
export type iGetUsersBalanceRsq = GetUsersBalanceType;
const useGetUsersBalance = ({
  tokenName,
  searchKey,
  limit,
}: iGetUsersBalanceRsq) => {
  const query = useInfiniteQuery<iGetUsersBalanceResp, iGetUsersBalanceErr>({
    queryKey: ["users-balance", tokenName, limit, searchKey],
    queryFn: async ({ pageParam = {} }) => {
      return (
        await api.get(API_URL.getUsersBalance, {
          params: { tokenName, limit, searchKey, ...pageParam },
        })
      ).data;
    },
  });

  return {
    ...query,
    data: {
      ...query.data?.pages[query.data?.pages.length - 1],
      finalResponse: query.data?.pages
        .flat()
        .map((item) => item?.finalResponse)
        .flat()
        .filter((item) => item?.uuid),
    },
  };
};

export type iGetPlatformBalanceResp = IGetPlatformBalanceResponse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetPlatformBalanceErr = AxiosError<any>;
export type iGetPlatformBalanceRsq = GetUsersBalanceType;
const useGetPlatformBalance = ({
  tokenName,
  searchKey,
  limit,
}: iGetPlatformBalanceRsq) => {
  const query = useInfiniteQuery<
    iGetPlatformBalanceResp,
    iGetPlatformBalanceErr
  >({
    queryKey: ["platform-balance", tokenName, limit, searchKey],
    queryFn: async ({ pageParam = {} }) => {
      return (
        await api.get(API_URL.getPlatformBalance, {
          params: { tokenName, limit, searchKey, ...pageParam },
        })
      ).data;
    },
  });

  return {
    ...query,
    data: {
      ...query.data?.pages[query.data?.pages.length - 1],
      finalResponse: query.data?.pages
        .flat()
        .map((item) => item?.finalResponse)
        .flat()
        .filter((item) => item?.uuid),
    },
  };
};

export type iGetUserTokenTransactionHistoryResp =
  IGetUserTokenTransactionHistoryResponse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetUserTokenTransactionHistoryErr = AxiosError<any>;
export type iGetUserTokenTransactionHistoryRsq =
  GetUserTokenTransactionHistoryType;
const useGetUserTokenTransactionHistory = ({
  token,
  limit,
  searchKey,
  includeDraft,
}: iGetUserTokenTransactionHistoryRsq) => {
  const query = useInfiniteQuery<
    iGetUserTokenTransactionHistoryResp,
    iGetUserTokenTransactionHistoryErr
  >({
    queryKey: [
      "user-token-transaction-history",
      token,
      searchKey,
      limit,
      includeDraft,
    ],
    queryFn: async ({ pageParam = {} }) => {
      return (
        await api.get(API_URL.getTokenTransactionHistory, {
          params: { token, searchKey, limit, includeDraft, ...pageParam },
        })
      ).data;
    },
  });

  return {
    ...query,
    data: {
      ...query.data?.pages[query.data?.pages.length - 1],
      transactions: query.data?.pages
        .flat()
        .map((item) => item?.transactions)
        .flat()
        .filter((item) => item?.uuid),
    },
  };
};

const useDenyStore = (
  options?: Omit<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    UseMutationOptions<any, any, any>,
    "mutationFn"
  >,
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMutation<any, any, any>({
    mutationFn: async (props) =>
      (
        await api.delete(API_URL.denyStore, {
          data: { code: props.code },
        })
      ).data,
    ...omit(options, "queryKey"),
  });

export {
  useGetDashboardStatistics,
  useGetLanguage,
  useGetPlatformsRequests,
  useGetSettings,
  usePostSendOTP,
  useLazyGetVerifyAccount,
  useGetAllPlatforms,
  usePostAddMultiAdminPlatform,
  useGetAllTokens,
  usePostAddPlatformToken,
  useGetPlatformAffiliates,
  useGetMultiAdmins,
  usePostAddAffiliate,
  usePatchUpdateAffiliateStatus,
  useGetPlatformSupportedTokens,
  useDeletePlatformToken,
  useGetTransactionsHistory,
  useGetUserPlatforms,
  useGetMsqPlatformUsers,
  useGetTokensExchangeRates,
  useGetPlatformAPIKey,
  usePostApiKey,
  useDeleteApiKey,
  usePostAddCategory,
  useDeleteCategoryList,
  usePostUpdateAffiliateDetail,
  useGetPointAccumulationSettings,
  useSavePointAccumulation,
  useGetUsersBalance,
  useGetPlatformBalance,
  useGetUserTokenTransactionHistory,
  useGetPlatformAffiliatesCompanies,
  useDenyStore,
  useUpdateUserRole,
  useUpdateUserVerify,
  useGetCheckStoresRegistered,
  useGetPlatformAffiliatesCategoryListAdmin,
  useGetPlatformAffiliateMutation,
  useGetTokensInfScroll,
  useUpdateAdminRoles,
  usePostInitiatePhoneNumberUpdate,
};
