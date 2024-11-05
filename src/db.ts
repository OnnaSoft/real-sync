import { Sequelize } from "sequelize";
import UserModel from "./models/User";
import PlanModel, { PlanAttributes } from "./models/Plan";
import PaymentMethodModel from "./models/PaymentMethod";
import StripeEventModel from "./models/StripeEvent";
import UserSubscriptionModel from "./models/UserSubscription";
import TunnelModel from "./models/Tunnel";

// Validate environment variables
const requiredEnvVars = [
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
  "DB_PORT",
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

// Sequelize setup
export const sequelize = new Sequelize(
  // @ts-ignore
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? "5432", 10),
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  }
);

export const User = UserModel(sequelize);
export const Plan = PlanModel(sequelize);
export const UserSubscription = UserSubscriptionModel(sequelize);
export const PaymentMethod = PaymentMethodModel(sequelize);
export const Tunnel = TunnelModel(sequelize);
export const StripeEvent = StripeEventModel(sequelize);

// Define associations
const models = {
  User,
  Plan,
  UserSubscription,
  PaymentMethod,
  Tunnel,
  StripeEvent,
};
Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

// @ts-ignore
sequelize.models = models;

// Function to create or update default plans
async function ensureDefaultPlans() {
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

// Test the connection
sequelize
  .authenticate()
  .then(() => console.log("Database connected."))
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  });

// Sync all models with database
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database & tables created!");
    return Promise.all([
      ensureDefaultPlans(),
    ]);
  })
  .then(() => {
    console.log("Default plans and dedicated server plans ensured.");
  })
  .catch((err) => {
    console.error("Unable to sync database or ensure default plans:", err);
    process.exit(1);
  });
