import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, queryClient, API_URL } from "api";
import { IBugReport } from "./types";
import { AxiosError } from "axios";

const useDeleteBugReport = () =>
  useMutation<void, void, { id: string[] }>({
    mutationFn: async (props) =>
      (await api.delete(`/bug-report`, { data: { id_list: props.id } })).data,
    onSuccess: () => queryClient.invalidateQueries("bug-reports"),
  });

const useEditBugReportStatus = () =>
  useMutation<void, void, { status?: string; id: string; memo?: string }>({
    mutationFn: async ({ id, ...rest }) =>
      (await api.put(`/bug-report/${id}`, rest)).data,
  });

export type iGetBugReportsResp = {
  lastId: string;
  hasNext: boolean;
  bug_reports: IBugReport[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetBugReportsErr = AxiosError<any>;
export type iGetBugReportsRsq = {
  limit?: number;
  searchKey?: string;
  startDate?: string;
  endDate?: string;
  lastId?: string;
};
const useGetBugReports = (
  { limit, endDate, searchKey, startDate, lastId }: iGetBugReportsRsq,
  options?: Omit<
    UseQueryOptions<iGetBugReportsResp, iGetBugReportsErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetBugReportsResp, iGetBugReportsErr>({
    queryKey: ["bug-reports", limit, endDate, searchKey, startDate, lastId],
    queryFn: async () =>
      (
        await api.get(API_URL.getBugReports, {
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

export { useDeleteBugReport, useEditBugReportStatus, useGetBugReports };
