import { DatePeriodTypes } from "@common/types/dates";
import { CustomGridFilterItem } from "@common/types/muiGrid";
import { GridFilterItem } from "@mui/x-data-grid";
import { AxiosError, AxiosResponse } from "axios";

export type UpdateSuperSaveWidgetSettingType = {
  widget_number: number;
  status: number;
};

export type UpdateSuperTrustStatus = {
  user_id: string;
  status: number;
};

export type SupersaveRestriction = {
  user_id: string;
  user_email: string;
  user_name: string;
  status: boolean;
};
export type RejectSuperUserType = {
  request_id: string;
  remark: string;
  usdtAction?: boolean;
};

export type ApproveSuperUserType = {
  request_id: string;
  usdtAction?: boolean;
};

export type IDailyCalculationUser = {
  user_id: string;
  super_save_request_id: string;
  payout_date: string;
  updatedAt: string;
  daily_payout: number;
  createdAt: string;
  cumulative_payment: number;
  uuid: string;
  week_history_id: string;
  name: string;
  email: string;
  payment_currency: string;
};

export interface IDepositRequest {
  action_by: string;
  payment_method: string;
  end_date: string;
  registration_number: string;
  desosit_amout_in_msq: number;
  payment_period: number;
  status: number;
  total_payout_amount: number;
  name: string;
  profile_image: string;
  payment_rate: number;
  id_image: string;
  identity_type: string;
  birth_date: string;
  nationality: string;
  action_date: string;
  createdAt: string;
  deposit_amout_in_won: number;
  daily_payout_amount: number;
  remark: string;
  user_id: string;
  deposit_transaction_id: string;
  deposit_transaction_id_usdt?: string;
  start_date: string;
  updatedAt: string;
  phone_number: string;
  uuid: string;
  email: string;
  exchange_standard: string;
  msq_amount: string;
  msq_discount: string;
  deposit_token: string;
  super_trust_status: number;
  cash_transfer_capture: string;
  coin_transfer_capture: string;
  credit_sale_permission: number | null;
  community_permission: number | null;
  blockchain_result?: string;
  super_save_count: number | null;
  introducer_info: string | null;
  created_by: string | null;
}

export interface IGetDepositRequestsResponse {
  message: string;
  lastId: string;
  nbElements: number;
  nbTotalElements: number;
  hasNext: boolean;
  nbTotalPage: number;
  users: IDepositRequest[];
  totalParticipationAmount: number;
  totalParticipationAmountInKrw: number;
  totalParticipationAmountInUsdt: number;
  totalNumberOfParticipation: number;
  totalTodayParticipation: number;
  totalPaidAmountInKrw: number;
  totalPaidAmountInUsdt: number
}

export interface ICheckTxidOnBlockchainResponse {
  status: boolean;
  message: string;
}

export interface ICheckBulkTxidOnBlockChainResult {
  code: number;
  message: string;
  request_id: string;
  status: boolean;
}
export interface ICheckBulkTxidOnBlockchainResponse {
  result: boolean;
  data: ICheckBulkTxidOnBlockChainResult[];
}

export interface ISearchSuperSaveRequestByPhoneNumberResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  code: number;
}

export type SearchSuperSaveRequestByPhoneNumberRequestsType = {
  phoneNumber: string;
};

export interface IeCheckUserReferralCodeByAdminResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  code: number;
}

export type eCheckUserReferralCodeByAdminRequestsType = {
  referral_code: string;
};



export type GetDepositRequestsType = {
  user_id?: string;
  limit?: number;
  searchKey?: string;
  date_filter?: DatePeriodTypes;
  from_date?: string;
  to_date?: string;
  page?: number;
  lastId?: number;
  status?: number;
  type?: string;
  search_by?: CustomGridFilterItem[];
  filter_condition?: string;
  sort_type?: string | string[];
  sort_column_name?: string | string[];
  community?: string;
  credit_sale_permission?: string[];
};

export type CheckTxidOnBlockchainRequestsType = {
  request_id: string;
};

