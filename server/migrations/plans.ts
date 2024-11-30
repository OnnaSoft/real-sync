import { Plan } from "&/db";
import { PlanAttributes } from "&/models/Plan";

// Function to create or update default plans
export async function ensureDefaultPlans() {
  const defaultPlans: Array<Omit<PlanAttributes, "id">> = [
    {
      code: "FREE",
      name: "Free",
      basePrice: 0,
      freeDataTransferGB: 10,
      pricePerAdditional10GB: 12,
      billingPeriod: "monthly",
      supportLevel: "community",
      apiIntegration: true,
      dedicatedAccountManager: false,
      stripePriceId: process.env.STRIPE_FREE_PRICE_ID ?? "",
    },
    {
      code: "PRO",
      name: "Pro",
      basePrice: 50,
      freeDataTransferGB: 50,
      pricePerAdditional10GB: 10,
      billingPeriod: "monthly",
      supportLevel: "email",
      apiIntegration: true,
      dedicatedAccountManager: false,
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    },
    {
      code: "BUSINESS",
      name: "Business",
      basePrice: 100,
      freeDataTransferGB: 1000,
      pricePerAdditional10GB: 8,
      billingPeriod: "monthly",
      supportLevel: "priority",
      apiIntegration: true,
      dedicatedAccountManager: true,
      stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? "",
    },
  ];

  for (const planData of defaultPlans) {
    try {
      const [plan, created] = await Plan.findOrCreate({
        where: { code: planData.code },
        defaults: planData,
      });

      if (!created) {
        await plan.update(planData);
        console.log(`Updated existing plan: ${planData.name}`);
      } else {
        console.log(`Created new plan: ${planData.name}`);
      }
    } catch (error) {
      console.error(`Error ensuring default plan ${planData.name}:`, error);
    }
  }
}