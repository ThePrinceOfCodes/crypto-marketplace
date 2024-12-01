import { AxiosError } from "axios";

export interface IInquiry {
  content: string;
  createdAt: string;
  id: string;
  image_url: string;
  related_id: string;
  response_content: string;
  status: string;
  title: string;
  app_version?: string;
  type: string;
  user_email: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  response_date: string;
  response_user: string;
}

export type iGetInquiryResp = {
  lastId: string;
  hasNext: boolean;
  rows: IInquiry[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type iGetInquiryErr = AxiosError<any>;

export type iGetInquiryRsq = {
  limit?: number;
  searchKey?: string;
  startDate?: string;
  endDate?: string;
  lastId?: string;
};

export type iUseDeleteInquiry = {
  id: string[];
};

export type iUseUpdateInquiryStatus = {
  id: string;
  new_status: string;
};

export type iUseSendResponse = {
  id: string | null;
  response: string;
  push_notification: boolean;
  send_email: boolean;
};

export type iPostInquiryLogRsq = {
  content_en: string;
  content_kr: string;
  uuid?: string;
};