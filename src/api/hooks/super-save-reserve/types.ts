import { AxiosError } from "axios";
import { DatePeriodTypes } from "@common/types/dates";

export interface IUpdateReserve {
  reserveId: string;
  confirmationDate: string;
  accountNumber: string;
  bank: string;
  bankCertificateUrl: string;
  accountBalance: number;
}

export type SaveReserveVaultType = {
  confirmationDate: string;
  accountNumber: string;
  bank: string;
  bankCertificateUrl: string;
  accountBalance: number;
};

export interface IDeleteReserve {
  reserveId: string[];
}

export type IReserve = {
  accountBalance: number;
  accountNumber: string;
  bank: string;
  bankCertificateUrl: string;
  confirmationDate: string;
  createdAt: string;
  id: string;
  updatedAt: string;
  action_by: string;
};

export type IUpdateReserveLimitResponse = {
  type: string;
  amount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};
export type GetReservedLimitProp = {
  type: string;
};
export type IGetReserveLimitResponse = {
  key: string;
  value: number;
};

export type iGetReserveResp = {
  lastId: string;
  hasNext: boolean;
  reserves: IReserve[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetReserveErr = AxiosError<any>;
export type iGetReserveRsq = {
  limit?: number;
  type?: string;
  searchKey?: string;
  date_filter?: DatePeriodTypes;
  startDate?: string;
  endDate?: string;
  lastId?: string;
};
