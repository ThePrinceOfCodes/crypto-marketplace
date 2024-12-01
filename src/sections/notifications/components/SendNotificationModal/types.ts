export interface ISendNotificationModalProps {
  open: boolean;
  onOk: (notificationData: ISendNotificationModalSubmitData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

export interface ISendNotificationModalSubmitData {
  title: string;
  body: string;
  link: string;
}
