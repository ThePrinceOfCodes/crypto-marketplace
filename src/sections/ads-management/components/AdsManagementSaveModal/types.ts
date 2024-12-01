export interface IAdsManagementSaveModalProps {
  open: boolean;
  onOk: (popUpData: IAdsManagementSubmitData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
  initialValues?: IAdsManagementSubmitData;
}

export interface IAdsManagementSubmitData {
  type: number;
  text1: string;
  text2: string;
  text3: string;
  link: string;
  image?: string;
}
