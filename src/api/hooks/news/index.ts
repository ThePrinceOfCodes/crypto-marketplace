import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, queryClient, API_URL } from "api";
import { IAddNewsReq, INews, IUpdateNewsReq } from "./types";
import { AxiosError } from "axios";

const useDeleteNews = () =>
  useMutation<void, void, { id: string[] }>({
    mutationFn: async (props) =>
      (await api.delete(`/news`, { data: { id_list: props.id } })).data,
    onSuccess: () => queryClient.invalidateQueries("get-news"),
  });

export type iGetNewsResp = {
  lastId: string;
  hasNext: boolean;
  news: INews[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetNewsErr = AxiosError<any>;
export type iGetNewsRsq = {
  limit?: number;
  searchKey?: string;
  startDate?: string;
  endDate?: string;
  lastId?: string;
};
const useGetNews = (
  { limit, endDate, searchKey, startDate, lastId }: iGetNewsRsq,
  options?: Omit<
    UseQueryOptions<iGetNewsResp, iGetNewsErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetNewsResp, iGetNewsErr>({
    queryKey: ["get-news", limit, endDate, searchKey, startDate, lastId],
    queryFn: async () =>
      (
        await api.get(API_URL.getNews, {
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

const useAddNews = () =>
  useMutation<void, void, IAddNewsReq>({
    mutationFn: async (props) => (await api.post("/news", props)).data,
    onSuccess: () => queryClient.invalidateQueries("get-news"),
  });

const useUpdateNews = () =>
  useMutation<void, void, IUpdateNewsReq>({
    mutationFn: async (props) => {
      const { id, ...rest } = props;
      (await api.put(`/news?uuid=${id}`, rest)).data;
    },
    onSuccess: () => queryClient.invalidateQueries("get-news"),
  });

export { useDeleteNews, useGetNews, useAddNews, useUpdateNews };
