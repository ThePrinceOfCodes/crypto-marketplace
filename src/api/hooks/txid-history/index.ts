import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, queryClient, API_URL } from "api";
import {
  ITxidHistory,
  IUpdateTxidHistoryReq,
  IAddNewTxidReq,
  IEditTxidHistoryReq,
  IDeleteTxidReq,
  IVerifyTxidReq,
} from "./types";
import { AxiosError } from "axios";

export type iGetTxIdHistoryResp = {
  lastId: string;
  hasNext: boolean;
  rows: ITxidHistory[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetTxIdHistoryErr = AxiosError<any>;
export type iGetTxIdHistoryRsq = {
  searchKey?: string;
  date_to?: string;
  date_from?: string;
  searchValue?: string;
  lastId?: string;
  limit?: number;
  page?: number;
  status?: string;
};
const useGetTxIdHistory = (
  {
    searchKey,
    searchValue,
    lastId,
    date_from,
    date_to,
    limit,
    page,
    status,
  }: iGetTxIdHistoryRsq,
  options?: Omit<
    UseQueryOptions<iGetTxIdHistoryResp, iGetTxIdHistoryErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetTxIdHistoryResp, iGetTxIdHistoryErr>({
    queryKey: [
      "txid-history",
      searchKey,
      searchValue,
      lastId,
      limit,
      page,
      date_from,
      date_to,
      status,
    ],
    queryFn: async () =>
      (
        await api.get(API_URL.getAllTxIdHistory, {
          params: {
            searchKey,
            searchValue,
            lastId,
            limit,
            page,
            date_from,
            date_to,
            status,
          },
        })
      ).data,
    ...options,
  });

const useUpdateTxidHistory = () =>
  useMutation<void, void, IUpdateTxidHistoryReq>({
    mutationFn: async (props) => {
      (await api.put(API_URL.updateTxidHistory, props)).data;
    },
    onSuccess: () => queryClient.invalidateQueries("txid-history-update"),
  });

const useEditTXID = () =>
  useMutation<void, void, IEditTxidHistoryReq>({
    mutationFn: async (props) => {
      (await api.put(API_URL.editTxid, props)).data;
    },
    onSuccess: () => queryClient.invalidateQueries("txid-edit"),
  });

const useAddNewTXID = () =>
  useMutation<void, void, IAddNewTxidReq>({
    mutationFn: async (props) =>
      (await api.post(API_URL.addNewTxid, props)).data,
    onSuccess: () => queryClient.invalidateQueries("add-new-txid"),
  });

const useVerifyTxid = (txid: string) =>
  useQuery<boolean, Error, IVerifyTxidReq>({
    queryKey: ["verify-txid", txid],
    queryFn: async () => {
      const res = await api.post(API_URL.verifyTxid, { txid });
      return res.data.message;
    },
  });

const useDeleteTxid = () =>
  useMutation<void, void, IDeleteTxidReq>({
    mutationFn: async (props) =>
      (await api.delete(API_URL.deleteTxid, { data: props })).data,
    onSuccess: () => queryClient.invalidateQueries("delete-txid"),
  });

export {
  useUpdateTxidHistory,
  useGetTxIdHistory,
  useAddNewTXID,
  useVerifyTxid,
  useDeleteTxid,
  useEditTXID,
};

