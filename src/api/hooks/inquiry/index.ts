import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, queryClient, API_URL } from "api";
import {
  iGetInquiryRsq,
  iGetInquiryErr,
  iGetInquiryResp,
  iUseDeleteInquiry,
  iUseUpdateInquiryStatus,
  iUseSendResponse,
} from "./type";

const useGetInquiries = (
  { limit, endDate, searchKey, startDate, lastId }: iGetInquiryRsq,
  options?: Omit<
    UseQueryOptions<iGetInquiryResp, iGetInquiryErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetInquiryResp, iGetInquiryErr>({
    queryKey: ["get-inquiries", limit, endDate, searchKey, startDate, lastId],
    queryFn: async () =>
      (
        await api.get(API_URL.getInquiries, {
          params: {
            limit,
            endDate,
            searchKey,
            startDate,
            lastId,
          },
        })
      ).data,
    ...options,
  });

const useGetMassInquiries = () =>
  useMutation<iGetInquiryResp, void, any>({
    mutationFn: async (props) =>
      (await api.get(API_URL.getInquiries, { params: props })).data,
  });

const useDeleteInquiry = () =>
  useMutation<void, void, iUseDeleteInquiry>({
    mutationFn: async (props) =>
      (await api.delete(`${API_URL.deleteInquiries}`, { data: { id_list: props.id } })).data,
    onSuccess: () => queryClient.invalidateQueries("delete-inquiry"),
  });

const useUpdateInquiryStatus = () =>
  useMutation<void, void, iUseUpdateInquiryStatus>({
    mutationFn: async (props) =>
      (await api.post(API_URL.updateStatusInquiries, props)).data,
    onSuccess: () => queryClient.invalidateQueries("update-inquiry-status"),
  });

const useSendResponse = () =>
  useMutation<void, void, iUseSendResponse>({
    mutationFn: async (props) =>
      (await api.post(API_URL.sendInquiryResponse, props)).data,
    onSuccess: () => queryClient.invalidateQueries("send-inquiry-response"),
  });

export {
  useGetInquiries,
  useDeleteInquiry,
  useUpdateInquiryStatus,
  useSendResponse,
  useGetMassInquiries
};