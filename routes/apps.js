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

const router = express.Router();

/**
 * @typedef {import('../types/models').App} App
 * @typedef {import('../types/models').ApiKey} ApiKey
 * @typedef {import('../types/models').DedicatedServerPlan} DedicatedServerPlan
 * @typedef {import('../types/models').User} User
 * @typedef {import('../types/http').ErrorResBody} ErrorResBody
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
   * @param {express.Request<{}, CreateAppResponse | ErrorResBody, CreateAppBody> & { user: User }} req
   * @param {express.Response<CreateAppResponse | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
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
        return res
          .status(404)
          .json({ errors: { user: { message: "User not found" } } });
      }

      /**
       * @type {import('sequelize').Model<import('../models/Plan.js').PlanAttributes>}
       */
      // @ts-ignore
      const activePlan = user["user-plans"][0].plan;

      if (!activePlan) {
        await transaction.rollback();
        return res.status(400).json({
          errors: { plan: { message: "User does not have an active plan" } },
        });
      }

      if (activePlan.getDataValue("maxApps") !== 0 && !dedicatedServerPlanId) {
        // 0 means unlimited
        const appCount = await App.count({ where: { userId } });
        if (appCount >= activePlan.getDataValue("maxApps")) {
          await transaction.rollback();
          return res.status(400).json({
            errors: {
              app: {
                message: "Maximum number of apps reached for the current plan",
              },
            },
          });
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
          return res.status(404).json({
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
        await stripe.subscriptions.create({
          customer: stripeCustomer.id,
          // @ts-ignore
          items: [{ price: dedicatedServerPlan.stripePriceId }],
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
      console.error("Error creating app:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
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
   * @param {express.Request<{ id: string }, UpdateAppResponse | ErrorResBody, UpdateAppBody> & { user: User }} req
   * @param {express.Response<UpdateAppResponse | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    const { id } = req.params;
    const {
      name,
      description,
      enableCalls,
      enableVideoCalls,
      enableConversationLogging,
    } = req.body;
    const userId = req.user.id;

    const transaction = await sequelize.transaction();

    try {
      const app = await App.findOne({
        where: { id, userId },
        include: [{ model: DedicatedServerPlan, as: "dedicatedServerPlan" }],
      });

      if (!app) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ errors: { app: { message: "App not found" } } });
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
      await transaction.rollback();
      console.error("Error updating app:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
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
   * @param {express.Request<{ id: string }, DeleteAppResponse | ErrorResBody> & { user: User }} req
   * @param {express.Response<DeleteAppResponse | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await sequelize.transaction();

    try {
      const app = await App.findOne({
        where: { id, userId },
        include: [{ model: DedicatedServerPlan, as: "dedicatedServerPlan" }],
      });

      if (!app) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ errors: { app: { message: "App not found" } } });
      }

      // @ts-ignore
      if (app.dedicatedServerPlan) {
        const user = await User.findByPk(userId);
        const stripeCustomer = await stripe.customers.retrieve(
          // @ts-ignore
          user.stripeCustomerId
        );
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomer.id,
          // @ts-ignore
          price: app.dedicatedServerPlan.stripePriceId,
        });

        if (subscriptions.data.length > 0) {
          // @ts-ignore
          await stripe.subscriptions.del(subscriptions.data[0].id);
        }
      }

      await ApiKey.destroy({ where: { appId: id }, transaction });
      await app.destroy({ transaction });

      await transaction.commit();

      res.json({ message: "App and associated API keys deleted successfully" });
    } catch (error) {
      await transaction.rollback();
      console.error("Error deleting app:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
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
   * @param {express.Response<GetAppsResponse | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    const userId = req.user.id;

    try {
      const apps = await App.findAll({
        where: { userId },
        include: [
          { model: ApiKey, as: "apiKeys" },
          { model: DedicatedServerPlan, as: "dedicatedServerPlan" },
        ],
      });

      res.json({
        message: "Apps retrieved successfully",
        // @ts-ignore
        apps,
      });
    } catch (error) {
      console.error("Error retrieving apps:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
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
   * @param {express.Request<{ id: string }, CreateApiKeyResponse | ErrorResBody> & { user: User }} req
   * @param {express.Response<CreateApiKeyResponse | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const app = await App.findOne({ where: { id, userId } });

      if (!app) {
        return res
          .status(404)
          .json({ errors: { app: { message: "App not found" } } });
      }

      const apiKey = await ApiKey.create({
        key: `api-${Math.random().toString(36).substr(2, 9)}`,
        // @ts-ignore
        appId: id,
      });

      res.status(201).json({
        message: "API key created successfully",
        // @ts-ignore
        apiKey,
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
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
   * @param {express.Request<{ appId: string, keyId: string }, DeleteApiKeyResponse | ErrorResBody> & { user: User }} req
   * @param {express.Response<DeleteApiKeyResponse | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    const { appId, keyId } = req.params;
    const userId = req.user.id;

    try {
      const app = await App.findOne({ where: { id: appId, userId } });

      if (!app) {
        return res
          .status(404)
          .json({ errors: { app: { message: "App not found" } } });
      }

      const apiKey = await ApiKey.findOne({ where: { id: keyId, appId } });

      if (!apiKey) {
        return res
          .status(404)
          .json({ errors: { apiKey: { message: "API key not found" } } });
      }

      await apiKey.destroy();

      res.json({ message: "API key deleted successfully" });
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
    }
  }
);

export default router;
