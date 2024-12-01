export interface ITxidUpdateModalProps {
  open: boolean;
  onOk: (newsData: ITxidUpdateSubmitData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialValues: ITxidUpdateSubmitData;
}

export interface ITxidUpdateSubmitData {
  refund_token: string;
  refund_amount: string;
  refund_txid: string;
  refund_reason: string;
}

export interface ITxidDataObject {
  key: string;
  value: string;
  required: boolean;
  error: null | string;
  disable: boolean;
}
