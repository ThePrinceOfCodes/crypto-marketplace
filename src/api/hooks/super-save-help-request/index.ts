import { api } from "api";
import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { IHelperService } from "./types";
import { AxiosError } from "axios";

const useDeleteHelperService = () =>
  useMutation<void, void, { id: string[] }>({
    mutationFn: async (props) =>
      (
        await api.delete(`/help-request`, {
          data: { id_list: props.id },
        })
      ).data,
  });

const useEditHelperService = () =>
  useMutation<void, void, { status?: string; id: string; memo?: string }>({
    mutationFn: async ({ id, ...rest }) =>
      (await api.put(`/help-request/${id}`, rest)).data,
  });

export type iGetHelperServicesResp = {
  lastId: string;
  hasNext: boolean;
  help_requests: IHelperService[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetHelperServicesErr = AxiosError<any>;
export type iGetHelperServicesRsq = {
  limit?: number;
  searchKey?: string;
  startDate?: string;
  endDate?: string;
  lastId?: string;
};
const useGetHelperServices = (
  { limit, endDate, searchKey, startDate, lastId }: iGetHelperServicesRsq,
  options?: Omit<
    UseQueryOptions<iGetHelperServicesResp, iGetHelperServicesErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetHelperServicesResp, iGetHelperServicesErr>({
    queryKey: ["helper-services", limit, endDate, searchKey, startDate, lastId],
    queryFn: async () =>
      (
        await api.get("/help-request", {
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

export { useDeleteHelperService, useEditHelperService, useGetHelperServices };
