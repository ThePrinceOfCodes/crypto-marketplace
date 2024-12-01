export interface INewsSaveModalProps {
  open: boolean;
  onOk: (newsData: INewsSubmitData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
  initialValues?: INewsSubmitData;
}

export interface INewsSubmitData {
  title: string;
  subtitle: string;
  date: string;
  url: string;
  imageUrl: string;
}
