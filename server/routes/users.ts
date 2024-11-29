import express, { Response, NextFunction } from "express";
import validateSessionToken from "../middlewares/validateSessionToken";
import { UserSubscription, Plan, User } from "../db";
import { Op } from "sequelize";
import stripe from "../lib/stripe";
import { HttpError } from "http-errors-enhanced";
import { RequestWithSession } from "../types/http";
import addPaymentMethodInfo, { RequestWithUserAndPayment } from "server/middlewares/addPaymentMethodInfo";

const usersRouter = express.Router();

interface UserAttributes {
  id: number;
  stripeCustomerId: string | null;
  // Add other user properties as needed
}
export interface PlanAttributes {
  id: number;
  code: string;
  name: string;
  freeDataTransferGB: number;
  pricePerAdditional10GB: number;
  billingPeriod: 'monthly' | 'yearly';
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  apiIntegration: boolean;
  dedicatedAccountManager: boolean;
  stripePriceId: string;
}

interface UserSubscriptionAttributes {
  id: number;
  userId: number;
  stripePriceId: string;
  stripeSubscriptionId: string;
  activatedAt: Date;
  cancelRequestedAt?: Date | null;
  effectiveCancelDate?: Date | null;
  status: 'active' | 'pending_cancellation' | 'inactive' | 'cancelled';
  stripeSubscriptionItemId: string | null;
}

interface UserSubscriptionWithPlan extends UserSubscriptionAttributes {
  Plan: PlanAttributes;
}

interface ProfileResponse {
  message: string;
  user: UserAttributes;
  currentPlan: UserSubscriptionWithPlan;
  hasPaymentMethod: boolean;
}

interface AssignPlanBody {
  planId: number;
}

interface AssignPlanResponse {
  message: string;
  userSubscription: UserSubscriptionWithPlan;
}

usersRouter.get(
  "/profile",
  validateSessionToken,
  addPaymentMethodInfo,
  async (req: RequestWithUserAndPayment, res: Response<ProfileResponse>, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new HttpError(401, "Unauthorized"));
    }

    try {
      const userSubscription = await UserSubscription.findOne({
        where: {
          userId: user.id,
          status: {
            [Op.in]: ["active", "pending_cancellation"],
          },
        },
        include: [
          {
            model: Plan,
            attributes: [
              "id",
              "name",
              "code",
              "basePrice",
              "freeDataTransferGB",
              "pricePerAdditional10GB",
              "stripePriceId"
            ],
          },
        ],
      });

      if (!userSubscription) {
        throw new HttpError(404, "User plan not found", {
          errors: { user: { message: "User plan not found" } },
        });
      }

      const response: ProfileResponse = {
        message: "User profile retrieved successfully",
        user: user,
        currentPlan: userSubscription.toJSON(),
        hasPaymentMethod: req.hasPaymentMethod === true,
      };

      res.json(response);
    } catch (error) {
      console.trace(error);
      next(error);
    }
  }
);

usersRouter.post(
  "/assign-plan",
  validateSessionToken,
  async (req: RequestWithSession<{}, AssignPlanResponse, AssignPlanBody>, res: Response<AssignPlanResponse>, next: NextFunction) => {
    const { planId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new HttpError(401, "Unauthorized"));
    }

    try {
      const plan = await Plan.findByPk(planId);
      if (!plan) {
        throw new HttpError(404, "Plan not found", {
          errors: { plan: { message: "Plan not found" } },
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new HttpError(404, "User not found", {
          errors: { user: { message: "User not found" } },
        });
      }

      const stripeCustomerId = user.getDataValue("stripeCustomerId");
      if (!stripeCustomerId) {
        throw new HttpError(400, "User does not have a Stripe customer ID", {
          errors: {
            user: { message: "User does not have a Stripe customer ID" },
          },
        });
      }

      const existingUserSubscription = await UserSubscription.findOne({
        where: {
          userId,
          status: {
            [Op.in]: ["active", "pending_cancellation"],
          },
        },
        include: [
          {
            model: Plan,
            attributes: ["id", "name", "code", "price", "stripePriceId"],
          },
        ],
      });

      let stripeSubscription;
      const stripeSubscriptionItemId = existingUserSubscription?.getDataValue("stripeSubscriptionItemId")

      if (existingUserSubscription && stripeSubscriptionItemId) {
        stripeSubscription = await stripe.subscriptions.update(
          existingUserSubscription.getDataValue("stripeSubscriptionId"),
          {
            items: [
              {
                id: stripeSubscriptionItemId,
                price: plan.getDataValue("stripePriceId"),
              },
            ],
          }
        );

        await existingUserSubscription.update({
          stripePriceId: plan.getDataValue("stripePriceId"),
          status: "active",
          activatedAt: new Date(),
          cancelRequestedAt: null,
          effectiveCancelDate: null,
          stripeSubscriptionId: stripeSubscription.id,
          stripeSubscriptionItemId: stripeSubscription.items.data[0].id,
        });
      } else {
        stripeSubscription = await stripe.subscriptions.create({
          customer: stripeCustomerId,
          items: [{ price: plan.getDataValue("stripePriceId") }],
        });

        await UserSubscription.create({
          userId,
          stripePriceId: plan.getDataValue("stripePriceId"),
          status: "active",
          activatedAt: new Date(),
          stripeSubscriptionId: stripeSubscription.id,
          stripeSubscriptionItemId: stripeSubscription.items.data[0].id,
        });
      }

      const updatedUserSubscription = await UserSubscription.findOne({
        where: {
          userId,
          stripePriceId: plan.getDataValue("stripePriceId"),
          status: "active",
        },
        include: [
          {
            model: Plan,
            attributes: ["id", "name", "code", "price", "stripePriceId"],
          },
        ],
      });

      if (!updatedUserSubscription) {
        throw new Error("Failed to retrieve updated user plan");
      }

      res.status(200).json({
        message: "Plan assigned successfully",
        userSubscription: updatedUserSubscription.toJSON() as UserSubscriptionWithPlan,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;