export type Info = {
  user_id: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolderName: string;
  bankStatementFile: null | FileList | string;
};

export type ViewBankChangeModalRef = {
  open: (info: Info) => void;
};
