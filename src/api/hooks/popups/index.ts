import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, queryClient, API_URL } from "api";
import { IPopUp, IAddPopUpReq, IUpdatePopUpReq } from "./types";
import { AxiosError } from "axios";

export type iGetPopUpsResp = {
  lastId: string;
  newLastId: string;
  hasNext: boolean;
  popups: IPopUp[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetPopUpsErr = AxiosError<any>;
export type iGetPopUpsRsq = {
  searchKey?: string;
  searchValue?: string;
  lastId?: string;
  limit?: number;
  page?: number;
  from_date?: string;
  to_date?: string;
};
const useGetPopUps = (
  {
    searchKey,
    searchValue,
    lastId,
    limit,
    page,
    to_date,
    from_date,
  }: iGetPopUpsRsq,
  options?: Omit<
    UseQueryOptions<iGetPopUpsResp, iGetPopUpsErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<iGetPopUpsResp, iGetPopUpsErr>({
    queryKey: [
      "pop-ups",
      searchKey,
      searchValue,
      lastId,
      limit,
      page,
      to_date,
      from_date,
    ],
    queryFn: async () =>
      (
        await api.get(API_URL.getAllPopups, {
          params: {
            searchKey,
            searchValue,
            lastId,
            limit,
            page,
            to_date,
            from_date,
          },
        })
      ).data,
    ...options,
  });

const useAddPopUp = () =>
  useMutation<void, void, IAddPopUpReq>({
    mutationFn: async (props) =>
      (
        await api.post("/popup", props, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data
  });

const useUpdatePopUp = () =>
  useMutation<void, void, IUpdatePopUpReq>({
    mutationFn: async (props) => {
      const { id, formData } = props;
      return (
        await api.patch(`/popup/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data;
    },
    onSuccess: () => queryClient.invalidateQueries("get-popup"),
  });

const useDeletePopUp = () =>
  useMutation<void, void, { id: string[] }>({
    mutationFn: async (props) =>
      // eslint-disable-next-line quotes
      (await api.delete(`/popup`, { data: { id_list: props.id } })).data,
    onSuccess: () => queryClient.invalidateQueries("get-popup"),
  });

export { useAddPopUp, useDeletePopUp, useUpdatePopUp, useGetPopUps };
