import { api, queryClient } from "api/api";
import { API_URL } from "api/url";
import { omit } from "lodash";
import {
  UseQueryOptions,
  useMutation,
  useQuery,
  UseMutationOptions,
  MutationFunction,
} from "react-query";
import {
  UpdateSuperSaveWidgetSettingType,
  RejectSuperUserType,
  ApproveSuperUserType,
  GetDepositRequestsType,
  IGetDepositRequestsResponse,
  IGetMassWithdrawalsRequestResponse,
  IGetMassWithdrawalsResponse,
  GetWithdrawalRequestsType,
  IUserConsent,
  GetSuperUsersType,
  IGetSuperUsersResponse,
  GetUserDetailType,
  ISuperUserDetail,
  IWidgetSettings,
  IWithdrawal,
  IDailyCalculationUser,
  IPostDepositTransactionIDRsq,
  IPostDepositTransactionIDResp,
  IPostDepositTransactionIDErr,
  ITransferOwnershipDepositRequestResp,
  ITransferOwnershipDepositRequestRsq,
  ITransferOwnershipDepositRequestErr,
  IUserTransferOwnershipHistoryRes,
  IRejectTransferOwnershipRequestRes,
  IRejectTransferOwnershipRequestRsq,
  IRejectTransferOwnershipRequestErr,
  IApproveTransferOwnershipRequestRsq,
  IApproveTransferOwnershipRequestResp,
  IApproveTransferOwnershipRequestErr,
  IUserAirdropHistoryRes,
  UpdateSuperTrustStatus,
  IUserSuperTrustHistoryRes,
  IUpdateIntroducerInfoRequestRes,
  IUpdateIntroducerInfoRequestErr,
  IUpdateIntroducerInfoRequestRsq,
  CheckTxidOnBlockchainRequestsType,
  ICheckTxidOnBlockchainResponse,
  ISearchSuperSaveRequestByPhoneNumberResponse,
  SearchSuperSaveRequestByPhoneNumberRequestsType,
  IeCheckUserReferralCodeByAdminResponse,
  eCheckUserReferralCodeByAdminRequestsType,
  IPostUpdateUserDocumentByAdminResp,
  IPostUpdateUserDocumentByAdminErr,
  IPostUpdateUserDocumentByAdminRsq,
  CheckBulkTxidOnBlockchainRequestsType,
  ICheckBulkTxidOnBlockchainResponse,
  IGetUserCommitmentInfoRes,
  IGetUserReferralInfoRes,
  IPostUpdateUserCommunityRes,
  IPostUpdateUserCommunityErr,
  IPostUpdateUserCommunityRsq,
  IGetCommunityListRes,
  IGetUserCommunitiesRes,
  IGetUserCommunitiesRsq,
  IGetSuperSaveCommunityRewardResponse,
  IUserInheritorsRes,
  IUserInheritorsParams,
} from "./types";
import { AxiosError, AxiosResponse } from "axios";
import { DatePeriodTypes } from "@common/types/dates";
import { toast } from "react-toastify";

const useWithdrawalComplete = () =>
  useMutation<void, void, { withdrawal_ids: string }>({
    mutationFn: async (props) =>
      (await api.post(API_URL.withdrawalComplete, props)).data,
    onSuccess: () => queryClient.invalidateQueries("withdrawal"),
  });

const useSetWithdrawalCompleteByDate = () =>
  useMutation<void, void, { repayment_date: string; type: string }>({
    mutationFn: async (props) =>
      await api.post("/super-save/set_withdrawal_complete_by_date", props),
  });

const useUpdateSuperSaveWidgetSetting = () =>
  useMutation<void, void, UpdateSuperSaveWidgetSettingType>({
    mutationFn: async (props) =>
      api.post(API_URL.updateSuperSaveWidgetSettings, props),
  });

