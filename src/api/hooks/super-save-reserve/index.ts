import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, API_URL } from "api";
import { omit } from "lodash";
import {
  IDeleteReserve,
  IUpdateReserve,
  SaveReserveVaultType,
  iGetReserveRsq,
  iGetReserveResp,
  iGetReserveErr,
  IUpdateReserveLimitResponse,
  GetReservedLimitProp,
  IGetReserveLimitResponse,
} from "./types";

// Update reserve Valult
const useUpdateReserve = () =>
  useMutation<void, void, IUpdateReserve>({
    mutationKey: "update-reserve",
    mutationFn: async (props) =>
      await api.put(
        `${API_URL.superSaveReserve}/${props.reserveId}`,
        omit(props, "reserveId"),
      ),
  });

// Update reserve Valult limit
const useUpdateReservedLimit = () =>
  useMutation<IUpdateReserveLimitResponse>({
    mutationKey: "update-reserve-limit",
    mutationFn: async (props) =>
      await api.post(`${API_URL.superSaveUpdateReservedLimit}`, props),
  });

// Get reserve Valult limit
const useGetReservedLimit = ({ type }: GetReservedLimitProp) =>
  useQuery<IGetReserveLimitResponse>({
    queryKey: "update-reserve-limit",
    queryFn: async () =>
      (
        await api.get(API_URL.superSaveGetReservedLimit, {
          params: { type },
        })
      ).data.data,
  });

// Get reserve Valult
const useSaveReserveVault = () =>
  useMutation<void, void, SaveReserveVaultType>({
    mutationFn: async (props) =>
      (await api.post(API_URL.superSaveReserve, props)).data,
  });

// Delete reserve Valult
const useDeleteReserve = () =>
  useMutation<void, void, IDeleteReserve>({
    mutationKey: "delete-reserve",
    mutationFn: async (props) =>
      await api.delete(`/reserve`, {
        data: { reserve_id_list: props.reserveId },
      }),
  });

const useGetReserve = (
  {
    limit,
    type,
    date_filter,
    endDate,
    searchKey,
    startDate,
    lastId,
  }: iGetReserveRsq,
  options?: Omit<
    UseQueryOptions<iGetReserveResp, iGetReserveErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetReserveResp, iGetReserveErr>({
    queryKey: [
      "list-reserves",
      limit,
      type,
      date_filter,
      endDate,
      searchKey,
      startDate,
      lastId,
    ],
    queryFn: async () =>
      (
        await api.get("/reserve", {
          params: {
            limit,
            type,
            date_filter,
            endDate,
            searchKey,
            startDate,
            lastId,
          },
        })
      ).data,
    ...options,
  });

export {
  useDeleteReserve,
  useGetReserve,
  useUpdateReserve,
  useUpdateReservedLimit,
  useGetReservedLimit,
  useSaveReserveVault,
};
