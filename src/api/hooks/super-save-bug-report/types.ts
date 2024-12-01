export interface IBugReport {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  image: string;
  content: string;
  status: "waiting" | "completed" | "hold";
  updatedAt: string;
  createdAt: string;
}
