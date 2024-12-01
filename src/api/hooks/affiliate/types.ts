export interface GetAffiliateProps {
  page: number;
  pageSize: number;
}

export interface IAffiliate {
  id: number;
  email: string;
  password: string;
  point: number;
  type: string;
}

export interface IAffiliateResponse {
  data: [IAffiliate];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  total: any;
}
