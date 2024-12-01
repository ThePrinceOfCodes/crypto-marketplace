export interface SetSuperSaveTimeProps {
  timezone: string;
  start_time: string;
  end_time: string;
}

export interface ISuperSaveTimeResponse {
  result: string;
}

export interface SetSuperSaveBankProps {
  fee: number;
  usdt: number;
}

export interface ISuperSaveBankFee {
  result: string;
}

export interface SetSuperSaveNotificationTimeProps {
  timezone: string;
  set_time: string;
  is_instantly: boolean;
}

export interface ISuperSaveNotificationTimeResponse {
  result: string;
}

export interface ISuperSaveTimeHistory {
  is_applied: boolean;
  action_by: string;
  timestamp: string;
  timezone: string;
  start_time: string;
  end_time: string;
  id: string;
}

export interface IMsqStandardAmountHistory {
  is_applied: boolean;
  action_by: string;
  timestamp: string;
  msq_standard_amount: number;
  msqx_standard_amount: number;
  sut_standard_amount: number;
  id: string;
  name: string;
}

export interface ISuperSaveAmountHistory {
  is_applied: boolean;
  action_by: string;
  timestamp: string;
  super_save_amount: number;
  super_save_discount: number;
  msqx_super_save_amount: number;
  msqx_super_save_discount: number;
  sut_super_save_amount: number;
  sut_super_save_discount: number;
  p2u_super_trust_amount: number;
  super_trust_amount: number;
  super_trust_discount: number;
  msqx_super_trust_amount: number;
  msqx_super_trust_discount: number;
  sut_super_trust_amount: number;
  sut_super_trust_discount: number;
  super_trust_ratio: number;
  msqx_super_trust_ratio: number;
  sut_super_trust_ratio: number;
  credit_sale_amount: number;
  credit_sale_discount: number;
  msqx_credit_sale_amount: number;
  msqx_credit_sale_discount: number;
  sut_credit_sale_amount: number;
  sut_credit_sale_discount: number;
  id: string;
}

export interface ISuperSaveBankFeeHistory {
  is_applied: boolean;
  action_by: string;
  timestamp: string;
  bank_fee: number;
  usdt_charge: number;
  id: string;
}

export interface ISuperSaveNotificationTime {
  is_applied: boolean;
  action_by: string;
  timestamp: string;
  timezone: string;
  set_time: string;
  is_instantly: boolean;
  id: string;
}

export interface ISuperSaveNotificationTimeHistory {
  is_applied: boolean;
  action_by: string;
  timestamp: string;
  timezone: string;
  set_time: string;
  is_instantly: boolean;
  id: string;
}

export interface ISuperSaveTime {
  is_applied: boolean;
  action_by: string;
  timestamp: string;
  timezone: string;
  start_time: string;
  end_time: string;
  id: string;
}

export interface ISetSuperSaveTimeResponse {
  result: string;
}
