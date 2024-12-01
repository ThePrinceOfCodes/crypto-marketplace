export type WithdrawalModalRef = {
  open: () => void;
};

export type WithdrawModalProps = {
  email?: string;
  onSave?: () => void;
};
