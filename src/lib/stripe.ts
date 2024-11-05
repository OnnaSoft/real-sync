import Stripe from 'stripe';
import dotenv from 'dotenv';
import { CustomHttpClient } from '@onna-soft/stripe-bun';

dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  "STRIPE_SECRET_KEY",
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

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in the environment variables");
}

// Ejemplo de uso con Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-10-28.acacia',
  httpClient: new CustomHttpClient(),
});

export default stripe;