export type CheckBulkTxidOnBlockchainRequestsType = {
  request_ids: string[];
};

export interface IWithdrawal {
  unique_id: string;
  bank_account_number: string;
  completed_week_days: number;
  week_started_date: string;
  week_no: number;
  bank_name: string;
  user_id: string;
  super_save_request_id: string;
  uuid: string;
  is_paid: boolean;
  week_end_date: string;
  user_name: string;
  user_email: string;
  payment_period: number;
  total_payout_amount: number;
  daily_payout_amount: number;
  payment_count_around: string;
  payment_count_around_in_days: string;
  weekly_payout_amount: number;
  total_week_days: number;
  action_date?: string;
  action_by?: string;
  super_save_end_date: string;
  super_save_start_date: string;
  rest_of_days: number;
  bank_code: string;
  user_phone_number: number;
  bank_fee: number;
}

export interface IGetCommitmentReferralResult {
  id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_phone: string;
  to_user_name: string;
  updatedAt: string;
  createdAt: string;
  referral_code: number;
  percentage: number;
}

export interface IGetMassWithdrawalsRequestResponse {
  message: string;
  lastId: string;
  nbElements: number;
  nbTotalElements: number;
  hasNext: boolean;
  nbTotalPage: number;
  withdrawals: IWithdrawal[];
}

export type GetWithdrawalsType = {
  user_id?: string;
  limit?: number;
  searchKey?: string;
  date_filter?: DatePeriodTypes;
  startDate?: string;
  endDate?: string;
  lastId?: string;
  page?: number;
  sort_column_name?: string;
  sort_type?: "asc" | "desc";
  transaction_id?: string;
};

export type GetWithdrawalRequestsType = {
  searchKey?: string;
  date_filter?: DatePeriodTypes;
  startDate?: string;
  endDate?: string;
  page?: number;
  lastId?: number;
  status?: number;
  type?: string;
};

export interface IUserConsent {
  date_of_consent: string;
  name_of_consent: string;
}

export type UserAirdropHistory = {
  createdAt: string;
  email: string;
  phone: string;
  status: number;
};

export type IUserAirdropHistoryRes = {
  result: string;
  fetchAirdropHistory: UserAirdropHistory[];
};

export type IUserSuperTrustHistoryRes = {
  message: string;
  userTrustHistory: UserSuperTrustHistory[];
};

export type UserSuperTrustHistory = {
  user_id: string;
  updatedAt: string;
  status: number;
  createdAt: string;
  uuid: string;
  disable_action_by: string;
  disable_action_date: string;
  enable_action_by: string;
  enable_action_date: string;
};

export type OwnershipTransfer = {
  action_by: string;
  action_date: string;
  contract_file: string;
  createdAt: string;
  from_user_id: string;
  remark: string;
  request_id: string;
  status: 0 | 1 | 2;
  to_user_id: string;
  updatedAt: string;
  uuid: string;
};

export type UserInheritor = {
  name: string;
  registration_number: number;
  phone_number: number;
  bank_name: string;
  status: 0 | 1 | 2;
  bank_account_number: number;
};

export type IUserTransferOwnershipHistoryRes = {
  message: string;
  transferResult: OwnershipTransfer[];
};

export type IUserInheritorsRes = {
  message: string;
  inheritors: UserInheritor[];
};
export type IUserInheritorsParams =  {
  user_id: string | undefined;
  all: boolean;
};

