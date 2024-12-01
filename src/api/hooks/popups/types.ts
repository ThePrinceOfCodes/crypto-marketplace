export interface IPopUp {
  startDate: string;
  endDate: string;
  imageUrl: string;
  uuid: string;
  createdAt: string;
  content: string;
  link: string;
  title: string;
}

export type IAddPopUpReq = FormData;

export interface IUpdatePopUpReq {
  id: string;
  formData: FormData;
}

