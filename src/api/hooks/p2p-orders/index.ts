import { UseQueryOptions, useMutation, useQuery } from "react-query";
import { api, queryClient, API_URL } from "api";
import { IP2pOrder } from "./types";
import { AxiosError } from "axios";

export type IGetP2pOrderRes = {
  result: string;
  dataList: IP2pOrder[];
  nbElements: number;
  nbTotalElements: number;
  nbTotalPage: number;
  hasNext: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IGetP2pOrderErr = AxiosError<any>;

export type IGetP2pOrderReq = {
  searchKey?: string;
  search_by?: string;
  isBuy?: string;
  status?: number;
  limit?: number;
  page?: number;
  from_date?: string;
  to_date?: string;
};

const useGetP2pOrders = (
  {
    searchKey,
    search_by,
    isBuy,
    status,
    limit,
    page,
    to_date,
    from_date,
  }: IGetP2pOrderReq,
  options?: Omit<
    UseQueryOptions<IGetP2pOrderRes, IGetP2pOrderErr>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<IGetP2pOrderRes, IGetP2pOrderErr>({
    queryKey: [
      "p2p-orders",
      searchKey,
      search_by,
      isBuy,
      status,
      limit,
      page,
      to_date,
      from_date,
    ],
    queryFn: async () => {
      const { data } = await api.get(API_URL.getP2pOrders, {
        params: {
          searchKey,
          search_by,
          isBuy,
          status,
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

const useDeleteP2pOrders = () =>
  useMutation<void, void, { id: string }>({
    mutationFn: async (props) => {
      const res = await api.delete(API_URL.deleteP2pOrders, {
        params: { order_id: props.id },
      });
      return res.data;
    },
  });

export { useGetP2pOrders, useDeleteP2pOrders };
