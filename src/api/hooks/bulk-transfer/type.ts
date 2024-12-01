import { AxiosError } from "axios";

export interface iBulkTransfer {
  uuid: string | null;
  tx_hash: string | null;
  status: number;
  remark: string;
  network: string;
  fee_coin: string;
  transaction_fee: number;
  transfer_coin_symbol: string;
  transfer_coin_amount: number;
  from_wallet: string;
  to_wallet: string;
  created_by: string;
  createdAt: string;
  action_by: string;
  action_date: string;
}

export type iGetBulkTransferRes = {
  nbTotalPage: number;
  lastId: string;
  hasNext: boolean;
  bulkTransfers: iBulkTransfer[];
  nbTotalElements: number;
};

export type iGetBulkTransferReq = {
  limit?: number;
  searchKey?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  sort_type?: string | string[];
  sort_column_name?: string | string[];
  status : 0 | 1 | 2 | 3
};

export type iGetBulkTransferErr = AxiosError<any>;