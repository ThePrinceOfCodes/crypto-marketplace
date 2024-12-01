import { api, API_URL, queryClient } from "api";
import { useMutation, UseMutationOptions } from "react-query";
import {
  ISuperSaveRejectUserWithdrawalRequest,
  SetSuperSaveRejectUserWithdrawalRequestProps,
  iPostSetSuperSaveWithdrawFormResp,
  iPostSetSuperSaveWithdrawFormErr,
  iPostSetSuperSaveWithdrawFormRsq,
} from "./types";
import { AxiosError, AxiosResponse } from "axios";

const useSetSuperSaveWithdrawForm = (
  options?: Omit<
    UseMutationOptions<
      iPostSetSuperSaveWithdrawFormResp,
      iPostSetSuperSaveWithdrawFormErr,
      iPostSetSuperSaveWithdrawFormRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostSetSuperSaveWithdrawFormResp,
    iPostSetSuperSaveWithdrawFormErr,
    iPostSetSuperSaveWithdrawFormRsq
  >({
    mutationFn: async (props) =>
      api.post(API_URL.setSuperSaveWithdrawForm, props),
    ...options,
  });

const useRejectUserWithdrawalRequest = () =>
  useMutation<
    ISuperSaveRejectUserWithdrawalRequest,
    string,
    SetSuperSaveRejectUserWithdrawalRequestProps
  >({
    mutationFn: async (props) => {
      return (
        await api.post(API_URL.setSuperSaveRejectUserWithdrawalRequest, {
          ...props,
        })
      ).data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries(["super-user-details", "super-users"]),
  });

export type iPostEmailBugReportUserErr = AxiosError<{
  msg?: string;
  error?: string;
}>;
export type iPostEmailBugReportUserResp = { status: string };
export type iPostEmailBugReportUserRsq = {
  bug_report_id: string;
  subject: string;
  message: string;
};

const usePostEmailBugReportUser = (
  options?: Omit<
    UseMutationOptions<
      iPostEmailBugReportUserResp,
      iPostEmailBugReportUserErr,
      iPostEmailBugReportUserRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostEmailBugReportUserResp,
    iPostEmailBugReportUserErr,
    iPostEmailBugReportUserRsq
  >({
    mutationFn: async (props) =>
      api.post(API_URL.postEmailBugReportUser, props),
    ...options,
  });

export type iPostUpdateUserPhoneNumberErr = AxiosError<{
  result?: string;
  error?: string;
}>;
export type iPostUpdateUserPhoneNumberResp = AxiosResponse<{ message: string }>;
export type iPostUpdateUserPhoneNumberRsq = {
  user_id: string;
  phone_number: string;
};

const usePostUpdateUserPhoneNumber = (
  options?: Omit<
    UseMutationOptions<
      iPostUpdateUserPhoneNumberResp,
      iPostUpdateUserPhoneNumberErr,
      iPostUpdateUserPhoneNumberRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostUpdateUserPhoneNumberResp,
    iPostUpdateUserPhoneNumberErr,
    iPostUpdateUserPhoneNumberRsq
  >({
    mutationFn: (props) => api.post(API_URL.postUpdateUserPhoneNumber, props),
    ...options,
  });

export type iPostUpdateUserNameErr = AxiosError<{
  result?: string;
  error?: string;
}>;
export type iPostUpdateUserNameResp = AxiosResponse<{ result: string }>;
export type iPostUpdateUserNameRsq = {
  user_id: string;
  name: string;
};

const usePostUpdateUserName = (
  options?: Omit<
    UseMutationOptions<
      iPostUpdateUserNameResp,
      iPostUpdateUserNameErr,
      iPostUpdateUserNameRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostUpdateUserNameResp,
    iPostUpdateUserNameErr,
    iPostUpdateUserNameRsq
  >({
    mutationFn: (props) => api.post(API_URL.postUpdateUserName, props),
    ...options,
  });

export type iPostUpdateUserEmailErr = AxiosError<{
  result?: string;
  error?: string;
}>;
export type iPostUpdateUserEmailResp = AxiosResponse<{ result: string }>;
export type iPostUpdateUserEmailRsq = {
  user_id: string;
  email: string;
};

const usePostUpdateUserEmail = (
  options?: Omit<
    UseMutationOptions<
      iPostUpdateUserEmailResp,
      iPostUpdateUserEmailErr,
      iPostUpdateUserEmailRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostUpdateUserEmailResp,
    iPostUpdateUserEmailErr,
    iPostUpdateUserEmailRsq
  >({
    mutationFn: (props) => api.post(API_URL.postUpdateUserEmail, props),
    ...options,
  });

export type iPostUpdateCorporateNameErr = AxiosError<{
  result?: string;
  error?: string;
}>;
export type iPostUpdateCorporateNameResp = AxiosResponse<{ result: string }>;
export type iPostUpdateCorporateNameRsq = {
  user_id: string;
  corporate_name: string;
};

const usePostUpdateCorporateName = (
  options?: Omit<
    UseMutationOptions<
      iPostUpdateCorporateNameResp,
      iPostUpdateCorporateNameErr,
      iPostUpdateCorporateNameRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostUpdateCorporateNameResp,
    iPostUpdateCorporateNameErr,
    iPostUpdateCorporateNameRsq
  >({
    mutationFn: (props) => api.post(API_URL.postUpdateCorporateName, props),
    ...options,
  });

export type iPostUpdateCorporateBankAccHolderNameErr = AxiosError<{
  result?: string;
  error?: string;
}>;
export type iPostUpdateCorporateBankAccHolderNameResp = AxiosResponse<{
  result: string;
}>;
export type iPostUpdateCorporateBankAccHolderNameRsq = {
  user_id: string;
  bank_account_holder_name: string;
};

const usePostUpdateCorporateBankAccHolderName = (
  options?: Omit<
    UseMutationOptions<
      iPostUpdateCorporateBankAccHolderNameResp,
      iPostUpdateCorporateBankAccHolderNameErr,
      iPostUpdateCorporateBankAccHolderNameRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostUpdateCorporateBankAccHolderNameResp,
    iPostUpdateCorporateBankAccHolderNameErr,
    iPostUpdateCorporateBankAccHolderNameRsq
  >({
    mutationFn: (props) =>
      api.post(API_URL.postUpdateCorporateBankAccountHolderName, props),
    ...options,
  });

export type iPostUpdateCorporateRegistrationNumberErr = AxiosError<{
  result?: string;
  error?: string;
}>;
export type iPostUpdateCorporateRegistrationNumberResp = AxiosResponse<{
  result: string;
}>;
export type iPostUpdateCorporateRegistrationNumberRsq = {
  user_id: string;
  business_registration_number: string;
};

const usePostUpdateCorporateRegistrationNumber = (
  options?: Omit<
    UseMutationOptions<
      iPostUpdateCorporateRegistrationNumberResp,
      iPostUpdateCorporateRegistrationNumberErr,
      iPostUpdateCorporateRegistrationNumberRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostUpdateCorporateRegistrationNumberResp,
    iPostUpdateCorporateRegistrationNumberErr,
    iPostUpdateCorporateRegistrationNumberRsq
  >({
    mutationFn: (props) =>
      api.post(API_URL.postUpdateCorporateRegistrationNumber, props),
    ...options,
  });

export type iPostUpdateUserBankDetailsErr = AxiosError<{
  result?: string;
  message?: string;
}>;
export type iPostUpdateUserBankDetailsResp = AxiosResponse<{ result: string }>;
export type iPostUpdateUserBankDetailsRsq = {
  user_id: string;
  bank_name: string;
  bank_account_number: string;
};

const usePostUpdateUserBankDetails = (
  options?: Omit<
    UseMutationOptions<
      iPostUpdateUserBankDetailsResp,
      iPostUpdateUserBankDetailsErr,
      iPostUpdateUserBankDetailsRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostUpdateUserBankDetailsResp,
    iPostUpdateUserBankDetailsErr,
    iPostUpdateUserBankDetailsRsq
  >({
    mutationFn: (props) => api.post(API_URL.postUpdateUserBankDetails, props),
    ...options,
  });

export type IPostUpdateUserBankDetailsByIdRsq = {
  bank_id: string;
  user_id: string;
  bank_name: string;
  bank_account_number: string;
};

const usePostUpdateUserBankDetailsById = (
  options?: Omit<
    UseMutationOptions<
      iPostUpdateUserBankDetailsResp,
      iPostUpdateUserBankDetailsErr,
      IPostUpdateUserBankDetailsByIdRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostUpdateUserBankDetailsResp,
    iPostUpdateUserBankDetailsErr,
    IPostUpdateUserBankDetailsByIdRsq
  >({
    mutationFn: (props) => api.post(API_URL.updateUserBankAccountById, props),
    ...options,
  });

const usePostAddUserBankDetails = (
  options?: Omit<
    UseMutationOptions<
      iPostUpdateUserBankDetailsResp,
      iPostUpdateUserBankDetailsErr,
      iPostUpdateUserBankDetailsRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostUpdateUserBankDetailsResp,
    iPostUpdateUserBankDetailsErr,
    iPostUpdateUserBankDetailsRsq
  >({
    mutationFn: (props) => api.post(API_URL.addUserBankAccount, props),
    ...options,
  });

export type IPostUpdateUserWalletDetailsErr = AxiosError<{
  result?: string;
  message?: string;
}>;
export type IPostUpdateUserWalletDetailsResp = AxiosResponse<{
  result: string;
  message?: string;
}>;
export type IPostUpdateUserWalletDetailsRsq = {
  wallet_uuid: string;
  user_id: string;
  wallet_type: string;
  wallet_id: string;
};

const usePostUpdateUserWalletDetails = (
  options?: Omit<
    UseMutationOptions<
      IPostUpdateUserWalletDetailsResp,
      IPostUpdateUserWalletDetailsErr,
      IPostUpdateUserWalletDetailsRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    IPostUpdateUserWalletDetailsResp,
    IPostUpdateUserWalletDetailsErr,
    IPostUpdateUserWalletDetailsRsq
  >({
    mutationFn: (props) => api.post(API_URL.updateUserWalletAccountById, props),
    ...options,
  });

export type IPostCreateUserWalletDetailsErr = AxiosError<{
  result?: string;
  message?: string;
}>;
export type IPostCreateUserWalletDetailsResp = AxiosResponse<{
  result: string;
}>;
export type IPostCreateUserWalletDetailsRsq = {
  user_id: string;
  wallet_type: string;
  wallet_id: string;
};
const usePostCreateUserWalletDetails = (
  options?: Omit<
    UseMutationOptions<
      IPostCreateUserWalletDetailsResp,
      IPostCreateUserWalletDetailsErr,
      IPostCreateUserWalletDetailsRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    IPostCreateUserWalletDetailsResp,
    IPostCreateUserWalletDetailsErr,
    IPostCreateUserWalletDetailsRsq
  >({
    mutationFn: (props) => api.post(API_URL.addUserWalletAccount, props),
    ...options,
  });

export type iPostExchangeUserIdErr = AxiosError<{
  result?: string;
}>;
export type iPostExchangeUserIdResp = { data: { message: string } };
export type iPostExchangeUserIdRsq = {
  old_user_email: string;
  new_user_email: string;
  phone_number: string;
};
const usePostExchangeUserId = (
  options?: Omit<
    UseMutationOptions<
      iPostExchangeUserIdResp,
      iPostExchangeUserIdErr,
      iPostExchangeUserIdRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostExchangeUserIdResp,
    iPostExchangeUserIdErr,
    iPostExchangeUserIdRsq
  >({
    mutationFn: async (props) => api.post(API_URL.exchangeUserId, props),
    ...options,
  });

  export type IPostSuperSaveStatusErr = AxiosError<{
  result?: string;
  message?: string;
}>;
export type IPostSuperSaveStatusResp = AxiosResponse<{
  result: string;
}>;
export type IPostSuperSaveStatusRsq = {
   user_id?: string,
   reason: string
};
const usePostUpdateUserSuperSaveStatus = (
  options?: Omit<
    UseMutationOptions<
      IPostSuperSaveStatusResp,
      IPostSuperSaveStatusErr,
      IPostSuperSaveStatusRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
      IPostSuperSaveStatusResp,
      IPostSuperSaveStatusErr,
      IPostSuperSaveStatusRsq
  >({
    mutationFn: (props) => api.post(API_URL.updateUserSuperSaveStatus, props),
    ...options,
  });

export {
  useSetSuperSaveWithdrawForm,
  useRejectUserWithdrawalRequest,
  usePostEmailBugReportUser,
  usePostUpdateUserPhoneNumber,
  usePostUpdateUserName,
  usePostUpdateUserBankDetails,
  usePostExchangeUserId,
  usePostUpdateUserWalletDetails,
  usePostAddUserBankDetails,
  usePostUpdateUserBankDetailsById,
  usePostCreateUserWalletDetails,
  usePostUpdateUserEmail,
  usePostUpdateCorporateBankAccHolderName,
  usePostUpdateCorporateName,
  usePostUpdateCorporateRegistrationNumber,
  usePostUpdateUserSuperSaveStatus
};
