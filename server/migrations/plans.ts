import { PlanAttributes } from "&/models/Plan";
import { Transaction } from "sequelize";
import { Plan, sequelize } from "&/db";
import logger from "&/lib/logger";

// Validate environment variables
const requiredEnvVars = [
  "STRIPE_FREE_PRICE_ID",
  "STRIPE_PRO_PRICE_ID",
  "STRIPE_BUSINESS_PRICE_ID",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

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

  try {
    await sequelize.transaction(async (t: Transaction) => {
      for (const planData of defaultPlans) {
        const [plan, created] = await Plan.findOrCreate({
          where: { code: planData.code },
          defaults: planData,
          transaction: t,
        });

        if (!created) {
          await plan.update(planData, { transaction: t });
          logger.info(`Updated existing plan: ${planData.name}`);
        } else {
          logger.info(`Created new plan: ${planData.name}`);
        }
      }
    });

    logger.info('All default plans have been ensured successfully');
  } catch (error) {
    logger.error('Error ensuring default plans:', error);
    throw error;
  }
}