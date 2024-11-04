export interface Plan {
  id: number;
  name: string;
  code: string;
  basePrice: number;
  freeDataTransferGB: number;
  pricePerAdditional10GB: number;
  billingPeriod: string;
  supportLevel: string;
  apiIntegration: boolean;
  dedicatedAccountManager: boolean;
}