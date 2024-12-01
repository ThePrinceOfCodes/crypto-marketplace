export interface SetLanguageProps {
  language: string;
}

export interface ILanguage {
  result: string;
}

export interface GetUsersProps {
  page: number;
  pageSize: number;
}

export interface GetStartAndEndDate {
  startDate: string;
  endDate: string;
}

export interface IUser {
  id: number;
  email: string;
  password: string;
  point: number;
  type: string;
  offChainAddress: string;
  onChainAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetTransactionProps {
  page?: number;
  pageSize?: number;
  platformId: string;
}

export interface ITransaction {
  amount: number;
  currency: string;
  createdAt: string;
  email: string;
  from: string;
  platfrom_request: string;
  to: string;
  tx_action: string;
  tx_hash: string;
  type: string;
  uuid: string;
}

export interface GetTokensProps {
  page: number;
  pageSize: number;
}

export interface ITokens {
  name: string;
  swappable: boolean;
  isApproved: boolean;
  creator: string;
  updatedAt: string;
  createdAt: string;
  address: string;
  onChain: boolean;
}

export type ITransactionsHistoryResponse = {
  data: [ITransaction];
  msg: string;
};

export interface IGetAffiliatesResponse {
  data: [ITokens];
}

export interface IGetUsersResponse {
  data: [IUser];
}
