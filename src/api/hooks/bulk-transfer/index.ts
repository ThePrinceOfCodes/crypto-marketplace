import { UseQueryOptions, useQuery } from "react-query";
import { api, API_URL } from "api";
import {
    iGetBulkTransferRes,
    iGetBulkTransferErr,
    iGetBulkTransferReq,
} from "./type";

const useGetBulkTransfer = (
    props: iGetBulkTransferReq,
    options?: Omit<
        UseQueryOptions<iGetBulkTransferRes, iGetBulkTransferErr>,
        "queryKey" | "queryFn"
    >,
) =>
    useQuery<iGetBulkTransferRes, iGetBulkTransferErr>({
        queryKey: ["get-bulk-transaction", ...Object.values(props)],
        queryFn: async () =>
            (
                await api.get(API_URL.getBulkTransactionList, {
                    params: props,
                })
            ).data,
        ...options,
    });

export {
    useGetBulkTransfer,
};