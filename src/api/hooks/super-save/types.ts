import { AxiosError, AxiosResponse } from "axios";

export interface SetSuperSaveRejectUserWithdrawalRequestProps {
  withdraw_request_id: string;
}

export interface ISuperSaveRejectUserWithdrawalRequest {
  result: string;
}

export type iPostSetSuperSaveWithdrawFormErr = AxiosError<{
  message?: string;
}>;
export type iPostSetSuperSaveWithdrawFormResp = AxiosResponse<{
  result: string;
  message?: string;
}>;
export type iPostSetSuperSaveWithdrawFormRsq = {
  withdraw_request_id: string;
};
