export interface IPopUpSaveModalProps {
  open: boolean;
  onOk: (popUpData: IPopUpSubmitData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
  initialValues?: IPopUpSubmitData;
}

export interface IPopUpSubmitData {
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  link: string;
  image?: any;
}  

