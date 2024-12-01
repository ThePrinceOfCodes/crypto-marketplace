import { useMutation, useQuery } from "react-query";
import { api, API_URL } from "api";
import axios from "axios";
import { IFlataExchangeResponse } from "./types";

const useGetFlataExchange = () =>
  useQuery<IFlataExchangeResponse>({
    queryKey: ["falta-exchange"],
    queryFn: async () => {
      const btcToKrw = await api.get(
        "https://api.bithumb.com/public/ticker/BTC_KRW",
      );

      if (btcToKrw) {
        const opening_price = btcToKrw?.data?.data?.opening_price;
        const msqToBtcMSQ = await axios.get(
          "https://www.flata.exchange/out/api/getTickers?symbol=MSQ/BTC",
        );
        const msqToBtcMSQX = await axios.get(
          "https://www.flata.exchange/out/api/getTickers?symbol=MSQX/BTC",
        );
        const currentMSQ = msqToBtcMSQ?.data?.list[0].current;
        const currentMSQX = msqToBtcMSQX?.data?.list[0].current;
        return {
          rate: opening_price * currentMSQ,
          msqx_rate: opening_price * currentMSQX,
        };
      } else return {};
    },
  });

const useClearCache = () =>
  useMutation<void, string, void>({
    mutationFn: async () => {
      return (await api.get(API_URL.clearCache)).data;
    },
  });

export { useGetFlataExchange, useClearCache };
