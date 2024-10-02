import { CurrentPlan, User } from "./user";

export interface Profile {
  message: string;
  user: User;
  currentPlan: CurrentPlan | null;
  hasPaymentMethod: boolean;
}
