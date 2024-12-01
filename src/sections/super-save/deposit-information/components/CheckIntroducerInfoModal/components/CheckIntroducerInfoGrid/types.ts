import { GridRowsProp, GridValidRowModel } from "@mui/x-data-grid-pro";
import { IDepositRequest } from "api/hooks";

export interface ICheckIntroducerInfoGridProps {
  rows: GridRowsProp;
  onUpdateIntroducers?: (introducers: GridValidRowModel[]) => void;
  editMode?: boolean;
  setEditMode?: () => void;
  onEditModeChange?: (editMode: boolean) => void;
  introducerCreditInfo: IIntroducerCreditInfo;
}

export interface IIntroducerCreditInfo {
  credit_sale_permission: IDepositRequest["credit_sale_permission"];
}

export interface ICheckIntroducerInfoGridRef {
  startEditMode: () => void;
  stopEditMode: () => void;
  setRows: (newRowsWithoutEmpty: GridValidRowModel[]) => void;
}
