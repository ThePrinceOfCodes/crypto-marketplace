import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, queryClient, API_URL } from "api";
import { IBulkNotifications, ISendBulkNotificationsReq } from "./types";
import { AxiosError } from "axios";

export type iGetBukNotificationResp = {
  lastId: string;
  hasNext: boolean;
  bulkNotifictionData: IBulkNotifications[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetBulkNotificationErr = AxiosError<any>;
export type iGetBulkNotificationRsq = {
  searchKey?: string;
  searchValue?: string;
  lastId?: string;
  limit?: number;
  page?: number;
  date_from?: string;
  date_to?: string;
};
const useGetBulkNotifications = (
  {
    searchKey,
    searchValue,
    lastId,
    limit,
    page,
    date_to,
    date_from,
  }: iGetBulkNotificationRsq,
  options?: Omit<
    UseQueryOptions<iGetBukNotificationResp, iGetBulkNotificationErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetBukNotificationResp, iGetBulkNotificationErr>({
    queryKey: [
      "all-bulk-notifications",
      searchKey,
      searchValue,
      lastId,
      limit,
      page,
      date_to,
      date_from,
    ],
    queryFn: async () =>
      (
        await api.get(API_URL.getAllBulkNotification, {
          params: {
            searchKey,
            searchValue,
            lastId,
            limit,
            page,
            date_to,
            date_from,
          },
        })
      ).data,
    ...options,
  });

const useSendBulkNotification = () =>
  useMutation<void, void, ISendBulkNotificationsReq>({
    mutationFn: async (props) =>
      (await api.post(API_URL.sendNotificationToAllUser, props)).data,
  });

export { useSendBulkNotification, useGetBulkNotifications };
