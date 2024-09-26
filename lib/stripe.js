import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  "STRIPE_SECRET_KEY",
  "STRIPE_BASIC_PRICE_ID",
  "STRIPE_PRO_PRICE_ID",
  "STRIPE_ENTERPRISE_PRICE_ID",
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

export default stripe;
