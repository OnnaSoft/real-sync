import express from "express";
import { DedicatedServerPlan } from "../db.js";
import validateSessionToken from "../middlewares/validateSessionToken.js";

const router = express.Router();

/**
 * @typedef {import('../types/models.js').DedicatedServerPlan} DedicatedServerPlan
 * @typedef {import('../types/http.js').ErrorResBody} ErrorResBody
 */

/**
 * @typedef {Object} GetDedicatedServerPlansResponse
 * @property {string} message
 * @property {DedicatedServerPlan[]} data
 * @property {number} total
 */

router.get(
  "/",
  validateSessionToken,
  /**
   * GET /dedicated-server-plans
   * @param {express.Request} req
   * @param {express.Response<GetDedicatedServerPlansResponse | ErrorResBody>} res
   */
  async (req, res) => {
    try {
      const plans = await DedicatedServerPlan.findAll({
        order: [["price", "ASC"]],
      });
      const plainPlans = plans.map((plan) => plan.toJSON());
      res.json({
        message: "Dedicated server plans retrieved successfully",
        data: plainPlans,
        total: plans.length,
      });
    } catch (error) {
      console.error("Error retrieving dedicated server plans:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
    }
  }
);

/**
 * @typedef {Object} GetDedicatedServerPlanResponse
 * @property {string} message
 * @property {DedicatedServerPlan} data
 */

router.get(
  "/:id",
  validateSessionToken,
  /**
   * GET /dedicated-server-plans/:id
   * @param {express.Request<{ id: string }>} req
   * @param {express.Response<GetDedicatedServerPlanResponse | ErrorResBody>} res
   */
  async (req, res) => {
    const { id } = req.params;
    try {
      const plan = await DedicatedServerPlan.findByPk(id);
      if (!plan) {
        return res.status(404).json({
          errors: { plan: { message: "Dedicated server plan not found" } },
        });
      }
      res.json({
        message: "Dedicated server plan retrieved successfully",
        data: plan.toJSON(),
      });
    } catch (error) {
      console.error("Error retrieving dedicated server plan:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
    }
  }
);

export default router;
