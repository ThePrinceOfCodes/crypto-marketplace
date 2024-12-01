export interface ITxidHistory {
  txid: string;
  status: number;
  createdAt: string;
  reason: string;
  user_id: string;
  token: string;
  super_save_request_id: string;
  refund_token: string;
  refund_txid: string;
  updatedAt: string;
  amount: number;
  refund_amount: number;
  refund_reason: string;
  action_by: string;
}

export interface IUpdateTxidHistoryReq {
  txid: string;
  createdAt: string;
  status: number;
  refund_token: string;
  refund_amount: number;
  refund_txid: string;
  refund_reason: string;
}

export interface IEditTxidHistoryReq {
  txid: string;
  token: string;
  amount: number;
  super_save_request_id: string;
  reason: string;
}

export interface IAddNewTxidReq {
  txid: string;
  super_save_request_id: string;
  token: string;
  amount: number;
  reason: string;
}

export interface IDeleteTxidReq {
  txid: string;
}

export interface IVerifyTxidReq {
  txid: string;
}
