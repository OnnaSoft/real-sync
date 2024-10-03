import { Sequelize } from "sequelize";
import UserModel from "./models/User.js";
import PlanModel from "./models/Plan.js";
import PaymentMethodModel from "./models/PaymentMethod.js";
import AppModel from "./models/App.js";
import ApiKeyModel from "./models/ApiKey.js";
import DedicatedServerPlanModel from "./models/DedicatedServerPlan.js";
import StripeEventModel from "./models/StripeEvent.js";
import UserSubscriptionModel from "./models/UserSubscription.js";

// Validate environment variables
const requiredEnvVars = [
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
  "DB_PORT",
  "STRIPE_FREE_PRICE_ID",
  "STRIPE_BASIC_PRICE_ID",
  "STRIPE_BUSINESS_PRICE_ID",
  "STRIPE_SMALL_APP_SERVER_PRICE_ID",
  "STRIPE_MEDIUM_APP_SERVER_PRICE_ID",
  "STRIPE_LARGE_APP_SERVER_PRICE_ID",
  "STRIPE_XLARGE_APP_SERVER_PRICE_ID",
  "STRIPE_XXLARGE_APP_SERVER_PRICE_ID",
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
export const DedicatedServerPlan = DedicatedServerPlanModel(sequelize);
export const App = AppModel(sequelize);
export const ApiKey = ApiKeyModel(sequelize);
export const StripeEvent = StripeEventModel(sequelize);

// Define associations
/** @type {{ [x:string]: import("sequelize").ModelStatic<import("sequelize").Model> & { associate: (models: any) => void } }} */
const models = {
  User,
  Plan,
  UserSubscription,
  PaymentMethod,
  DedicatedServerPlan,
  App,
  ApiKey,
  StripeEvent,
};
Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

// @ts-ignore
sequelize.models = models;

// Function to create or update default plans
async function ensureDefaultPlans() {
  /**
   * @type {Array<Omit<import("./models/Plan.js").PlanAttributes, "id">>}
   */
  const defaultPlans = [
    {
      code: "FREE",
      name: "Free",
      price: 0,
      billingPeriod: "monthly",
      realTimeChat: true,
      voiceCalls: false,
      videoCalls: false,
      maxApps: 1,
      secureConnections: 1,
      supportLevel: "community",
      apiIntegration: true,
      dedicatedAccountManager: false,
      stripePriceId: process.env.STRIPE_FREE_PRICE_ID ?? "",
    },
    {
      code: "BASIC",
      name: "Basic",
      price: 20,
      billingPeriod: "monthly",
      realTimeChat: true,
      voiceCalls: true,
      videoCalls: false,
      maxApps: 3,
      secureConnections: 3,
      supportLevel: "email",
      apiIntegration: true,
      dedicatedAccountManager: false,
      stripePriceId: process.env.STRIPE_BASIC_PRICE_ID ?? "",
    },
    {
      code: "BUSINESS",
      name: "Business",
      price: 50,
      billingPeriod: "monthly",
      realTimeChat: true,
      voiceCalls: true,
      videoCalls: true,
      maxApps: 0, // Unlimited
      secureConnections: 0, // Unlimited
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

// Function to create or update default dedicated server plans
async function ensureDefaultDedicatedServerPlans() {
  /**
   * @type {Array<Omit<import("./models/DedicatedServerPlan.js").DedicatedServerPlanAttributes, "id">>}
   */
  const defaultDedicatedServerPlans = [
    {
      size: "Small",
      price: 20,
      stripePriceId: process.env.STRIPE_SMALL_APP_SERVER_PRICE_ID ?? "",
      description: "Small dedicated server for basic app needs",
    },
    {
      size: "Medium",
      price: 50,
      stripePriceId: process.env.STRIPE_MEDIUM_APP_SERVER_PRICE_ID ?? "",
      description: "Medium dedicated server for growing app applications",
    },
    {
      size: "Large",
      price: 100,
      stripePriceId: process.env.STRIPE_LARGE_APP_SERVER_PRICE_ID ?? "",
      description:
        "Large dedicated server for high-performance app applications",
    },
    {
      size: "XLarge",
      price: 250,
      stripePriceId: process.env.STRIPE_XLARGE_APP_SERVER_PRICE_ID ?? "",
      description: "Extra large dedicated server for demanding app workloads",
    },
    {
      size: "XXLarge",
      price: 500,
      stripePriceId: process.env.STRIPE_XXLARGE_APP_SERVER_PRICE_ID ?? "",
      description:
        "Double extra large dedicated server for enterprise-level app applications",
    },
  ];

  for (const planData of defaultDedicatedServerPlans) {
    try {
      const [plan, created] = await DedicatedServerPlan.findOrCreate({
        where: { size: planData.size },
        defaults: planData,
      });

      if (!created) {
        await plan.update(planData);
        console.log(`Updated existing dedicated server plan: ${planData.size}`);
      } else {
        console.log(`Created new dedicated server plan: ${planData.size}`);
      }
    } catch (error) {
      console.error(
        `Error ensuring default dedicated server plan ${planData.size}:`,
        error
      );
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
      ensureDefaultDedicatedServerPlans(),
    ]);
  })
  .then(() => {
    console.log("Default plans and dedicated server plans ensured.");
  })
  .catch((err) => {
    console.error("Unable to sync database or ensure default plans:", err);
    process.exit(1);
  });
