import express from "express";
import { DedicatedServerPlan } from "../db.js";
import { HttpError } from "http-errors-enhanced";

const router = express.Router();

/**
 * @typedef {import('../types/models.js').DedicatedServerPlan} DedicatedServerPlan
 */

/**
 * @typedef {Object} GetDedicatedServerPlansResponse
 * @property {string} message
 * @property {DedicatedServerPlan[]} data
 * @property {number} total
 */

router.get(
  "/",
  /**
   * GET /dedicated-server-plans
   * @param {express.Request} req
   * @param {express.Response<GetDedicatedServerPlansResponse>} res
   * @param {express.NextFunction} next
   */
  async (req, res, next) => {
    try {
      const plans = await DedicatedServerPlan.findAll({
        order: [["price", "ASC"]],
      }).catch((error) => {
        throw new HttpError(500, "Error retrieving dedicated server plans");
      });
      const plainPlans = plans.map((plan) => plan.toJSON());
      res.json({
        message: "Dedicated server plans retrieved successfully",
        data: plainPlans,
        total: plans.length,
      });
    } catch (error) {
      next(error);
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
  /**
   * GET /dedicated-server-plans/:id
   * @param {express.Request<{ id: string }>} req
   * @param {express.Response<GetDedicatedServerPlanResponse>} res
   * @param {express.NextFunction} next
   */
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const plan = await DedicatedServerPlan.findByPk(id).catch((error) => {
        throw new HttpError(500, "Error retrieving dedicated server plan");
      });
      if (!plan) {
        throw new HttpError(404, "Dedicated server plan not found", {
          errors: { plan: { message: "Dedicated server plan not found" } },
        });
      }
      res.json({
        message: "Dedicated server plan retrieved successfully",
        data: plan.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
