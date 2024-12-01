export interface PropsInterface {
  onClose?: () => void;
  renderHeader?: () => React.ReactNode;
  titleText?: string;
  open?: boolean;
  children?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  className?: string;
  fullWidth?: boolean;
}
