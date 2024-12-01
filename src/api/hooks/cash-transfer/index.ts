import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, API_URL } from "api";
import { ICashTransfer } from "./types";
import { AxiosError } from "axios";


export type iGetCashTransferResp = {
  lastId: string;
  hasNext: boolean;
  cashDepositHistory: ICashTransfer[];
  nbTotalPage: number;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetCashTransferErr = AxiosError<any>;
export type iGetTransferRsq = {
  limit?: number;
  searchKey?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
};
const useGetCashTransferInformation = (
  { limit, to_date, searchKey, from_date, page }: iGetTransferRsq,
  options?: Omit<
    UseQueryOptions<iGetCashTransferResp, iGetCashTransferErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetCashTransferResp, iGetCashTransferErr>({
    queryKey: ["get-cash-transfer", limit, to_date, searchKey, from_date, page],
    queryFn: async () =>
      (
        await api.get(API_URL.getAllCashTransfer, {
          params: {
            limit,
            to_date,
            searchKey,
            from_date,
            page,
          },
        })
      ).data,
    ...options,
  });

const useMassGetCashTransferInformation = () =>
  useMutation<iGetCashTransferResp, void, iGetTransferRsq>({
  mutationFn: async (props) =>
    (await api.get(API_URL.getAllCashTransfer, { params: props })).data,
});

export { useGetCashTransferInformation, useMassGetCashTransferInformation };