const useSaveFile = () =>
  useMutation<string, void, { file: File }>({
    mutationFn: async (props) => {
      const formData = new FormData();
      formData.append("file", props.file);
      return (
        await api.post(API_URL.superSaveImageUpload, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data;
    },
  });

const useUploadFile = () =>
  useMutation<string, void, { file: File }>({
    mutationFn: async (props) => {
      const formData = new FormData();
      formData.append("file", props.file);
      return (
        await api.post(API_URL.superSaveFileUpload, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data;
    },
  });

const useRejectSuperUserRequest = () =>
  useMutation<void, void, RejectSuperUserType>({
    mutationFn: async (props) =>
      await api.post(
        props?.usdtAction
          ? API_URL.rejectSuperSaveTransactionRegistrationRequestUSDT
          : API_URL.rejectSuperSaveTransactionRegistrationRequest,
        omit(props, "usdtAction"),
      ),
  });

const useApproveDepositRequest = () =>
  useMutation<void, void, { request_ids: string[] }>({
    mutationFn: async (props) =>
      (await api.post("/super-save/approve_super_save_deposit_request", props))
        .data,
  });

const useRevokeDepositRequest = () =>
  useMutation<{ result: string }, void, { request_ids: string[] }>({
    mutationFn: async (props) =>
      (await api.post(API_URL.revokeDepositRequest, props)).data,
  });

const useTransferOwnershipDepositRequest = () =>
  useMutation<
    ITransferOwnershipDepositRequestResp,
    ITransferOwnershipDepositRequestErr,
    ITransferOwnershipDepositRequestRsq
  >({
    mutationFn: async (props) => {
      const formData = new FormData();
      if (props.file != null) formData.append("file", props.file);
      formData.append("request_id", props.request_id);
      formData.append("email", props.email);

      return (
        await api.post(API_URL.transferOwnershipRequest, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data;
    },
  });

const usePostDepositTransactionID = (
  options?: Omit<
    UseMutationOptions<
      IPostDepositTransactionIDResp,
      IPostDepositTransactionIDErr,
      IPostDepositTransactionIDRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    IPostDepositTransactionIDResp,
    IPostDepositTransactionIDErr,
    IPostDepositTransactionIDRsq
  >({
    mutationFn: async (props) =>
      api.post(API_URL.createDepositTransactionID, props),
    ...options,
  });

const usePostUpdateUserDocumentByAdmin = (
  options?: Omit<
    UseMutationOptions<
      IPostUpdateUserDocumentByAdminResp,
      IPostUpdateUserDocumentByAdminErr,
      IPostUpdateUserDocumentByAdminRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    IPostUpdateUserDocumentByAdminResp,
    IPostUpdateUserDocumentByAdminErr,
    IPostUpdateUserDocumentByAdminRsq
  >({
    mutationFn: async (props) => {
      const { userId, ...restProps } = props;
      return api.post(API_URL.updateUserDocumentByAdmin, restProps, {
        params: {
          userId,
        },
      });
    },
    ...options,
  });

const useApproveSuperUserRequest = () =>
  useMutation<void, void, ApproveSuperUserType>({
    mutationFn: async (props) =>
      await api.post(
        props.usdtAction
          ? API_URL.approvedSuperSaveTransactionRegistrationRequestUSDT
          : API_URL.approvedSuperSaveTransactionRegistrationRequest,
        omit(props, "usdtAction"),
      ),
  });

const useRejectDepositRequest = () =>
  useMutation<void, void, { request_ids: string[]; remark: string }>({
    mutationFn: async (props) =>
      (await api.post(API_URL.rejectSuperSaveDepositRequest, props)).data,
  });

const useRejectBankChangeRequest = () =>
  useMutation<void, void, { user_id: string }>({
    mutationFn: async (props) =>
      (await api.post(API_URL.rejectChangeBankRequest, props)).data,
  });

const useApproveBankChangeRequest = () =>
  useMutation<void, void, { user_id: string }>({
    mutationFn: async (props) =>
      (await api.post(API_URL.approveChangeBankRequest, props)).data,
  });

export type iGetWithdrawalsResp = {
  message: string;
  lastId: string;
  nbElements: number;
  nbTotalElements: number;
  hasNext: boolean;
  nbTotalPage: number;
  details: {
    bank_account_number?: string;
    bank_fee?: number;
    bank_name?: string;
    deducted_payment?: number;
    transaction_id?: string;
    user_email?: string;
    user_id?: string;
    user_name?: string;
    weekly_payout_amount?: number;
    repayment_date?: string;
    payment_currency?: string;
  };
  withdrawals: IWithdrawal[];
};
export type iGetWithdrawalsErr = AxiosError<{
  message: string;
}>;
export type iGetWithdrawalsRsq = {
  user_id?: string;
  limit?: number;
  searchKey?: string;
  date_filter?: DatePeriodTypes;
  startDate?: string;
  endDate?: string;
  lastId?: string;
  page?: number;
  sort_column_name?: string;
  sort_type?: "asc" | "desc";
  transaction_id?: string;
  type?: string;
};
const useGetWithdrawals = (
  props: iGetWithdrawalsRsq,
  options?: Omit<
    UseQueryOptions<iGetWithdrawalsResp, iGetWithdrawalsErr>,
    "queryFn"
  >,
) =>
  useQuery<iGetWithdrawalsResp, iGetWithdrawalsErr>({
    queryKey: [
      "withdrawal-list",
      ...(options?.queryKey || []),
      ...Object.values(props),
    ].filter((key) => key !== undefined),
    queryFn: async () =>
      (
        await api.get(API_URL.getWithdrawalList, {
          params: props,
        })
      ).data,
    ...options,
  });

export type iGetDailyCalculationResp = {
  message: string;
  lastId: string;
  nbElements: number;
  nbTotalElements: number;
  hasNext: boolean;
  nbTotalPage: number;
  users: IDailyCalculationUser[];
};
export type iGetDailyCalculationErr = AxiosError<{
  message: string;
}>;
export type iGetDailyCalculationRsq = {
  limit?: number;
  searchKey?: string;
  date_filter?: DatePeriodTypes;
  from_date?: string;
  to_date?: string;
  page?: number;
  lastId?: number;
  user_id?: string;
  type: "KRW" | "USDT";
};
const useGetDailyCalculation = (
  props: iGetDailyCalculationRsq,
  options?: Omit<
    UseQueryOptions<iGetDailyCalculationResp, iGetDailyCalculationErr>,
    "queryFn"
  >,
) =>
  useQuery<iGetDailyCalculationResp, iGetDailyCalculationErr>({
    queryKey: ["daily-calculations", ...Object.values(props)],
    queryFn: async () =>
      (
        await api.get(API_URL.getSuperSaveDailyCalculations, {
          params: props,
        })
      ).data,
    ...options,
  });

const useGetDepositRequests = (props: GetDepositRequestsType) =>
  useQuery<IGetDepositRequestsResponse>({
    queryKey: ["deposit-requests", ...Object.values(props)],
    queryFn: async () => {
      return (
        await api.get("/super-save/get_all_super_save_deposit_request", {
          params: props,
        })
      ).data;
    },
  });

const useCheckTxidOnBlockchain = () =>
  useMutation<
    ICheckTxidOnBlockchainResponse,
    void,
    CheckTxidOnBlockchainRequestsType
  >({
    mutationFn: async (props) => {
      return (
        await api.get("/super-save/check_txid_on_blockchain", { params: props })
      ).data;
    },
  });

const useCheckBulkTxidOnBlockchain = () =>
  useMutation<
    ICheckBulkTxidOnBlockchainResponse,
    void,
    CheckBulkTxidOnBlockchainRequestsType
  >({
    mutationFn: async (props) => {
      return (
        await api.post("/super-save/check_bulk_txid_on_blockchain", props)
      ).data;
    },
  });

const useGetMassWithdrawRequests = () =>
  useMutation<
    IGetMassWithdrawalsRequestResponse,
    void,
    GetWithdrawalRequestsType
  >({
    mutationFn: async (props) => {
      return (await api.get(API_URL.getWithdrawalList, { params: props })).data;
    },
  });

const useGetMassDepositRequests = () =>
  useMutation<IGetDepositRequestsResponse, void, GetDepositRequestsType>({
    mutationFn: async (props) => {
      return (
        await api.get("/super-save/get_all_super_save_deposit_request", {
          params: props,
        })
      ).data;
    },
  });

const useGetUserConsents = ({ user_id }: { user_id: string | undefined }) =>
  useQuery<IUserConsent[]>({
    queryKey: ["user-consents", user_id],
    queryFn: async () =>
      (
        await api.get(API_URL.getAllConsentHistoryList, {
          params: { user_id },
        })
      ).data.consentResult,
    enabled: !!user_id,
  });

const useGetUserCommitmentInfo = ({ user_id }: { user_id: string | undefined }) =>
  useQuery<IGetUserCommitmentInfoRes>({
    queryKey: ["user-commitment-info-list", user_id],
    queryFn: async () =>
      (
        await api.get(API_URL.getAllCommitmentInfoList, {
          params: { user_id },
        })
      ).data,
    enabled: !!user_id,
  });

const useGetUserReferralInfo = ({ user_id }: { user_id: string | undefined }) =>
  useQuery<IGetUserReferralInfoRes>({
    queryKey: ["user-referral-info-list", user_id],
    queryFn: async () =>
      (
        await api.get(API_URL.getAllReferralInfoList, {
          params: { user_id },
        })
      ).data,
    enabled: !!user_id,
  });

const useGetUserAirdropHistory = ({
  phone_number,
}: {
  phone_number: string | undefined;
}) =>
  useQuery<IUserAirdropHistoryRes>({
    queryKey: ["user-airdrop-history", phone_number],
    queryFn: async () =>
      (
        await api.get(API_URL.getUserAirdropHistory, {
          params: { phone_number },
        })
      ).data || [],
    enabled: !!phone_number,
  });

const useGetUserSuperTrustHistory = ({
  user_id,
}: {
  user_id: string | undefined;
}) =>
  useQuery<IUserSuperTrustHistoryRes>({
    queryKey: ["user-super-trust-history", user_id],
    queryFn: async () =>
      (
        await api.get(API_URL.getUserSuperTrustHistory, {
          params: { user_id },
        })
      ).data || [],
    enabled: !!user_id,
  });

const useGetUserTransferOwnershipHistory = ({
  user_id,
}: {
  user_id: string | undefined;
}) =>
  useQuery<IUserTransferOwnershipHistoryRes>({
    queryKey: ["user-transfer-history", user_id],
    queryFn: async () =>
      (
        await api.get(API_URL.getUserAllTransferOwnershipHistory, {
          params: { user_id },
        })
      ).data,
    enabled: !!user_id,
  });

const useGetUserInheritors = ({
  user_id,
  all
}:IUserInheritorsParams) =>
  useQuery<IUserInheritorsRes>({
    queryKey: ["user-inheritors", user_id],
    queryFn: async () =>
      (
        await api.get(API_URL.getUserInheritors, {
          params: { user_id, all },
        })
      ).data,
    enabled: !!user_id,
    retry: false,
  });

const useRejectTransferOwnershipRequest = () =>
  useMutation<
    IRejectTransferOwnershipRequestRes,
    IRejectTransferOwnershipRequestErr,
    IRejectTransferOwnershipRequestRsq
  >({
    mutationFn: async (props) =>
      (await api.post(API_URL.rejectTransferOwnership, props)).data,
  });

const useUpdateIntroducerInfoRequest = () =>
  useMutation<
    IUpdateIntroducerInfoRequestRes,
    IUpdateIntroducerInfoRequestErr,
    IUpdateIntroducerInfoRequestRsq
  >({
    mutationFn: async (props) =>
      (await api.post(API_URL.updateIntroducerInfo, props)).data,
  });

const useSearchSuperSaveRequestByPhoneNumber = () =>
  useMutation<
    ISearchSuperSaveRequestByPhoneNumberResponse,
    void,
    SearchSuperSaveRequestByPhoneNumberRequestsType
  >({
    mutationFn: async (props) => {
      return (
        await api.get(API_URL.searchSuperSaveRequestByPhoneNumber, {
          params: props,
        })
      ).data;
    },
  });

const useCheckUserReferralCodeByAdmin = () =>
  useMutation<
    IeCheckUserReferralCodeByAdminResponse,
    void,
    eCheckUserReferralCodeByAdminRequestsType
  >({
    mutationFn: async (props) => {
      return (
        await api.get(API_URL.checkUserReferralCodeByAdmin, {
          params: props,
        })
      ).data;
    },
  });

const useApproveTransferOwnershipRequest = () =>
  useMutation<
    IApproveTransferOwnershipRequestResp,
    IApproveTransferOwnershipRequestErr,
    IApproveTransferOwnershipRequestRsq
  >({
    mutationFn: async (props) => {
      const formData = new FormData();
      if (props.file != null) formData.append("file", props.file);
      formData.append("transfer_id", props.transfer_id);

      return (
        await api.post(API_URL.approveTransferOwnership, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data;
    },
  });

const useGetSuperUsers = (
  props: GetSuperUsersType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: UseQueryOptions<IGetSuperUsersResponse, AxiosError<any>>,
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useQuery<IGetSuperUsersResponse, AxiosError<any>>({
    queryKey: ["super-users", ...Object.values(props)],
    queryFn: async () =>
      (
        await api.get(API_URL.getSuperSaveUsers, {
          params: props,
        })
      ).data,
    ...options,
  });

const useGetMassSuperUsers = () =>
  useMutation<IGetSuperUsersResponse, void, GetSuperUsersType>({
    mutationFn: async (props) =>
      (await api.get(API_URL.getSuperSaveUsers, { params: props })).data,
  });

const useGetSuperUserDetail = (
  { email, name, phone_number }: GetUserDetailType,
  options?: UseQueryOptions<
    ISuperUserDetail,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AxiosError<any>
  >,
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useQuery<ISuperUserDetail, AxiosError<any>>({
    queryKey: ["super-user-details", email],
    queryFn: async () =>
      (
        await api.get(API_URL.getSuperSaveUserDetails, {
          params: { email, name, phone_number },
        })
      ).data.data,
    enabled: !!email || (!!name && !!phone_number),
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...omit(options, "queryKey"),
    onSuccess: (data) => {
      const updatedData = {
        ...data,
        user_id: data.user_id || data.id,
      };
      queryClient.setQueryData(["super-user-details", email], updatedData);
    },
  });

export type iGetSuperSaveWithdrawFormResp = {
  message: string;
  data: {
    reasonText: string;
    name?: string;
    user_id?: string;
    email: string;
    amount: number;
    bank_name?: string;
    bank_account_number?: string;
    reason: string;
    description: string;
    withdraw_request_id: string;
    wallet_type: string;
    wallet_id: string;
    amount_usdt: number;
  };
};
export type iGetSuperSaveWithdrawFormErr = AxiosError<{
  message: string;
}>;
export type iGetSuperSaveWithdrawFormRsq = {
  email: string;
};
const useGetSuperSaveWithdrawForm = (
  props: iGetSuperSaveWithdrawFormRsq,
  options?: Omit<
    UseQueryOptions<
      iGetSuperSaveWithdrawFormResp,
      iGetSuperSaveWithdrawFormErr
    >,
    "queryFn"
  >,
) =>
  useQuery<iGetSuperSaveWithdrawFormResp, iGetSuperSaveWithdrawFormErr>({
    queryKey: [
      "withdrawal-list",
      ...(options?.queryKey || []),
      ...Object.values(props),
    ],
    queryFn: async () =>
      (
        await api.get(API_URL.getSuperSaveUserWithdrawForm, {
          params: props,
        })
      ).data,
    enabled: !!props.email,
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...omit(options, "queryKey"),
  });

const useGetSuperSaveWidgetsSettings = () =>
  useQuery<IWidgetSettings>({
    queryKey: ["supe-save-widget-settings"],
    queryFn: async () =>
      (await api.get(API_URL.getSuperSaveWidgetSettings)).data.data,
  });

const useGetMassWithdrawals = () =>
  useMutation<
    IGetMassWithdrawalsResponse,
    void,
    { repayment_date: string; is_unpaid?: boolean; type?: string }
  >({
    mutationFn: async (props) =>
      (
        await api.get("/super-save/get_mass_deposit_excel_download", {
          params: props,
        })
      ).data,
  });

const useUpdateSuperTrustStatus = () =>
  useMutation<void, void, UpdateSuperTrustStatus>({
    mutationFn: async (props) =>
      api.post(API_URL.updateSuperTrustStatus, props),
    onSuccess: () => queryClient.invalidateQueries("user-super-trust-history"),
  });

const updateUserCommunity: MutationFunction<AxiosResponse<IPostUpdateUserCommunityRes>, IPostUpdateUserCommunityRsq> = async (props) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const res = await api.post<IPostUpdateUserCommunityRes>(API_URL.postUpdateUserCommunity, props);
    return res;
  } catch (error) {
    throw error;
  }
};


const useUpdateUserCommunityByAdmin = () =>
  useMutation<AxiosResponse<IPostUpdateUserCommunityRes>, IPostUpdateUserCommunityErr, IPostUpdateUserCommunityRsq>({
    mutationFn: updateUserCommunity,
  });

const useGetCommunityListByAdmin = () =>
  useMutation<
    IGetCommunityListRes,
    void,
    void
  >({
    mutationFn: async (props) => {
      try {
        const response = await api.get(API_URL.getCommunityListByAdmin, { params: props });
        return response.data;
      } catch(error) {
       console.error("An error occurred: ", error);
      }
        },
    onError: (error) => {
        // Handle the error here. For example, log it or show a notification
        console.error("An error occurred: ", error);
    },
  });

const useGetUserCommunityHistory = (
  props: IGetUserCommunitiesRsq,
  options?: Omit<
    UseQueryOptions<IGetUserCommunitiesRes, void>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<IGetUserCommunitiesRes, void>({
    queryKey: ["community-history", ...Object.values(props)],
    queryFn: async () =>
      (
        await api.get(API_URL.getUserCommunity, {
          params: props,
        })
      ).data,
    ...options,
  });

const useGetSuperSaveCommunityReward = () =>
  useMutation<IGetSuperSaveCommunityRewardResponse, AxiosError, string>({
    mutationFn: async (community: string) => {
      try {
        const response = await api.get(
          `${API_URL.getCommunityReward}?community=${encodeURIComponent(
            community,
          )}`,
        );
        return response.data;
      } catch (error) {
        console.error("An error occurred: ", error);
        throw error; // Make sure to throw the error to handle it properly in your component
      }
    },
    onError: (error) => {
      console.error("An error occurred: ", error);
    },
  });

export {
  useGetUserCommunityHistory,
  useUpdateUserCommunityByAdmin,
  useGetCommunityListByAdmin,
  useWithdrawalComplete,
  useSetWithdrawalCompleteByDate,
  useUpdateSuperSaveWidgetSetting,
  useSaveFile,
  useRejectSuperUserRequest,
  useRejectDepositRequest,
  useGetWithdrawals,
  useGetMassWithdrawRequests,
  useGetUserConsents,
  useGetMassSuperUsers,
  useGetSuperUsers,
  useGetSuperUserDetail,
  useGetSuperSaveWithdrawForm,
  useGetSuperSaveWidgetsSettings,
  useApproveDepositRequest,
  useApproveSuperUserRequest,
  useGetDailyCalculation,
  useGetDepositRequests,
  useGetMassDepositRequests,
  useGetMassWithdrawals,
  useGetUserInheritors,
  usePostDepositTransactionID,
  useRevokeDepositRequest,
  useTransferOwnershipDepositRequest,
  useGetUserTransferOwnershipHistory,
  useRejectTransferOwnershipRequest,
  useApproveTransferOwnershipRequest,
  useRejectBankChangeRequest,
  useApproveBankChangeRequest,
  useGetUserAirdropHistory,
  useUpdateSuperTrustStatus,
  useGetUserSuperTrustHistory,
  useUpdateIntroducerInfoRequest,
  useCheckTxidOnBlockchain,
  useSearchSuperSaveRequestByPhoneNumber,
  useCheckUserReferralCodeByAdmin,
  usePostUpdateUserDocumentByAdmin,
  useUploadFile,
  useCheckBulkTxidOnBlockchain,
  useGetUserCommitmentInfo,
  useGetUserReferralInfo,
  useGetSuperSaveCommunityReward,
};
