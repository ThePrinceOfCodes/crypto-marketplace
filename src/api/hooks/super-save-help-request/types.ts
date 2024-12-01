export interface IHelperService {
  user_id: string;
  updatedAt: string;
  status: "waiting" | "completed" | "hold";
  phone_number: string;
  createdAt: string;
  memo: string;
  id: string;
  email: string;
  name: string;
}
