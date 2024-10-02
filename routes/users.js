import express from "express";
import validateSessionToken from "../middlewares/validateSessionToken.js";
import { UserPlan, Plan, User } from "../db.js";
import { Op } from "sequelize";
import stripe from "../lib/stripe.js";
import { HttpError } from "http-errors-enhanced";

const router = express.Router();

/**
 * @typedef {import('../types/models').User} User
 * @typedef {import('../types/models').Plan} Plan
 * @typedef {import('../types/models').UserPlanWithPlan} UserPlanWithPlan
 */

/**
 * @typedef {Object} ProfileResponse
 * @property {string} message
 * @property {User} user
 * @property {UserPlanWithPlan} currentPlan
 * @property {boolean} hasPaymentMethod
 */
router.get(
  "/profile",
  validateSessionToken,
  /**
   * GET /users/profile
   * @param {express.Request & { user: User }} req
   * @param {express.Response<ProfileResponse>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const user = req.user;
    try {
      const userPlan = await UserPlan.findOne({
        where: {
          userId: user.id,
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
      }).catch(() => {
        throw new HttpError(500, "Error retrieving user plan");
      });

      // Check if the user has a payment method
      let hasPaymentMethod = false;
      if (user.stripeCustomerId) {
        const customer = await stripe.customers
          .retrieve(user.stripeCustomerId)
          .catch(() => {
            throw new HttpError(500, "Error retrieving Stripe customer");
          });

        if (!customer.deleted) {
          hasPaymentMethod =
            customer.invoice_settings.default_payment_method !== null;
        } else {
          // If the customer was deleted, remove the Stripe customer ID from the user
          await User.update(
            // @ts-ignore
            { stripeCustomerId: null },
            { where: { id: user.id } }
          ).catch(() => {
            throw new HttpError(
              500,
              "Error removing Stripe customer ID from user"
            );
          });
        }
      }

      /** @type {ProfileResponse} */
      const response = {
        message: "User profile retrieved successfully",
        user: user,
        // @ts-ignore
        currentPlan: userPlan.toJSON(),
        hasPaymentMethod: hasPaymentMethod,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @typedef {Object} AssignPlanBody
 * @property {number} planId - The ID of the plan to assign
 */

/**
 * @typedef {Object} AssignPlanResponse
 * @property {string} message
 * @property {UserPlanWithPlan} userPlan
 */

router.post(
  "/assign-plan",
  validateSessionToken,
  /**
   * POST /users/assign-plan
   * @param {express.Request<{}, AssignPlanResponse, AssignPlanBody> & { user: User }} req
   * @param {express.Response<AssignPlanResponse>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const { planId } = req.body;
    const userId = req.user.id;

    try {
      // Check if the plan exists
      const plan = await Plan.findByPk(planId).catch(() => {
        throw new HttpError(500, "Error retrieving plan");
      });
      if (!plan) {
        throw new HttpError(404, "Plan not found", {
          errors: { plan: { message: "Plan not found" } },
        });
      }

      // Fetch the user to get the stripeCustomerId
      const user = await User.findByPk(userId).catch(() => {
        throw new HttpError(500, "Error retrieving user");
      });
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

      // Check if the user already has an active plan
      const existingUserPlan = await UserPlan.findOne({
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
      }).catch(() => {
        throw new HttpError(500, "Error retrieving user plan");
      });

      let stripeSubscription;

      if (existingUserPlan) {
        // Update the existing Stripe subscription
        stripeSubscription = await stripe.subscriptions
          .update(existingUserPlan.getDataValue("stripeSubscriptionId"), {
            items: [
              {
                // @ts-ignore
                id: existingUserPlan.getDataValue("stripeSubscriptionItemId"),
                price: plan.getDataValue("stripePriceId"),
              },
            ],
          })
          .catch((error) => {
            throw new HttpError(400, "Error updating subscription", error);
          });

        // Update the existing plan
        await existingUserPlan
          .update({
            planId,
            status: "active",
            activatedAt: new Date(),
            cancelRequestedAt: null,
            effectiveCancelDate: null,
            stripeSubscriptionId: stripeSubscription.id,
            stripeSubscriptionItemId: stripeSubscription.items.data[0].id,
          })
          .catch(() => {
            throw new HttpError(500, "Error updating user plan");
          });
      } else {
        // Create a new Stripe subscription
        stripeSubscription = await stripe.subscriptions
          .create({
            customer: stripeCustomerId,
            items: [{ price: plan.getDataValue("stripePriceId") }],
          })
          .catch((error) => {
            throw new HttpError(400, "Error creating subscription", error);
          });

        // Create a new user plan
        await UserPlan.create({
          userId,
          planId,
          status: "active",
          activatedAt: new Date(),
          stripeSubscriptionId: stripeSubscription.id,
          stripeSubscriptionItemId: stripeSubscription.items.data[0].id,
        }).catch(() => {
          throw new HttpError(500, "Error creating user plan");
        });
      }

      // Fetch the updated user plan with plan details
      const updatedUserPlan = await UserPlan.findOne({
        where: {
          userId,
          planId,
          status: "active",
        },
        include: [
          {
            model: Plan,
            attributes: ["id", "name", "code", "price", "stripePriceId"],
          },
        ],
      }).catch(() => {
        throw new HttpError(500, "Error retrieving updated user plan");
      });

      if (!updatedUserPlan) {
        throw new Error("Failed to retrieve updated user plan");
      }

      res.status(200).json({
        message: "Plan assigned successfully",
        userPlan: updatedUserPlan.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
