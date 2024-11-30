import express, { Request, Response } from "express";
import { HttpError } from "http-errors-enhanced";
import { validateRequest } from "&/middlewares/validateRequest";
import stripe from "&/lib/stripe";
import { Tunnel, TunnelConsumption, UserSubscription } from "&/db";
import Joi from "joi";

export const updateConsumptionSchema = Joi.object({
  domain: Joi.string().required().messages({
    "string.base": "The domain must be a string.",
    "string.empty": "The domain is required.",
    "any.required": "The domain is required.",
  }),
  dataUsage: Joi.number().min(0).required().messages({
    "number.base": "The traffic must be a number.",
    "number.min": "The traffic must be a positive number.",
    "any.required": "The traffic is required.",
  }),
  year: Joi.number().min(2000).max(9999).required().messages({
    "number.base": "The year must be a number.",
    "number.min": "The year must be greater than 2000.",
    "number.max": "The year must be less than 9999.",
    "any.required": "The year is required.",
  }),
  month: Joi.number().min(1).max(12).required().messages({
    "number.base": "The month must be a number.",
    "number.min": "The month must be greater than 1.",
    "number.max": "The month must be less than 12.",
    "any.required": "The month is required.",
  }),
});

export interface UpdateConsumptionRequest {
  domain: string;
  dataUsage: bigint;
  year: number;
  month: number;
}

export interface UpdateConsumptionResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

const consumptionRouter = express.Router();

consumptionRouter.post(
  "/update-consumption",
  // @ts-expect-error
  validateRequest(updateConsumptionSchema),
  (req: Request<{}, {}, UpdateConsumptionRequest>, res: Response<UpdateConsumptionResponse>, next) => {
    req.body.dataUsage = BigInt(req.body.dataUsage);
    next();
  },
  async (req: Request<{}, {}, UpdateConsumptionRequest>, res: Response<UpdateConsumptionResponse>, next) => {
    try {
      const { domain, dataUsage, month, year } = req.body;

      const tunnel = await Tunnel.findOne({ where: { domain } })
        .catch(() => {
          throw new HttpError(500, "Tunnel not found");
        });

      if (!tunnel) {
        throw new HttpError(404, "Tunnel not found");
      }

      const userId = tunnel.getDataValue("userId");

      const userSubscription = await UserSubscription.findOne({ where: { userId } })
        .catch(() => {
          throw new HttpError(500, "Subscription not found");
        });

      if (!userSubscription) {
        throw new HttpError(404, "Subscription not found");
      }

      const subscriptionId = userSubscription.getDataValue("stripeSubscriptionId");
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        .catch(() => {
          throw new HttpError(500, "Stripe subscription not found");
        });

      if (!subscription) {
        throw new HttpError(404, "Stripe subscription not found");
      }

      const subscriptionItem = subscription.items.data[0];

      if (!subscriptionItem) {
        throw new HttpError(500, "No plan found in the subscription");
      }

      const consumption = await TunnelConsumption.findOne({
        where: {
          tunnelId: tunnel.getDataValue("id"),
          year,
          month,
        },
      }).catch((error) => {
        console.log("Error finding consumption", error);
        return null;
      });

      if (!consumption) {
        const items = dataUsage / BigInt(1024 * 1024 * 1024);
        console.log("Extra data cost", items);

        await TunnelConsumption.create({
          tunnelId: tunnel.getDataValue("id"),
          year,
          month,
          dataUsage,
        }).catch(() => {
          throw new HttpError(500, "Error creating consumption");
        });

        stripe.subscriptions.update(subscriptionId, {
          items: [
            {
              id: subscriptionItem.id,
              price: subscriptionItem.price.id,
            },
          ],
        }).catch(async (error) => {
          console.log("Error deleting consumption", error);
          await TunnelConsumption.destroy({
            where: {
              tunnelId: tunnel.getDataValue("id"),
              year,
              month,
            },
          });
        }).catch(() => {
          throw new HttpError(500, "Error updating subscription");
        });
      } else {
        /*consumption.setDataValue("dataUsage", dataUsage);
        await consumption.save().catch((error) => {
            throw new HttpError(500, "Error updating consumption");
        });*/
      }

      // complete

      res.status(200).json({ message: "Updated" });
    } catch (error) {
      next(error);
    }
  }
);


export default consumptionRouter;