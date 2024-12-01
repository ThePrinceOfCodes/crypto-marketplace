export interface IAds {
  image: string;
  uuid?: string;
  createdAt?: string;
  text3: string;
  text2: string;
  link: string;
  text1: string;
  type: number;
}

export type IAddAdsReq = FormData;

export interface IUpdateAdsReq {
  id: string;
  adData: Partial<IAds>;
}


export type IDeleteAdsReq = {
  id: string[];
};