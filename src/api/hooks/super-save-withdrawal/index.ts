import { UseMutationOptions, useMutation } from "react-query";
import { API_URL } from "../../url";
import { api } from "api";
import { AxiosError, AxiosResponse } from "axios";

export type iPostSetWithdrawUserAsAdminErr = AxiosError<{
  result?: string;
}>;
export type iPostSetWithdrawUserAsAdminResp = AxiosResponse<{
  message: string;
}>;
export type iPostSetWithdrawUserAsAdminRsq = {
  reason: string;
  description: string;
  bank_name: string;
  bank_account_number: string;
  amount: number;
  email: string;
  wallet_type: string;
  wallet_id: string;
  amount_usdt: number;
};
const useSetWithdrawUserAsAdmin = (
  options?: Omit<
    UseMutationOptions<
      iPostSetWithdrawUserAsAdminResp,
      iPostSetWithdrawUserAsAdminErr,
      iPostSetWithdrawUserAsAdminRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostSetWithdrawUserAsAdminResp,
    iPostSetWithdrawUserAsAdminErr,
    iPostSetWithdrawUserAsAdminRsq
  >({
    mutationFn: async ({ email, ...rest }) =>
      api.post(API_URL.setWithdrawalUserAsAdmin + `?email=${email}`, rest),
    ...options,
  });

export { useSetWithdrawUserAsAdmin };
