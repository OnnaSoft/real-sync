import { Plan } from "./plan";

export interface User {
  id: number;
  username: string;
  email: string;
  fullname: string;
  stripeCustomerId: string;
  userSubscription: any[]; // This is an empty array in the example, so we'll use 'any[]' for now
}

export interface CurrentPlan {
  id: number;
  userId: number;
  planId: number;
  activatedAt: string;
  cancelRequestedAt: string | null;
  effectiveCancelDate: string | null;
  status: string;
  stripeSubscriptionId: string;
  stripeSubscriptionItemId: string;
  createdAt: string;
  updatedAt: string;
  plan: Plan;
  currentUsage: {
    dataTransferGB: number;
    billingPeriodStart: string;
    billingPeriodEnd: string;
  };
}