import { api, API_URL } from "api";
import { AxiosError, AxiosResponse } from "axios";
import { useMutation, UseMutationOptions } from "react-query";

export type iPostMutateTokenQuantityResp = {
  result: string;
};
export type iPostMutateTokenQuantityErr = AxiosError<{
  err: string;
}>;
export type iPostMutateTokenQuantityRsq = {
  email: string;
  amount: number;
  type: "add" | "remove";
  token: string;
  memo: string;
};
const usePostMutateTokenQuantity = (
  options?: Omit<
    UseMutationOptions<
      iPostMutateTokenQuantityResp,
      iPostMutateTokenQuantityErr,
      iPostMutateTokenQuantityRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostMutateTokenQuantityResp,
    iPostMutateTokenQuantityErr,
    iPostMutateTokenQuantityRsq
  >({
    mutationFn: async ({ amount, email, type, token, memo }) =>
      (
        await api.post(
          type === "add" ? API_URL.increaseP2U : API_URL.deductP2U,
          { amount, email, token, memo },
        )
      ).data,
    ...options,
  });

export type iPostRefundQrTransactionResp = AxiosResponse<{
  msg: string;
}>;
export type iPostRefundQrTransactionErr = AxiosError<{
  msg: string;
  error: string;
}>;
export type iPostRefundQrTransactionRsq = {
  transactionId: string;
  feePercentage: number;
};
const usePostRefundQrTransaction = (
  options?: Omit<
    UseMutationOptions<
      iPostRefundQrTransactionResp,
      iPostRefundQrTransactionErr,
      iPostRefundQrTransactionRsq
    >,
    "mutationFn"
  >,
) =>
  useMutation<
    iPostRefundQrTransactionResp,
    iPostRefundQrTransactionErr,
    iPostRefundQrTransactionRsq
  >({
    mutationFn: async ({ feePercentage, transactionId }) =>
      (
        await api.post(API_URL.refundQrTransaction, {
          fee_percentage: feePercentage,
          transaction_id: transactionId,
        })
      ).data,
    ...options,
  });

export { usePostMutateTokenQuantity, usePostRefundQrTransaction };
