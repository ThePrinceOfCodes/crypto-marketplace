import { Iusers } from "api/hooks";

export type UserHistoryDetailDialogRef = {
    open: () => void;
  };
  export type UserHistoryDetailDialogProps = {
    onClose?: () => void;
    data?: Iusers;
  };
  
  export type UserHistoryDetailDialogSubmitData = {
    date: string;
  };
  