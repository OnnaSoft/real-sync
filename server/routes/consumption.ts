import express, { Request, Response } from "express";
import Joi from "joi";
import { HttpError } from "http-errors-enhanced";
import { validateRequest } from "&/middlewares/validateRequest";
import stripe from "&/lib/stripe";
import { Plan, Tunnel, TunnelConsumption, UserSubscription } from "&/db";

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

            const tunnel = await Tunnel.findOne({ where: { domain } }).catch((error) => {
                throw new HttpError(500, "Tunnel not found");
            });

            if (!tunnel) {
                throw new HttpError(404, "Tunnel not found");
            }

            const userId = tunnel.getDataValue("userId");

            const userSubscription = await UserSubscription.findOne({ where: { userId } }).catch((error) => {
                throw new HttpError(500, "Subscription not found");
            });

            if (!userSubscription) {
                throw new HttpError(404, "Subscription not found");
            }

            const subscriptionId = userSubscription.getDataValue("stripeSubscriptionId");
            const subscription = await stripe.subscriptions.retrieve(subscriptionId).catch((error) => {
                throw new HttpError(500, "Stripe subscription not found");
            });

            if (!subscription) {
                throw new HttpError(404, "Stripe subscription not found");
            }

            const subscriptionItem = subscription.items.data[0];

            if (!subscriptionItem) {
                throw new HttpError(500, "No plan found in the subscription");
            }

            const planId = subscriptionItem.plan.id;
            const plan = await Plan.findOne({ where: { stripePriceId: planId } })
                .catch((error) => {
                    throw new HttpError(500, "Plan not found");
                });


            const freeDataTransferGB = (plan?.getDataValue("freeDataTransferGB") ?? 0) * 1024 * 1024 * 1024;

            const consumption = await TunnelConsumption.findOne({
                where: {
                    tunnelId: tunnel.getDataValue("id"),
                    year,
                    month,
                },
            }).catch((error) => {
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
                            price: planId,
                            quantity: Number(items),
                        },
                    ],
                }).catch(async () => {
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