export interface IP2pOrder {
  id: string;
  createdBy: string;
  price: number;
  currency: string;
  depositTxID: string;
  wallet: string;
  txID: string;
  fee: number;
  feeTxID: string;
  isCompleteCreator: boolean;
  completedBy: string;
  completedWallet: string;
  completedTxID: string;
  completedFee: number;
  withdrawalTxID: string;
  isComplete: boolean;
  isBuy: boolean;
  baseAmount: number;
  baseCurrency: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}
