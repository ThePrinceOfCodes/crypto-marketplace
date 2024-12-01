export type Info = {
  name: string;
  user_id: string;
  request_id: string;
  email: string;
  phone: string;
  id: string;
};

export type PaymentApprovalModalRef = {
  open: (info: Info) => void;
};
