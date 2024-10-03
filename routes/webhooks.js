import express from "express";
import Stripe from "stripe";
import { User, Plan, sequelize, StripeEvent, UserSubscription } from "../db.js";
import stripe from "../lib/stripe.js";
import { HttpError } from "http-errors-enhanced";
import { Transaction } from "sequelize";

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
          await handleSubscriptionCreated(event);
          break;
        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event);
          break;
        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event);
          break;
        case "invoice.payment_succeeded":
          await handleInvoicePaymentSucceeded(event);
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
 *
 * @param {import('stripe').Stripe.CustomerSubscriptionCreatedEvent} event
 */
async function handleSubscriptionCreated(event) {
  /** @type {Transaction|null} */
  let transaction = null;
  try {
    transaction = await sequelize.transaction().catch(() => {
      throw new HttpError(500, "Error starting database transaction");
    });

    await registerEvent(transaction, event);

    const userSubscription = await UserSubscription.findOne({
      where: { stripeSubscriptionId: event.data.object.id },
      transaction,
    }).catch(() => {
      throw new HttpError(500, "Error finding user subscription");
    });

    if (!userSubscription) {
      throw new HttpError(404, "User subscription not found");
    }

    userSubscription
      .update(
        {
          status: "active",
          activatedAt: new Date(),
        },
        { transaction }
      )
      .catch((error) => {
        throw new HttpError(500, "Error updating user subscription", {
          errors: {
            server: { message: error.message },
          },
        });
      });

    await transaction.commit().catch((error) => {
      if (error.name === "SequelizeUniqueConstraintError") {
        return;
      }
    });
  } catch (error) {
    if (transaction) {
      transaction.rollback().catch(() => {
        throw new HttpError(500, "Error rolling back database transaction");
      });
    }
    throw error;
  }
}

/**
 *
 * @param {import('stripe').Stripe.CustomerSubscriptionUpdatedEvent} event
 */
async function handleSubscriptionUpdated(event) {
  /** @type {Transaction|null} */
  let transaction = null;
  try {
    transaction = await sequelize.transaction().catch(() => {
      throw new HttpError(500, "Error starting database transaction");
    });

    await registerEvent(transaction, event);

    const userSubscription = await UserSubscription.findOne({
      where: { stripeSubscriptionId: event.data.object.id },
      transaction,
    }).catch(() => {
      throw new HttpError(500, "Error finding user subscription");
    });

    if (!userSubscription) {
      throw new HttpError(404, "User subscription not found");
    }

    const subscriptionStatus = event.data.object.status;

    /** @type { "active" | "pending_cancellation" | "inactive" | "cancelled" } */
    let status = "active";
    if (subscriptionStatus === "active") status = "active";
    else if (subscriptionStatus === "trialing") status = "active";
    else if (subscriptionStatus === "canceled") status = "cancelled";
    else if (subscriptionStatus === "incomplete_expired") status = "inactive";
    else if (subscriptionStatus === "past_due") status = "inactive";
    else if (subscriptionStatus === "unpaid") status = "inactive";
    else if (subscriptionStatus === "paused") status = "inactive";
    else if (subscriptionStatus === "incomplete")
      status = "pending_cancellation";
    const effectiveCancelDate =
      status === "pending_cancellation"
        ? event.data.object.canceled_at
        : undefined;

    userSubscription
      .update(
        {
          status,
          activatedAt: status === "active" ? new Date() : undefined,
          effectiveCancelDate: effectiveCancelDate
            ? new Date(effectiveCancelDate)
            : undefined,
        },
        { transaction }
      )
      .catch((error) => {
        throw new HttpError(500, "Error updating user subscription", {
          errors: {
            server: { message: error.message },
          },
        });
      });

    await transaction.commit().catch((error) => {
      if (error.name === "SequelizeUniqueConstraintError") {
        return;
      }
    });
  } catch (error) {
    if (transaction) {
      transaction.rollback().catch(() => {
        throw new HttpError(500, "Error rolling back database transaction");
      });
    }
    throw error;
  }
}

/**
 *
 * @param {import('stripe').Stripe.CustomerSubscriptionDeletedEvent} event
 */
