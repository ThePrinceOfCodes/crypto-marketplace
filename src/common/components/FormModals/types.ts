export interface FormTypesProps {
  onClose?: () => void;
  titleText?: string;
  open?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any;
  isLoading?: boolean;
  submitButtonId?: string;
  submitButtonText?: string;
  onFormSubmit?: () => void;
}
