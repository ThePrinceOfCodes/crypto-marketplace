export type RejectSuperSaveModalRef = {
  open: () => void;
};

export type userDataType = {
user_name: string;
user_email: string;
user_id: string
};

export type RejectSuperSaveModalProps = {
  rejectSuperSaveData: userDataType | undefined;
  onSave?: () => void;
};
