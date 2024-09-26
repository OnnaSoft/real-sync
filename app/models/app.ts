export interface ApiKey {
  id: string;
  key: string;
  lastUsed: Date | null;
}

export interface DedicatedServerPlan {
  id: number;
  size: string;
  price: string;
  stripePriceId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface App {
  id: string;
  name: string;
  description: string;
  enableCalls: boolean;
  enableVideoCalls: boolean;
  enableConversationLogging: boolean;
  apiKeys: ApiKey[];
  dedicatedServerPlan: DedicatedServerPlan | null;
}
