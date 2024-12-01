export interface ITxidDeleteModalProps {
  open: boolean;
  onDelete: (txid: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  selectedTxid: string;
}

export interface ITxidDataObject {
  key: string;
  value: string;
  required: boolean;
  error: null | string;
}
