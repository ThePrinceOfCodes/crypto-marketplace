export type Info = {
  name: string;
  user_id: string;
  request_id: string;
  email: string;
};

export type PaymentApplyModalRef = {
  open: (info: Info) => void;
};