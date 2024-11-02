export interface User {
  id: number;
  username: string;
  email: string;
  fullname: string;
  stripeCustomerId?: string;
  userSubscriptions: UserSubscription[];
}

export interface Plan {
  id: number;
  name: string;
  code: string;
  price: number;
  billingPeriod: string;
  realTimeChat: boolean;
  voiceCalls: boolean;
  videoCalls: boolean;
  maxApps: number;
  secureConnections: number;
  supportLevel: string;
  apiIntegration: boolean;
  dedicatedAccountManager: boolean;
  stripePriceId: string | null;
}

export interface UserSubscription {
  id: number;
  userId: number;
  activatedAt: Date;
  cancelRequestedAt: Date | null;
  effectiveCancelDate: Date | null;
  status: "active" | "pending_cancellation" | "cancelled";
  stripeSubscriptionId: string;
  stripeSubscriptionItemId: string;
  plan: Plan;
}

export interface UserSubscriptionWithPlan extends UserSubscription {
  plan: Plan;
}

export interface App {
  id: number;
  name: string;
  description: string;
  enableCalls: boolean;
  enableVideoCalls: boolean;
  enableConversationLogging: boolean;
  userId: number;
  dedicatedServerPlanId: number | null;
  apiKeys: ApiKey[];
  dedicatedServerPlan: DedicatedServerPlan | null;
}

export interface ApiKey {
  id: number;
  key: string;
  appId: number;
}

export interface DedicatedServerPlan {
  id: number;
  size: string;
  description: string;
  price: number;
  stripePriceId: string;
}

export interface PaymentMethod {
  id: number;
  userId: number;
  type: string;
  last4: string;
  expirationMonth: number;
  expirationYear: number;
  isDefault: boolean;
  stripePaymentMethodId: string;
}