export interface ISuperUser {
  id: string;
  approval_date: string;
  offChainAddress: string;
  email: string;
  user_name: string;
  community: string;
  community_type: number;
  userSignUpDate: string;
  userUpdatedDate: string;
  userUpdatedBy: string;
  member_status: number;
  status: number;
  usdt_status: number;
  bank_account_number?: string;
  payment_method?: string;
  end_date?: string;
  registration_number?: string;
  payment_period?: number;
  desosit_amout_in_msq?: number;
  total_payout_amount?: number;
  bank_name?: string;
  name?: string;
  profile_image?: string;
  payment_rate?: number;
  id_image?: string;
  identity_type?: string;
  birth_date?: string;
  nationality?: string;
  createdAt?: string;
  deposit_amout_in_won?: number;
  remark?: string;
  daily_payout_amount?: number;
  user_id?: string;
  start_date?: string;
  deposit_transaction_id?: string;
  updatedAt?: string;
  phone_number?: string;
  uuid?: string;
  onChainAddress?: string;
  action_date?: string;
  withdrawal_request_id?: string;
  member_type?: string;
  airdrop_status?: number;
  corporate_email?: string;
  corporate_name?: string;
  business_registration_number?: string;
  business_registration_file?: string;
  bank_statement_file?: string;
  bank_account_holder_name?: string;
  super_trust_status?: number;
}

export interface IGetSuperUsersResponse {
  message: string;
  lastId: string;
  nbElements: number;
  nbTotalElements: number;
  hasNext: boolean;
  nbTotalPage: number;
  users: ISuperUser[];
}

export type GetSuperUsersType = {
  limit?: number;
  searchKey?: string;
  date_filter?: DatePeriodTypes;
  from_date?: string;
  to_date?: string;
  page?: number;
  lastId?: number;
  status?: number;
  usdt_status?: number;
  member_type?: string;
  super_trust_status?: number;
  super_save_restriction?: number;
  super_save_community?: string;
};

export type GetUserDetailType = {
  email?: string;
  name?: string;
  phone_number?: string;
};

export type typeBankRequestChange = {
  bank_name: string;
  bank_account_number: string;
  bank_account_holder_name: string;
  bank_statement_file: string;
};

export interface ISuperUserDetail {
  offChainAddress: string;
  onChainAddress: string;
  signUpDate: string;
  userUpdatedBy: string;
  userUpdatedDate: string;
  email: string;
  phone: string;
  id: string;
  msq_name: string;
  member_status: number;
  status: string | number;
  payment_method?: string;
  end_date?: string;
  registration_number?: string;
  payment_period?: number;
  desosit_amout_in_msq?: number;
  total_payout_amount?: number;
  name?: string;
  profile_image?: string;
  payment_rate?: number;
  id_image?: string;
  identity_type?: string;
  birth_date?: string;
  nationality?: string;
  createdAt?: string;
  deposit_amout_in_won?: number;
  remark?: string;
  wallet_type: string;
  wallet_id: string;
  daily_payout_amount?: number;
  user_id?: string;
  deposit_transaction_id?: string;
  start_date?: string;
  updatedAt?: string;
  phone_number?: string;
  uuid?: string;
  user_name?: string;
  airdrop_status?: number;
  bank_account_number?: string;
  bank_name?: string;
  withdrawal_action_date: string;
  action_date: string;
  usdt_status: string | number;
  usdt_phone_number?: string;
  usdt_action_date?: string;
  usdt_action_by?: string;
  usdt_remark?: string;
  usdt_verification_date?: string;
  usdt_uuid?: string;
  usdt_name?: string;
  usdt_birth_date?: string;
  usdt_nationality?: string;
  usdt_ekyc_data?: string;
  usdt_ekyc_result?: string;
  total_deposit_amount_in_won?: number;
  total_remaining_balance_in_won?:number;
  total_deposit_amount_in_usdt?: number;
  total_remaining_balance_in_usdt?: number;
  bank_account_holder_name?: string;
  member_type?: string;
  corporate_email?: string;
  corporate_name?: string;
  business_registration_number?: string;
  business_registration_file?: string;
  bank_statement_file?: string;
  bank_change_request?: typeBankRequestChange;
  super_trust_status?: number;
  family_relationship_file?: null | string;
  commitment_file?: null | string;
  community: string;
  community_type: number;
  referral_code?: number;
  ekyc_data?: string;
  face_recognition?: number;
  super_save_restriction?: string;
}

export interface IWidgetSettings {
  widget1: number;
  widget2: number;
  widget3: number;
  widget4: number;
}

