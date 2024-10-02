import express from "express";
import Stripe from "stripe";
import { User, Plan, sequelize, StripeEvent } from "../db.js";
import stripe from "../lib/stripe.js";
import { HttpError } from "http-errors-enhanced";

const router = express.Router();

const requiredEnvVars = ["STRIPE_WEBHOOK_SECRET"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

router.post(
  "/",
  express.raw({ type: "application/json" }),
  /**
   * POST /stripe-webhook
   * @param {express.Request} req
   * @param {express.Response<{received: boolean}>} res
   * @param {express.NextFunction} next
   */
  async (req, res, next) => {
    const sig = req.headers["stripe-signature"]?.toString() || "";

    /** @type {Stripe.Event} */
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (error) {
      /** @type {Error} */
      // @ts-ignore
      const err = error;
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      throw new HttpError("Webhook signature verification failed", {
        errors: {
          server: { message: "Webhook signature verification failed" },
        },
      });
    }

    // Handle the event
    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object;
          await handleSubscriptionChange(subscription);
          break;
        case "invoice.payment_succeeded":
          const invoice = event.data.object;
          await handleInvoicePaymentSucceeded(invoice);
          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error) {
      console.error(`Error processing webhook: ${error}`);
      next(error);
    }
  }
);

/**
 * Handle subscription changes
 * @param {Stripe.Subscription} subscription
 */
async function handleSubscriptionChange(subscription) {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findOne({
      where: { stripeCustomerId: subscription.customer.toString() },
      transaction,
    });

    if (!user) {
      throw new Error(
        `No user found for Stripe customer ID: ${subscription.customer}`
      );
    }

    const plan = await Plan.findOne({
      where: { stripePriceId: subscription.items.data[0].price.id },
      transaction,
    });

    if (!plan) {
      throw new Error(
        `No plan found for Stripe price ID: ${subscription.items.data[0].price.id}`
      );
    }

    const isActive = subscription.status === "active";
    const isPendingCancel =
      subscription.status === "canceled" && subscription.cancel_at_period_end;
    const isCanceled = subscription.status === "canceled";
    /**
     * @type {"active" | "inactive" | "pending_cancellation" | "cancelled"}
     */
    let status = "inactive";
    if (isActive) status = "active";
    if (isPendingCancel) status = "pending_cancellation";
    if (isCanceled) status = "cancelled";

    const effectiveCancelDate = isPendingCancel
      ? new Date(subscription.current_period_end * 1000)
      : null;

    /*
    await UserPlan.create(
      {
        userId: user.getDataValue("id"),
        planId: plan.getDataValue("id"),
        status,
        stripeSubscriptionId: subscription.id,
        stripeSubscriptionItemId: subscription.items.data[0].id,
        effectiveCancelDate,
        activatedAt: new Date(),
      },
      { transaction }
    );*/

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Handle successful invoice payment
 * @param {import('stripe').Stripe.Invoice} invoice
 */
async function handleInvoicePaymentSucceeded(invoice) {
  console.log(`Payment succeeded for invoice: ${invoice.id}`);
  if (
    !invoice.customer ||
    typeof invoice.customer === "string" ||
    invoice.customer.deleted
  ) {
    return;
  }
  try {
    await StripeEvent.create({
      id: invoice.id,
      object: invoice.object,
      accountCountry: invoice.account_country,
      accountName: invoice.account_name,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      amountRemaining: invoice.amount_remaining,
      attemptCount: invoice.attempt_count,
      attempted: invoice.attempted,
      autoAdvance: invoice.auto_advance,
      billingReason: invoice.billing_reason,
      collectionMethod: invoice.collection_method,
      created: invoice.created,
      currency: invoice.currency,
      customerId: invoice.customer.id,
      customerEmail: invoice.customer.email,
      customerName: invoice.customer.name,
      description: invoice.description,
      dueDate: invoice.due_date,
      effectiveAt: invoice.effective_at,
      endingBalance: invoice.ending_balance,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      number: invoice.number,
      paid: invoice.paid,
      periodEnd: invoice.period_end,
      periodStart: invoice.period_start,
      status: invoice.status,
      subscription:
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      webhooksDeliveredAt: invoice.webhooks_delivered_at,
    });

    console.log(`Payment succeeded for invoice: ${invoice.id}`);
    console.log(`Invoice data saved to database`);
  } catch (error) {
    console.error(`Error saving invoice ${invoice.id} to database:`, error);
    // Depending on your error handling strategy, you might want to throw the error here
    // throw error;
  }
}

export default router;
