export interface User {
  id: number;
  username: string;
  email: string;
  fullname: string;
}

export interface Plan {
  id: number;
  name: string;
  code: string;
  price: string;
}

export interface UserPlan {
  id: number;
  userId: number;
  planId: number;
  activatedAt: Date;
  cancelRequestedAt: Date | null;
  effectiveCancelDate: Date | null;
  status: "active" | "pending_cancellation" | "cancelled";
  stripeSubscriptionId: string;
  stripeSubscriptionItemId: string;
}

export interface UserPlanWithPlan extends UserPlan {
  plan: Plan;
}
