import { AxiosError } from "axios";

export interface IP2pBlockchainTransaction {
  id: string;
  order_id: string;
  email: string;
  tx_hash: string;
  type: string;
  from_wallet: string;
  price: number;
  status: number;
  to_wallet: string;
  currency: string;
  action_by: string;
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetP2pBlockchainTransactionErr = AxiosError<any>;
export type iGetP2pBlockchainTransactionReq = {
  searchKey?: string;
  search_by?: string;
  status?: number;
  lastId?: string;
  limit?: number;
  page?: number;
  from_date?: string;
  to_date?: string;
};

export interface IUpdateP2pBlockchainTransactionReq {
  id: string;
}
