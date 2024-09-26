import express from "express";
import validateSessionToken from "../middlewares/validateSessionToken.js";
import { UserPlan, Plan, User } from "../db.js";
import { Op } from "sequelize";
import stripe from "../lib/stripe.js";

const router = express.Router();

/**
 * @typedef {import('../types/models').User} User
 * @typedef {import('../types/models').Plan} Plan
 * @typedef {import('../types/models').UserPlanWithPlan} UserPlanWithPlan
 * @typedef {import('../types/http').ErrorResBody} ErrorResBody
 */

/**
 * @typedef {Object} ProfileResponse
 * @property {string} message
 * @property {User} user
 * @property {UserPlanWithPlan} currentPlan
 */

router.get(
  "/profile",
  validateSessionToken,
  /**
   * GET /users/profile
   * @param {express.Request & { user: User }} req
   * @param {express.Response<ProfileResponse | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
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
      });

      /** @type {ProfileResponse} */
      const response = {
        message: "User profile retrieved successfully",
        user: user,
        // @ts-ignore
        currentPlan: userPlan
          ? userPlan.toJSON()
          : {
              id: 0,
              userId: user.id,
              planId: 0,
              status: "active",
              activatedAt: new Date().toISOString(),
              cancelRequestedAt: null,
              effectiveCancelDate: null,
              stripeSubscriptionId: null,
              stripeSubscriptionItemId: null,
              plan: {
                id: 0,
                name: "Free Plan",
                code: "FREE",
                price: "0",
              },
            },
      };

      res.json(response);
    } catch (error) {
      console.error("Error retrieving user profile:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
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
   * @param {express.Request<{}, AssignPlanResponse | ErrorResBody, AssignPlanBody> & { user: User }} req
   * @param {express.Response<AssignPlanResponse | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    const { planId } = req.body;
    const userId = req.user.id;

    try {
      // Check if the plan exists
      const plan = await Plan.findByPk(planId);
      if (!plan) {
        return res
          .status(404)
          .json({ errors: { plan: { message: "Plan not found" } } });
      }

      // Fetch the user to get the stripeCustomerId
      const user = await User.findByPk(userId);
      if (!user) {
        return res
          .status(404)
          .json({ errors: { user: { message: "User not found" } } });
      }

      const stripeCustomerId = user.getDataValue("stripeCustomerId");
      if (!stripeCustomerId) {
        return res.status(400).json({
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
      });

      let stripeSubscription;

      if (existingUserPlan) {
        // Update the existing Stripe subscription
        stripeSubscription = await stripe.subscriptions.update(
          existingUserPlan.getDataValue("stripeSubscriptionId"),
          {
            items: [
              {
                // @ts-ignore
                id: existingUserPlan.getDataValue("stripeSubscriptionItemId"),
                price: plan.getDataValue("stripePriceId"),
              },
            ],
          }
        );

        // Update the existing plan
        await existingUserPlan.update({
          planId,
          status: "active",
          activatedAt: new Date(),
          cancelRequestedAt: null,
          effectiveCancelDate: null,
          stripeSubscriptionId: stripeSubscription.id,
          stripeSubscriptionItemId: stripeSubscription.items.data[0].id,
        });
      } else {
        // Create a new Stripe subscription
        stripeSubscription = await stripe.subscriptions.create({
          customer: stripeCustomerId,
          items: [{ price: plan.getDataValue("stripePriceId") }],
        });

        // Create a new user plan
        await UserPlan.create({
          userId,
          planId,
          status: "active",
          activatedAt: new Date(),
          stripeSubscriptionId: stripeSubscription.id,
          stripeSubscriptionItemId: stripeSubscription.items.data[0].id,
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
      });

      if (!updatedUserPlan) {
        throw new Error("Failed to retrieve updated user plan");
      }

      res.status(200).json({
        message: "Plan assigned successfully",
        userPlan: updatedUserPlan.toJSON(),
      });
    } catch (error) {
      console.error("Error assigning plan to user:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
    }
  }
);

export default router;