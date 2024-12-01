export type EducationResetDialogRef = {
  open: () => void;
};
export type EducationResetDialogProps = {
  onClose?: () => void;
  onOk: (submitData: IEducationResetDialogSubmitData) => Promise<void>;
  alert?: string;
};

export type IEducationResetDialogSubmitData = {
  date: string;
};