export interface IGetWithdrawalsResponse {
  message: string;
  lastId: string;
  nbElements: number;
  nbTotalElements: number;
  hasNext: boolean;
  nbTotalPage: number;
  withdrawals: IWithdrawal[];
}

export type IGetMassWithdrawalsResponse = {
  withdrawals: IWithdrawal[];
};
export type IGetUserCommitmentInfoRes = {
  referralResult: IGetCommitmentReferralResult[];
};
export type IGetUserReferralInfoRes = {
  referralResult: IGetCommitmentReferralResult[];
};

export type IGetCommunityListRes = {
  communityListData: any[];
  hasNext: boolean;
  lastId: string;
};

export type IPostUpdateUserCommunityRes = AxiosResponse<{
  result: string;
}>;

export type IPostUpdateUserCommunityErr = AxiosError<{
  success?: boolean;
  message?: string;
  result?: string;
}>;
export interface IPostUpdateUserCommunityRsq {
  user_id: string | undefined;
  community: string;
  memo: string;
}

export interface CommunityProp {
  user_id: string;
  action_by: string;
  action_date: string;
  updatedAt: string;
  created_by: string;
  uuid: string;
  createdAt: string;
  old_community: string;
  new_community: string;
}

export interface IGetUserCommunitiesRes {
  result: string;
  hasNext: boolean;
  nbTotalElements: number;
  dataList: CommunityProp[];
  lastId?: string;
  createdAt?: string;
}

export interface IGetUserCommunitiesRsq {
  user_id?: string;
  lastId?: string;
  limit?: number;
  createdAt?: string;
}

export type IPostDepositTransactionIDResp = AxiosResponse<{
  result: string;
}>;

export type IPostDepositTransactionIDErr = AxiosError<{
  success?: boolean;
  message?: string;
  result?: string;
}>;

export interface IPostDepositTransactionIDRsq {
  request_id: string;
  deposit_transaction_id?: string;
  deposit_transaction_id_usdt?: string;
}

export type IPostUpdateUserDocumentByAdminResp = AxiosResponse<{
  result: string;
}>;

export type IPostUpdateUserDocumentByAdminErr = AxiosError<{
  success?: boolean;
  message?: string;
  result?: string;
}>;

export interface IPostUpdateUserDocumentByAdminRsq {
  family_relationship_document?: string;
  business_registration_file?: string;
  bank_statement_file?: string;
  commitment_file?: string;
  userId: string;
}

export type ITransferOwnershipDepositRequestResp = {
  result: string;
};

export type ITransferOwnershipDepositRequestErr = AxiosError<{
  success?: boolean;
  message?: string;
  result?: string;
}>;

export interface ITransferOwnershipDepositRequestRsq {
  request_id: string;
  email: string;
  file: File | null;
}

export interface IRejectTransferOwnershipRequestRes {
  result: string;
}

export type IRejectTransferOwnershipRequestErr = AxiosError<{
  success?: boolean;
  message?: string;
  result?: string;
}>;

export interface IRejectTransferOwnershipRequestRsq {
  transfer_id: string;
  remark: string;
}

export interface IUpdateIntroducerInfoRequestRes {
  result: string;
}

export type IUpdateIntroducerInfoRequestErr = AxiosError<{
  result?: string;
}>;

export interface IUpdateIntroducerInfoRequestRsq {
  request_id: string;
  introducer_info_name: string[];
  introducer_info_phone: string[];
  introduction_info_type: string[];
  introduction_info_percentage: string[];
  introducer_super_save_request_id: string[];
  introduction_info_referral_code: string[];
}

export type IApproveTransferOwnershipRequestResp = {
  result: string;
};

export type IApproveTransferOwnershipRequestErr = AxiosError<{
  success?: boolean;
  message?: string;
  result?: string;
}>;

export interface IApproveTransferOwnershipRequestRsq {
  transfer_id: string;
  file: File | null;
}

export interface IGetSuperSaveCommunityRewardResponse {
  community: string;
  community_reward: number;
  overall_community_reward: number;
  result: string;
  total_reward: number;
}
