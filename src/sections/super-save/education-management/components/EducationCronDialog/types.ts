export type EducationCronDialogRef = {
  open: () => void;
};
export type EducationCronDialogProps = {
  onClose?: () => void;
  onOk: (submitData: IEducationCronDialogSubmitData) => Promise<void>;
  alert?: string;
};

export type IEducationCronDialogSubmitData = {
  date: string;
};
