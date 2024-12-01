export type GetUserTransactionHistoryType = {
  email: string;
  searchKey?: string;
  lastId?: string;
  createdAt?: string;
  limit?: number;
  includeDraft?: number;
};

export type GetUserRpaErrorLogsType = {
  email?: string;
  lastCreatedAt?: number;
  lastEmail?: string;
  limit?: number;
  dateTo?: string;
  dateFrom?: string;
  searchKey?: string;
  page?: number;
  version?:number;
};

export type GetUserRpaHistoryType = {
  email?: string;
  lastId?: string;
  lastEmail?: string;
  limit?: number;
  page?:number
  dateTo?:string;
  dateFrom?: string;
  searchKey?: string;
  is_affiliated?: string;
  is_accumulated?: string;
  version?: number;
};

export type IUserLogChangedVariables= {
  key: string;
  value: string;
  label: string;
}

export type Iusers = {
  user_id: string;
  id: string;
  createdAt: string;
  content: string;
  updatedAt: string;
  uuid: string;
  ip_address?: string;
  memo?: string;
  admin_name?: string;
  app_version?: string;
  admin_id?: string;
};

export interface PayHistoryDetails {
  approvalAmount: string;
  merchantKind: string;
  approvalDate: string;
  cardKind: string;
  merchantName: string;
  email: string;
  estimatedPaymentDate: string;
  paymentStatus: string;
  salesType: string;
  cardNumber: string;
  isAccumulated: boolean;
  installment: string;
  id: string;
  salesFranchiseName: string;
  threshold: number;
  domesticType: string;
  cancelDate: string;
  createdAt: string;
  percentage: number;
  merchantCode: string;
  approvalTime: string;
  merchantAddress: string;
  isAffiliated: boolean;
  companyCode: string;
  businessNumber: string;
  merchantRepresentativeName: string;
  approvalNumber: string;
  cardNumberFormat: string;
  merchantPhone: string;
  amount: number;
  currencyCode: string;
  point: number;
  companyName: string;
  isDuplicated?: string;
}
export interface IUserTransaction {
  amount: number;
  createdAt: string;
  currency: string;
  to: string;
  tx_action: string;
  tx_hash: string;
  type: string;
  uuid: string;
  pay_history: PayHistoryDetails;
}

export interface IUserRPAHistory {
  approvalAmount: string;
  merchantKind: string;
  status: number;
  approvalDate: string;
  cardKind: string;
  merchantName: string;
  email: string;
  estimatedPaymentDate: string;
  paymentStatus: string;
  salesType: string;
  cardNumber: string;
  isAccumulated: boolean;
  installment: string;
  id: string;
  salesFranchiseName: string;
  threshold: number;
  domesticType: string;
  cancelDate: string;
  createdAt: string;
  percentage: number;
  merchantCode: string;
  approvalTime: string;
  merchantAddress: string;
  isAffiliated: boolean;
  companyCode: string;
  businessNumber: string;
  merchantRepresentativeName: string;
  approvalNumber: string;
  cardNumberFormat: string;
  merchantPhone: string;
  amount: number;
  currencyCode: string;
  point: number;
}

export interface UserRPAHistoryDataFilter{
  is_affiliated?: string;
  is_accumulated?: string;
  dateFrom?: string;
  dateTo?: string;
  searchKey?: string;
  version?: number;
  endDate?: string;
  startDate?: string;
}

export interface IGetUserTransactionResponse {
  message: string;
  lastId: string;
  nbElements: number;
  nbTotalElements: number;
  hasNext: boolean;
  transactions: IUserTransaction[];
  createdAt: string;
}

export interface IGetUserRPAResponse {
  result: string;
  numberOfQueue: number;
  numberOfFlight: number;
  numberOfCardQueue: number;
  numberOfCardFlight: number;
  lastRPACallTime: string;
  lastId: string;
  nbElements: number;
  hasNext: boolean;
  getUserRPAHistory: IUserRPAHistory[];
  lastEmail: string;
  nbTotalPage: number;

}

export interface ICardCompanies {
  code: string;
  errorCode: string | undefined;
  updatedAt: string;
  activated: boolean;
  errorMessage: string | undefined;
  name: string;
}

export interface IUserRPAError {
  apiSeq: string;
  errorCode: string;
  companyCode: string;
  status: number;
  createdAt: string;
  errorMessage: string;
  email: string;
}

export interface IGetUserRpaErrorLogsResponse {
  result: string;
  getCardCompanies: ICardCompanies[];
  getUserRPAError: IUserRPAError[];
  lastCreatedAt: number;
  lastEmail: string;
  lastId: string;
  nbElements: number;
  hasNext: boolean;
  nbTotalPage:number;

}

export type GetUserTokensType = {
  email: string;
};

export type GetUserHistoryType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_id: any;
  limit?: number;
  searchKey?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
};

export type GetUserNotificationType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_id: any;
  limit?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
};

export interface IToken {
  balance: number;
  id: string;
  name: string;
}

export type GetUserCardInfoType = {
  email: string;
};

export type Iaccounts = {
  createdAt: number;
  password: string;
  id: string;
  updatedAt: number;
  name: string;
};

export type IRPA = {
  startDate: string;
  createdAt: string;
  email: string;
  endDate: string;
  updatedAt: string;
};
export interface ICardInfo {
  msg: string;
  result: Iaccounts[];
  rpa: IRPA;
}

export type IUserHistory = {
  message: string;
  lastId: string;
  nbElements: number;
  nbTotalElements: number;
  nbTotalPage: number;
  hasNext: boolean;
  users: Iusers[];
};

export interface GetUserCardProps {
  page: number;
  pageSize: number;
}

export interface IUserCard {
  user_id: number;
  card_company_id: number;
  login_id: string;
  login_password: string;
  card: string;
}

export interface GetTransactionsProps {
  page: number;
  pageSize: number;
}

export interface GetCardPointsProps {
  page: number;
  pageSize: number;
}

export interface ICardPoint {
  id: number;
  email: string;
  password: string;
  point: number;
  type: string;
}

export interface IPrices {
  MATIC: {
    price: number;
  };
  MSQ: {
    price: number;
    dayChgSign: string;
    dayChgRate: string;
  };
  MSQX: {
    price: number;
    dayChgSign: string;
    dayChgRate: string;
  };
  MSQXP: {
    price: number;
  };
  MSQP: {
    price: number;
  };
}

export interface IGetCardPointsResponse {
  data: [ICardPoint];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  total: any;
}

export type GetUserCardInformation = {
  email: string;
};

export type Iappconnections = {
  user_id: string;
  updatedAt: string;
  platform_id: string;
  status: string;
  user: string;
  expiration: number;
  createdAt: string;
  uuid: string;
  platform_name: string;
  platform_url: string;
  platform_logo: string;
};

export interface IAppConnection {
  result: string;
  app_connections: Iappconnections[];
}

export type GetUserAppConnectionType = {
  email: string;
};

export type INotification = {
  message: string;
  lastId: string;
  lastCreatedAt: number;
  nbTotalElements: number;
  nbElements: number;
  hasNext: boolean;
  notifications: IUserNotification[];
};

export type IUserNotification = {
  user_id: string;
  id: string;
  createdAt: string;
  data: string;
  is_sent: boolean;
  type: string;
  ip_address?: string;
};

export interface P2POrderDataFilter {
  isBuy?: string;
  is_accumulated?: string;
  dateFrom?: string;
  dateTo?: string;
  searchKey?: string;
  endDate?: string;
  startDate?: string;
}