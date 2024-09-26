import express from "express";
import validateSessionToken from "../middlewares/validateSessionToken.js";
import { UserPlan, Plan } from "../db.js";
import { Op } from "sequelize";

const router = express.Router();

/**
 * @typedef {import('../types/models').User} User
 * @typedef {import('../types/models').Plan} Plan
 * @typedef {import('../types/models').UserPlan} UserPlanModel
 * @typedef {UserPlanModel & {plan?: Plan}} UserPlanWithPlan
 * @typedef {import('../types/http').ErrorResBody} ErrorResBody
 */

/**
 * @typedef {Object} ProfileResponse
 * @property {string} message
 * @property {User} user
 * @property {UserPlanWithPlan} [currentPlan]
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
        include: [{ model: Plan, attributes: ["id", "name", "code", "price"] }],
      });

      /** @type {ProfileResponse} */
      const response = {
        message: "User profile retrieved successfully",
        user: user,
      };

      if (userPlan) {
        const userPlanJSON = userPlan.toJSON();
        // @ts-ignore
        response.currentPlan = {
          ...userPlanJSON,
        };
      }

      res.json(response);
    } catch (error) {
      console.error("Error retrieving user profile:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
    }
  }
);

export default router;
