import { Sequelize } from "sequelize";
import UserModel from "./models/User.js";
import dotenv from "dotenv";
import PlanModel from "./models/Plan.js";
import UserPlanModel from "./models/UserPlan.js";

// Load environment variables
dotenv.config();

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
    port: parseInt(process.env.DB_PORT ?? "10", 10),
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  }
);

export const User = UserModel(sequelize);
export const Plan = PlanModel(sequelize);
export const UserPlan = UserPlanModel(sequelize);

// Define associations
User.hasMany(UserPlan, { foreignKey: "userId" });
UserPlan.belongsTo(User, { foreignKey: "userId" });

Plan.hasMany(UserPlan, { foreignKey: "planId" });
UserPlan.belongsTo(Plan, { foreignKey: "planId" });

// Function to create or update default plans
async function ensureDefaultPlans() {
  /**
   * @type {Array<Omit<import("./models/Plan.js").PlanAttributes, "id">>}
   */
  const defaultPlans = [
    {
      code: "BASIC",
      name: "Basic",
      price: 9.99,
      billingPeriod: "monthly",
      realTimeChat: true,
      voiceCalls: true,
      videoCalls: false,
      maxApps: 1,
      secureConnections: 1,
      supportLevel: "email",
      apiIntegration: true,
      dedicatedAccountManager: false,
    },
    {
      code: "PRO",
      name: "Pro",
      price: 19.99,
      billingPeriod: "monthly",
      realTimeChat: true,
      voiceCalls: true,
      videoCalls: true,
      maxApps: 3,
      secureConnections: 3,
      supportLevel: "priority",
      apiIntegration: true,
      dedicatedAccountManager: false,
    },
    {
      code: "ENTERPRISE",
      name: "Enterprise",
      price: 49.99,
      billingPeriod: "monthly",
      realTimeChat: true,
      voiceCalls: true,
      videoCalls: true,
      maxApps: 0, // Unlimited
      secureConnections: 0, // Unlimited
      supportLevel: "dedicated",
      apiIntegration: true,
      dedicatedAccountManager: true,
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
    return ensureDefaultPlans();
  })
  .then(() => {
    console.log("Default plans ensured.");
  })
  .catch((err) => {
    console.error("Unable to sync database or ensure default plans:", err);
    process.exit(1);
  });
