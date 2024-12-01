import { ReactNode } from "react";

export type ConfirmDialogProps = {
  title: string;
  content?: string;
  okButtonText?: string;
  cancelButtonText?: string;
  onOk?: () => Promise<void>;
  onCancel?: () => void;
  contentClass?: string;
  warning?: ReactNode;
  requiredReason?:boolean;
  setReason?: React.Dispatch<React.SetStateAction<string>>;
  reasonPlaceholder?:string
};

export type AlertDialogProps = {
  title: string;
  content?: string;
  okButtonText?: string;
  onOk?: () => Promise<void>;
  onCancel?: () => void;
  type?: "warning" | "success";
};

export type DialogContextType = {
  // eslint-disable-next-line no-unused-vars
  confirmDialog: (props: ConfirmDialogProps) => void;
  // eslint-disable-next-line no-unused-vars
  alertDialog: (props: AlertDialogProps) => void;
  // eslint-disable-next-line no-unused-vars
  reason?: string;
};
