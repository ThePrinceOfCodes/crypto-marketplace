export type AppConnectionModalRef = {
  open: () => void;
};

export type AppConnectionModalProps = {
  email: string;
  onSave?: () => void;
};
