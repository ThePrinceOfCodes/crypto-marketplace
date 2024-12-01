import { useQuery } from "react-query";
import { api, API_URL } from "api";
import { GetAffiliateProps, IAffiliate, IAffiliateResponse } from "./types";

const useGetAffiliates = (props: GetAffiliateProps) =>
  useQuery<IAffiliateResponse>({
    queryKey: ["list-affiliate", props.page, props.pageSize],
    queryFn: async () => {
      const res = await api.get(API_URL.merchants, {
        params: { skip: props.page * props.pageSize, limit: props.pageSize },
      });
      const users = res.data as [IAffiliate];
      return { data: users, total: res.data.total };
    },
    cacheTime: 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

export { useGetAffiliates };
