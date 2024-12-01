interface IEducationUserInfo {
  name: string;
  user_id: string;
}

interface IEducationObj {
  user_id: string;
  file: string;
  action_by: string;
  updatedAt: string;
  status: number;
  education_round: number;
  uuid: string;
  createdAt: string;
  education_date: string;
  completed_date: string;
  disabled_date: string;
  submitted_date: string;
}

export interface IEducationHistoryItem {
  user_id: string;
  file: string;
  action_by: string;
  education_date: string;
  updatedAt: string;
  status: number;
  uuid: string;
  createdAt: string;
}

export interface IUserEducation {
  user: IEducationUserInfo;
  education: IEducationObj;
}

export interface IUpdateUserEducationReq {
  education_id: string;
  status: number;
}
