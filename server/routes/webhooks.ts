import express, { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { Plan, sequelize, StripeEvent, UserSubscription } from "../db";
import stripe from "../lib/stripe";
import { HttpError } from "http-errors-enhanced";
import { Transaction } from "sequelize";

const webhookRouter = express.Router();

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

webhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response<{ received: boolean }>, next: NextFunction) => {
    const sig = req.headers["stripe-signature"]?.toString() || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (error) {
      const err = error as Error;
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      throw new HttpError("Webhook signature verification failed", {
        errors: {
          server: { message: "Webhook signature verification failed" },
        },
      });
    }

    try {
      switch (event.type) {
        case "customer.subscription.created":
          await handleSubscriptionCreated(event as Stripe.CustomerSubscriptionCreatedEvent);
          break;
        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event as Stripe.CustomerSubscriptionUpdatedEvent);
          break;
        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event as Stripe.CustomerSubscriptionDeletedEvent);
          break;
        case "invoice.payment_succeeded":
          await handleInvoicePaymentSucceeded(event as Stripe.InvoicePaymentSucceededEvent);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error(`Error processing webhook: ${error}`);
      next(error);
    }
  }
);

async function handleSubscriptionCreated(event: Stripe.CustomerSubscriptionCreatedEvent) {
  let transaction: Transaction | null = null;
  try {
    transaction = await sequelize.transaction();

    await registerEvent(transaction, event);

    const userSubscription = await UserSubscription.findOne({
      where: { stripeSubscriptionId: event.data.object.id },
      transaction,
    });

    if (!userSubscription) {
      throw new HttpError(404, "User subscription not found");
    }

    await userSubscription.update(
      {
        status: "active",
        activatedAt: new Date(),
      },
      { transaction }
    );

    await transaction.commit();
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    throw error;
  }
}

async function handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
  let transaction: Transaction | null = null;
  try {
    transaction = await sequelize.transaction();

    await registerEvent(transaction, event);

    const userSubscription = await UserSubscription.findOne({
      where: { stripeSubscriptionId: event.data.object.id },
      transaction,
    });

    if (!userSubscription) {
      throw new HttpError(404, "User subscription not found");
    }

    const subscriptionStatus = event.data.object.status;

    let status: "active" | "pending_cancellation" | "inactive" | "cancelled" = "active";
    if (subscriptionStatus === "active") status = "active";
    else if (subscriptionStatus === "trialing") status = "active";
    else if (subscriptionStatus === "canceled") status = "cancelled";
    else if (["incomplete_expired", "past_due", "unpaid", "paused"].includes(subscriptionStatus)) status = "inactive";
    else if (subscriptionStatus === "incomplete") status = "pending_cancellation";

    const effectiveCancelDate = status === "pending_cancellation" ? event.data.object.canceled_at : undefined;

    await userSubscription.update(
      {
        status,
        activatedAt: status === "active" ? new Date() : undefined,
        effectiveCancelDate: effectiveCancelDate ? new Date(effectiveCancelDate * 1000) : undefined,
      },
      { transaction }
    );

    await transaction.commit();
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    throw error;
  }
}

async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
  let transaction: Transaction | null = null;
  try {
    transaction = await sequelize.transaction();

    await registerEvent(transaction, event);

    const userSubscription = await UserSubscription.findOne({
      where: { stripeSubscriptionId: event.data.object.id },
      transaction,
    });

    if (!userSubscription) {
      throw new HttpError(404, "User subscription not found");
    }

    await userSubscription.update(
      {
        status: "cancelled",
        effectiveCancelDate: new Date(),
      },
      { transaction }
    );

    await transaction.commit();
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(event: Stripe.InvoicePaymentSucceededEvent) {
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

  let transaction: Transaction | null = null;
  try {
    transaction = await sequelize.transaction();

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
    });

    if (!userSubscription) {
      throw new HttpError(404, "User plan not found");
    }
    const plan = await Plan.findOne({
      where: { stripePriceId: price?.id },
      attributes: ["id"],
      transaction,
    });

    if (plan) {
      await userSubscription.update(
        {
          status: "active",
          stripePriceId: price?.id,
          activatedAt: new Date(),
        },
        { transaction }
      );
    }

    await transaction.commit();

    console.log(`Payment succeeded for invoice: ${invoice.id}`);
    console.log(`Invoice data saved to database`);
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    throw error;
  }
}

async function registerEvent(transaction: Transaction, event: Stripe.Event) {
  const stripeEvent = await StripeEvent.findOne({
    where: { eventId: event.id },
    transaction,
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
  );
}

export default webhookRouter;