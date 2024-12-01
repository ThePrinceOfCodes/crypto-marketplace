export interface IBulkNotifications {
  payload: string;
  notification_sent_count: number;
  updatedAt: string;
  user_count: number;
  createdAt: string;
  id: string;
  name: string;
  title: string;
  body: string;
}

export type ISendBulkNotificationsReq = {
  title: string;
  body: string;
  link: string;
};
