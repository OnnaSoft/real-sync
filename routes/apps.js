import express from "express";
import {
  App,
  ApiKey,
  DedicatedServerPlan,
  User,
  Plan,
  UserPlan,
  sequelize,
} from "../db.js";
import validateSessionToken from "../middlewares/validateSessionToken.js";
import stripe from "../lib/stripe.js";
import { HttpError } from "http-errors-enhanced";
import { Transaction } from "sequelize";

const router = express.Router();

/**
 * @typedef {import('../types/models').App} App
 * @typedef {import('../types/models').ApiKey} ApiKey
 * @typedef {import('../types/models').DedicatedServerPlan} DedicatedServerPlan
 * @typedef {import('../types/models').User} User
 */

/**
 * @typedef {Object} CreateAppBody
 * @property {string} name
 * @property {string} description
 * @property {boolean} enableCalls
 * @property {boolean} enableVideoCalls
 * @property {boolean} enableConversationLogging
 * @property {number} [dedicatedServerPlanId]
 */

/**
 * @typedef {Object} CreateAppResponse
 * @property {string} message
 * @property {App} app
 */

router.post(
  "/",
  validateSessionToken,
  /**
   * POST /
   * @param {express.Request<{}, CreateAppResponse, CreateAppBody> & { user: User }} req
   * @param {express.Response<CreateAppResponse>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const {
      name,
      description,
      enableCalls,
      enableVideoCalls,
      enableConversationLogging,
      dedicatedServerPlanId,
    } = req.body;
    const userId = req.user.id;

    const transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: UserPlan,
            where: { status: "active" },
            include: [Plan],
          },
        ],
      });

      if (!user) {
        await transaction.rollback();
        throw new HttpError(404, "User not found", {
          errors: { user: { message: "User not found" } },
        });
      }

      /**
       * @type {import('sequelize').Model<import('../models/Plan.js').PlanAttributes>}
       */
      // @ts-ignore
      const activePlan = user["user-plans"][0].plan;

      if (!activePlan) {
        await transaction.rollback();
        throw new HttpError(400, "User does not have an active plan", {
          errors: { plan: { message: "User does not have an active plan" } },
        });
      }

      if (activePlan.getDataValue("maxApps") !== 0 && !dedicatedServerPlanId) {
        // 0 means unlimited
        const appCount = await App.count({ where: { userId } });
        if (appCount >= activePlan.getDataValue("maxApps")) {
          await transaction.rollback();
          throw new HttpError(
            400,
            "Maximum number of apps reached for the current plan",
            {
              errors: {
                app: {
                  message:
                    "Maximum number of apps reached for the current plan",
                },
              },
            }
          );
        }
      }

      /**
       * @type {import('sequelize').Model<
       *   import('../models/DedicatedServerPlan.js').DedicatedServerPlanAttributes,
       *   Omit<import('../models/DedicatedServerPlan.js').DedicatedServerPlanAttributes, "id">
       * > | null}
       */
      let dedicatedServerPlan = null;
      if (dedicatedServerPlanId) {
        dedicatedServerPlan = await DedicatedServerPlan.findByPk(
          dedicatedServerPlanId
        );
        if (!dedicatedServerPlan) {
          await transaction.rollback();
          throw new HttpError(404, "Dedicated server plan not found", {
            errors: {
              dedicatedServerPlan: {
                message: "Dedicated server plan not found",
              },
            },
          });
        }
      }

      const newApp = await App.create(
        {
          name,
          description,
          enableCalls,
          enableVideoCalls,
          enableConversationLogging,
          userId,
          dedicatedServerPlanId,
        },
        { transaction }
      );

      if (dedicatedServerPlan) {
        const stripeCustomer = await stripe.customers.retrieve(
          // @ts-ignore
          user.stripeCustomerId
        );
        await stripe.subscriptions
          .create({
            customer: stripeCustomer.id,
            // @ts-ignore
            items: [{ price: dedicatedServerPlan.stripePriceId }],
          })
          .catch((error) => {
            throw new HttpError(400, "Error creating subscription", error);
          });
      }

      await transaction.commit();

      res.status(201).json({
        message: "App created successfully",
        // @ts-ignore
        app: newApp,
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
);

/**
 * @typedef {Object} UpdateAppBody
 * @property {string} name
 * @property {string} description
 * @property {boolean} enableCalls
 * @property {boolean} enableVideoCalls
 * @property {boolean} enableConversationLogging
 */

/**
 * @typedef {Object} UpdateAppResponse
 * @property {string} message
 * @property {App} app
 */

router.put(
  "/:id",
  validateSessionToken,
  /**
   * PUT /:id
   * @param {express.Request<{ id: string }, UpdateAppResponse, UpdateAppBody> & { user: User }} req
   * @param {express.Response<UpdateAppResponse>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const { id } = req.params;
    const {
      name,
      description,
      enableCalls,
      enableVideoCalls,
      enableConversationLogging,
    } = req.body;
    const userId = req.user.id;

    /** @type {Transaction | null} */
    let transaction = null;

    try {
      transaction = await sequelize.transaction();
      const app = await App.findOne({
        where: { id, userId },
        include: [{ model: DedicatedServerPlan, as: "dedicatedServerPlan" }],
      });

      if (!app) {
        await transaction.rollback();
        throw new HttpError(404, "App not found", {
          errors: { app: { message: "App not found" } },
        });
      }

      await app.update(
        {
          name,
          description,
          enableCalls,
          enableVideoCalls,
          enableConversationLogging,
        },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: "App updated successfully",
        // @ts-ignore
        app,
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      next(error);
    }
  }
);

/**
 * @typedef {Object} DeleteAppResponse
 * @property {string} message
 */

router.delete(
  "/:id",
  validateSessionToken,
  /**
   * DELETE /:id
   * @param {express.Request<{ id: string }, DeleteAppResponse> & { user: User }} req
   * @param {express.Response<DeleteAppResponse>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    /** @type {Transaction | null} */
    let transaction = null;

    try {
      transaction = await sequelize.transaction();

      const app = await App.findOne({
        where: { id, userId },
        include: [{ model: DedicatedServerPlan, as: "dedicatedServerPlan" }],
      }).catch(() => {
        throw new HttpError(500, "Error retrieving app");
      });

      if (!app) {
        await transaction.rollback();
        throw new HttpError(404, "App not found", {
          errors: { app: { message: "App not found" } },
        });
      }

      // @ts-ignore
      if (app.dedicatedServerPlan) {
        const user = await User.findByPk(userId).catch(() => {
          throw new HttpError(500, "Error retrieving user");
        });
        const stripeCustomer = await stripe.customers
          // @ts-ignore
          .retrieve(user.stripeCustomerId)
          .catch(() => {
            throw new HttpError(500, "Error retrieving Stripe customer");
          });
        const subscriptions = await stripe.subscriptions
          .list({
            customer: stripeCustomer.id,
            // @ts-ignore
            price: app.dedicatedServerPlan.stripePriceId,
          })
          .catch(() => {
            throw new HttpError(500, "Error retrieving subscriptions");
          });

        if (subscriptions.data.length > 0) {
          await stripe.subscriptions
            .cancel(subscriptions.data[0].id)
            .catch(() => {
              throw new HttpError(500, "Error cancelling subscription");
            });
        }
      }

      await ApiKey.destroy({ where: { appId: id }, transaction }).catch(() => {
        throw new HttpError(500, "Error deleting API keys");
      });
      await app.destroy({ transaction }).catch(() => {
        throw new HttpError(500, "Error deleting app");
      });

      await transaction.commit().catch(() => {
        throw new HttpError(500, "Error committing transaction");
      });

      res.json({ message: "App and associated API keys deleted successfully" });
    } catch (error) {
      if (transaction) await transaction.rollback();
      next(error);
    }
  }
);

/**
 * @typedef {Object} GetAppsResponse
 * @property {string} message
 * @property {App[]} apps
 */

router.get(
  "/",
  validateSessionToken,
  /**
   * GET /
   * @param {express.Request & { user: User }} req
   * @param {express.Response<GetAppsResponse>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const userId = req.user.id;

    try {
      const apps = await App.findAll({
        where: { userId },
        include: [
          { model: ApiKey, as: "apiKeys" },
          { model: DedicatedServerPlan, as: "dedicatedServerPlan" },
        ],
      }).catch(() => {
        throw new HttpError(500, "Error retrieving apps");
      });

      res.json({
        message: "Apps retrieved successfully",
        // @ts-ignore
        apps,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @typedef {Object} CreateApiKeyResponse
 * @property {string} message
 * @property {ApiKey} apiKey
 */

router.post(
  "/:id/api-keys",
  validateSessionToken,
  /**
   * POST /:id/api-keys
   * @param {express.Request<{ id: string }, CreateApiKeyResponse> & { user: User }} req
   * @param {express.Response<CreateApiKeyResponse>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const app = await App.findOne({ where: { id, userId } }).catch(() => {
        throw new HttpError(500, "Error retrieving app");
      });

      if (!app) {
        throw new HttpError(404, "App not found", {
          errors: { app: { message: "App not found" } },
        });
      }

      const apiKey = await ApiKey.create({
        key: `api-${Math.random().toString(36).substr(2, 9)}`,
        // @ts-ignore
        appId: id,
      }).catch(() => {
        throw new HttpError(500, "Error creating API key");
      });

      res.status(201).json({
        message: "API key created successfully",
        // @ts-ignore
        apiKey,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @typedef {Object} DeleteApiKeyResponse
 * @property {string} message
 */

router.delete(
  "/:appId/api-keys/:keyId",
  validateSessionToken,
  /**
   * DELETE /:appId/api-keys/:keyId
   * @param {express.Request<{ appId: string, keyId: string }, DeleteApiKeyResponse> & { user: User }} req
   * @param {express.Response<DeleteApiKeyResponse>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const { appId, keyId } = req.params;
    const userId = req.user.id;

    try {
      const app = await App.findOne({
        where: { id: appId, userId: userId },
      }).catch(() => {
        throw new HttpError(500, "Error retrieving app");
      });

      if (!app) {
        throw new HttpError(404, "App not found", {
          errors: { app: { message: "App not found" } },
        });
      }

      const apiKey = await ApiKey.findOne({
        where: { id: keyId, appId },
      }).catch(() => {
        throw new HttpError(500, "Error retrieving API key");
      });

      if (!apiKey) {
        throw new HttpError(404, "API key not found", {
          errors: { apiKey: { message: "API key not found" } },
        });
      }

      await apiKey.destroy().catch(() => {
        throw new HttpError(500, "Error deleting API key");
      });

      res.json({ message: "API key deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
