export type TransferOwnerShipModalState = {
  open: boolean;
  requestId: string;
};

export type TransferOwnerShipModal = TransferOwnerShipModalState & {
  handleClose: () => void;
  handleSubmit: () => void;
};
