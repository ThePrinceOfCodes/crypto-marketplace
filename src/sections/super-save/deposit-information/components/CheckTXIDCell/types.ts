import { ICheckBulkTxidOnBlockChainResult } from "api/hooks";

export interface ICheckTXIDCellProps {
  requestId: string;
  isLoading?: boolean;
  checkTxidResult?: ICheckBulkTxidOnBlockChainResult;
  blockchainResult?: string
}
