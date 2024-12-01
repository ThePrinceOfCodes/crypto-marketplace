export interface IPlatforms {
  createdAt: string;
  onChainAddress: string;
  offChainAddress: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supportedTokens: any[];
  category_list: string[];
  platform_user: string;
  status: number;
  uuid: string;
  url: string;
  name: string;
  logo: string;
}
/*
  {
      "password": "$2b$10$kCLdxSuOgajlxoxjeKAaNuSp5Yhx389/z/i8/cjWROY.vXVzfxpTa",
      "roles": 1,
      "updatedAt": "2023-12-31T02:44:13",
      "phone_number": "",
      "createdAt": "2023-12-31T02:42:45",
      "validationToken": " ",
      "email": "spectrumsun45@gmail.com",
      "name": "Sunday",
      "verified": true
  },
*/
export interface IMsqPlatformUsers {
  createdAt: string;
  updatedAt: string;
  phone_number: string;
  validationToken: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  email: string;
  name: string;
  verified: boolean;
  roles: number;
  roles_v2: string;
}

export type GetUsersBalanceType = {
  tokenName?: string;
  searchKey?: string;
  limit?: number;
  lastId?: string;
  lastBalance?: number;
};

export interface IUsersBalance {
  uuid: string;
  tokenName: string;
  email: string;
  balance: number;
}

export interface IGetUsersBalanceResponse {
  message: string;
  finalResponse: IUsersBalance[];
  lastId: string;
  nbElement: number;
  nbTotalElement: number;
  lastBalance: number;
  hasNext: boolean;
}

export interface IPlatformBalance {
  uuid: string;
  tokenName: string;
  platform_id: string;
  platform_name: string;
  balance: number;
  status: number;
}

export interface IGetPlatformBalanceResponse {
  message: string;
  finalResponse: IPlatformBalance[];
  lastId: string;
  nbElement: number;
  nbTotalElement: number;
  lastBalance: number;
  hasNext: boolean;
}

export interface GetUserTokenTransactionHistoryType {
  token?: string;
  limit?: number;
  lastId?: string;
  createdAt?: string;
  includeDraft?: number;
  searchKey?: string;
}

export interface ITokenTransactionHistory {
  currency: string;
  platfrom_request: string;
  tx_action: string;
  createdAt: string;
  new_balance: number;
  email: string;
  tx_hash: string;
  to_user_id: string;
  user_id: string;
  from_user_id: string;
  from: string;
  platform_id: string;
  previous_balance: number;
  amount: number;
  uuid: string;
  to: string;
  type: string;
}

export interface IGetUserTokenTransactionHistoryResponse {
  result: string;
  transactions: ITokenTransactionHistory[];
  createdAt: number;
  lastId: string;
  nbTotalElement: number;
  hasNext: boolean;
}
