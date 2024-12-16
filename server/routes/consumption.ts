import express, { Request, Response, NextFunction } from "express";
import * as core from "express-serve-static-core";
import { HttpError } from "http-errors-enhanced";
import { validateRequest } from "&/middlewares/validateRequest";
import { Tunnel, TunnelConsumption, UserActivity, UserSubscription } from "&/db";
import validateApiKey from "&/middlewares/validateApiKey";
import validateSessionToken, { RequestWithUser } from "&/middlewares/validateSessionToken";
import stripe from "&/lib/stripe";
import Joi from "joi";
import { getClientMetadata } from "&/lib/utils";

const consumptionRouter = express.Router();

consumptionRouter.get("/",
  validateSessionToken,
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      if (!user) {
        throw new HttpError(401, "Unauthorized");
      }

      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const tunnels = await Tunnel.findAll({
        attributes: ["domain"],
        where: {
          userId: user.id
        },
        include: [
          {
            model: TunnelConsumption,
            as: "consumptions",
            attributes: ["year", "month", "dataUsage"],
            order: [["year", "DESC"], ["month", "DESC"]],
            limit: 12,
          },
        ],
      });

      const response = tunnels.map((tunnel) => {
        const tunnelData = tunnel.toJSON();
        const consumptions = tunnelData.consumptions?.map((consumption: any) => {
          return {
            year: consumption.year,
            month: consumption.month,
            dataUsage: consumption.dataUsage,
          };
        });

        return {
          domain: tunnelData.domain,
          consumptions,
        };
      });

      UserActivity.create({
        userId: user.id,
        activityType: "consumption_history",
        description: "Viewed consumption history",
        metadata: getClientMetadata(req),
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  })


export const updateConsumptionSchema = Joi.object({
  domain: Joi.string().required().messages({
    "string.base": "The domain must be a string.",
    "string.empty": "The domain is required.",
    "any.required": "The domain is required.",
  }),
  dataUsage: Joi.number().integer().min(0).required().messages({
    "number.base": "The data usage must be a number.",
    "number.integer": "The data usage must be an integer.",
    "number.min": "The data usage must be a positive number.",
    "any.required": "The data usage is required.",
  }),
  year: Joi.number().integer().min(2000).max(9999).required().messages({
    "number.base": "The year must be a number.",
    "number.integer": "The year must be an integer.",
    "number.min": "The year must be 2000 or later.",
    "number.max": "The year must be 9999 or earlier.",
    "any.required": "The year is required.",
  }),
  month: Joi.number().integer().min(1).max(12).required().messages({
    "number.base": "The month must be a number.",
    "number.integer": "The month must be an integer.",
    "number.min": "The month must be 1 or greater.",
    "number.max": "The month must be 12 or less.",
    "any.required": "The month is required.",
  }),
});

export interface UpdateConsumptionRequest {
  domain: string;
  dataUsage: number;
  year: number;
  month: number;
}

export interface UpdateConsumptionResponse {
  message: string;
}

consumptionRouter.post(
  "/update-consumption",
  validateApiKey,
  validateRequest(updateConsumptionSchema),
  async (req: Request<core.ParamsDictionary, any, UpdateConsumptionRequest>, res: Response<UpdateConsumptionResponse>, next: NextFunction) => {
    try {
      const { domain, dataUsage: _dataUsage, month, year } = req.body;

      const dataUsage = BigInt(_dataUsage);
      const tunnel = await Tunnel.findOne({ where: { domain } });
      if (!tunnel) {
        throw new HttpError(404, "Túnel no encontrado");
      }

      const userId = tunnel.getDataValue("userId");

      const userSubscription = await UserSubscription.findOne({ where: { userId } });
      if (!userSubscription) {
        throw new HttpError(404, "Suscripción no encontrada");
      }

      const subscriptionId = userSubscription.getDataValue("stripeSubscriptionId");

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const subscriptionItem = subscription.items.data[0];
      if (!subscriptionItem) {
        throw new HttpError(500, "No se encontró un plan en la suscripción");
      }

      let consumption = await TunnelConsumption.findOne({
        where: {
          tunnelId: tunnel.getDataValue("id"),
          year,
          month,
        },
      });

      if (!consumption) {
        await TunnelConsumption.create({
          tunnelId: tunnel.getDataValue("id"),
          year,
          month,
          dataUsage,
        });

        const _additionalUsageGB = Number(dataUsage / BigInt(1024 * 1024 * 1024))
        const additionalUsageGB = Math.ceil(_additionalUsageGB);

        await stripe.subscriptionItems.createUsageRecord(subscriptionItem.id, {
          quantity: additionalUsageGB,
          timestamp: Math.floor(Date.now() / 1000),
          action: 'increment',
        });

      } else {
        const previousUsage = consumption.getDataValue("dataUsage");
        const additionalUsage = dataUsage - BigInt(previousUsage);

        if (additionalUsage > 0) {
          const _additionalUsageGB = Number(dataUsage / BigInt(1024 * 1024 * 1024))
          const additionalUsageGB = Math.ceil(_additionalUsageGB);

          await stripe.subscriptionItems.createUsageRecord(subscriptionItem.id, {
            quantity: additionalUsageGB,
            timestamp: Math.floor(Date.now() / 1000),
            action: 'increment',
          });
        }

        await consumption.update({ dataUsage });
      }

      UserActivity.create({
        userId,
        activityType: "consumption_updated",
        description: "Updated consumption",
        metadata: getClientMetadata(req),
      });

      res.status(200).json({ message: "Updated consumption" });
    } catch (error) {
      next(error);
    }
  }
);

export default consumptionRouter;

