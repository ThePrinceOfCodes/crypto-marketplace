import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, queryClient, API_URL } from "api";
import {
  iGetP2pBlockchainTransactionReq,
  iGetP2pBlockchainTransactionErr,
  IP2pBlockchainTransaction,
  IUpdateP2pBlockchainTransactionReq,
} from "./types";

export type iGetP2pBlockchainTransactionResp = {
  lastId: string;
  hasNext: boolean;
  dataList: IP2pBlockchainTransaction[];
  result: string;
  nbElements: number;
  nbTotalElements: number;
  nbTotalPage: number;
};
const useGetP2pBlockchainTransaction = (
  {
    searchKey,
    search_by,
    status,
    lastId,
    limit,
    page,
    to_date,
    from_date,
  }: iGetP2pBlockchainTransactionReq,
  options?: Omit<
    UseQueryOptions<
      iGetP2pBlockchainTransactionResp,
      iGetP2pBlockchainTransactionErr
    >,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetP2pBlockchainTransactionResp, iGetP2pBlockchainTransactionErr>({
    queryKey: [
      "resend-transaction",
      searchKey,
      search_by,
      status,
      lastId,
      limit,
      page,
      to_date,
      from_date,
    ],
    queryFn: async () => {
      const { data } = await api.get(API_URL.getP2PBlockchainTransaction, {
        params: {
          searchKey,
          search_by,
          status,
          lastId,
          limit,
          page,
          to_date,
          from_date,
        },
      });

      return data;
    },
    ...options,
  });
const useUpdateP2pBlockchainTrans = () =>
  useMutation<void, void, IUpdateP2pBlockchainTransactionReq>({
    mutationFn: async (props) => {
      const res = (
        await api.post(`${API_URL.sendP2PBlockchainRejectedTransaction}?transaction_id=${props?.id}`)
      ).data;
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries("resend-transaction"),
  });

export { useUpdateP2pBlockchainTrans, useGetP2pBlockchainTransaction };
