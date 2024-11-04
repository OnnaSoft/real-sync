import { Response, NextFunction } from 'express';
import { RequestWithUser } from './validateSessionToken';
import stripe from 'src/lib/stripe';
import { HttpError } from 'http-errors-enhanced';

export interface RequestWithUserAndPayment extends RequestWithUser {
  hasPaymentMethod?: boolean;
}

const addPaymentMethodInfo = async (req: RequestWithUserAndPayment, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  try {
    let hasPaymentMethod = false;
    if (req.user.stripeCustomerId) {
      const customer = await stripe.customers.retrieve(req.user.stripeCustomerId)
        .catch((error: Error) => {
          console.error("Failed to retrieve customer from Stripe", error);
          throw new HttpError(500, "Failed to retrieve customer from Stripe");
        });
      if (!customer.deleted) {
        hasPaymentMethod = customer.invoice_settings.default_payment_method !== null;
      }
    }

    req.hasPaymentMethod = hasPaymentMethod;

    next();
  } catch (error) {
    console.error('Error checking payment methods:', error);
    res.status(500).json({ error: 'Internal server error while checking payment methods' });
  }
};

export default addPaymentMethodInfo;