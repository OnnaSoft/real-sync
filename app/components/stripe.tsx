import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import publicData from "../../public";

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!stripePromise && publicData.STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(publicData.STRIPE_PUBLISHABLE_KEY);
  }

  if (!stripePromise) {
    return null;
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
};

// Export Stripe components and hooks
export { CardElement, useStripe, useElements };

// Re-export the Stripe type for TypeScript support
export type { Stripe } from "@stripe/stripe-js";

// Helper function to initialize Stripe (can be used in client-side code)
export const getStripe = () => {
  if (!stripePromise) {
    throw new Error(
      "Stripe has not been initialized. Make sure StripeProvider is used correctly."
    );
  }
  return stripePromise;
};
