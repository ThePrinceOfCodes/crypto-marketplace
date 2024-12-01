export type TransferModalRef = {
  open: () => void;
};

export type TransferModalProps = {
  email: string;
  onSave?: () => void;
};
