import { Sequelize } from "sequelize";
import UserModel from "&/models/User";
import PlanModel from "&/models/Plan";
import PaymentMethodModel from "&/models/PaymentMethod";
import StripeEventModel from "&/models/StripeEvent";
import UserSubscriptionModel from "&/models/UserSubscription";
import TunnelModel from "&/models/Tunnel";
import TunnelConsumptionModel from "&/models/TunnelConsumption";
import { ensureDefaultPlans } from "&/migrations/plans";
import UserActivityModel from "./models/UserActivity";

// Validate environment variables
const requiredEnvVars = [
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
  "DB_PORT",
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
export const TunnelConsumption = TunnelConsumptionModel(sequelize);
export const UserActivity = UserActivityModel(sequelize);

// Define associations
const models = {
  User,
  Plan,
  UserSubscription,
  PaymentMethod,
  Tunnel,
  StripeEvent,
  TunnelConsumption,
  UserActivity,
};
Object.values(models)
  .forEach((model) => ('associate' in model) && model.associate(models));

// @ts-ignore
sequelize.models = models;



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