async function handleSubscriptionDeleted(event) {
  /** @type {Transaction|null} */
  let transaction = null;
  try {
    transaction = await sequelize.transaction().catch(() => {
      throw new HttpError(500, "Error starting database transaction");
    });

    await registerEvent(transaction, event);

    const userSubscription = await UserSubscription.findOne({
      where: { stripeSubscriptionId: event.data.object.id },
      transaction,
    }).catch(() => {
      throw new HttpError(500, "Error finding user subscription");
    });

    if (!userSubscription) {
      throw new HttpError(404, "User subscription not found");
    }

    userSubscription
      .update(
        {
          status: "cancelled",
          effectiveCancelDate: new Date(),
        },
        { transaction }
      )
      .catch(() => {
        throw new HttpError(500, "Error updating user subscription");
      });

    await transaction.commit().catch((error) => {
      if (error.name === "SequelizeUniqueConstraintError") {
        return;
      }
    });
  } catch (error) {
    if (transaction) {
      transaction.rollback().catch(() => {
        throw new HttpError(500, "Error rolling back database transaction");
      });
    }
    throw error;
  }
}

/**
 * Handle successful invoice payment
 * @param {import('stripe').Stripe.InvoicePaymentSucceededEvent} event
 */
async function handleInvoicePaymentSucceeded(event) {
  const invoice = event.data.object;
  console.log(`Payment succeeded for invoice: ${invoice.id}`);
  console.log(`Invoice data:`, JSON.stringify(invoice));
  const customer = invoice.customer;
  if (!customer || (typeof customer !== "string" && customer.deleted)) {
    console.log(
      `Customer ${invoice.customer} is deleted. Skipping invoice processing.`
    );
    return;
  }

  const price = invoice.lines.data[0].price;

  /** @type {Transaction | null} */
  let transaction = null;
  try {
    transaction = await sequelize.transaction().catch(() => {
      throw new HttpError("Error starting database transaction");
    });

    const subscription =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id;
    if (!subscription) {
      throw new HttpError(400, "Subscription ID not found in invoice");
    }

    if (!(await registerEvent(transaction, event))) {
      return;
    }

    const userSubscription = await UserSubscription.findOne({
      where: { stripeSubscriptionId: subscription },
      transaction,
    }).catch((error) => {
      throw new HttpError(500, "Error finding user plan", {
        errors: {
          server: { message: error.message },
        },
      });
    });

    if (!userSubscription) {
      throw new HttpError(404, "User plan not found");
    }
    const plan = await Plan.findOne({
      where: { stripePriceId: price?.id },
      attributes: ["id"],
      transaction,
    }).catch(() => {
      throw new HttpError(500, "Error retrieving plan");
    });

    if (plan) {
      await userSubscription
        .update(
          {
            status: "active",
            stripePriceId: price?.id,
            activatedAt: new Date(),
          },
          { transaction }
        )
        .catch((error) => {
          throw new HttpError(500, "Error updating user plan", {
            errors: {
              server: { message: error.message },
            },
          });
        });
    }

    await transaction.commit().catch((error) => {
      if (error.name === "SequelizeUniqueConstraintError") {
        return;
      }
    });

    console.log(`Payment succeeded for invoice: ${invoice.id}`);
    console.log(`Invoice data saved to database`);
  } catch (error) {
    if (transaction) {
      transaction.rollback().catch(() => {
        throw new HttpError(500, "Error rolling back database transaction");
      });
    }
    throw error;
  }
}

/**
 * @param {Transaction} transaction
 * @param {import('stripe').Stripe.Event} event
 */
async function registerEvent(transaction, event) {
  const stripeEvent = await StripeEvent.findOne({
    where: { eventId: event.id },
    transaction,
  }).catch(() => {
    throw new HttpError(500, "Error finding Stripe event");
  });

  if (stripeEvent) {
    console.log(`Event already processed: ${event.id}`);
    return;
  }

  return StripeEvent.create(
    {
      eventId: event.id,
      type: event.type,
      data: event.data,
    },
    { transaction }
  ).catch((error) => {
    throw new HttpError("Error saving invoice to database", {
      errors: {
        server: { message: error.message },
      },
    });
  });
}

export default router;
