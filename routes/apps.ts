import express, { Response, NextFunction } from "express";
import { App, DedicatedServerPlan, User, sequelize } from "../db";
import validateSessionToken from "../middlewares/validateSessionToken";
import stripe from "../lib/stripe";
import { HttpError } from "http-errors-enhanced";
import { Transaction } from "sequelize";
import { RequestWithSession } from "../types/http";

const router = express.Router();

interface AppAttributes {
  id: number;
  name: string;
  description: string | null;
  enableCalls: boolean;
  enableVideoCalls: boolean;
  enableConversationLogging: boolean;
  userId: number;
  dedicatedServerPlanId: number | null;
}

interface CreateAppBody {
  name: string;
  description: string;
  enableCalls: boolean;
  enableVideoCalls: boolean;
  enableConversationLogging: boolean;
  dedicatedServerPlanId?: number;
}

interface UpdateAppBody {
  name?: string;
  description?: string;
  enableCalls?: boolean;
  enableVideoCalls?: boolean;
  enableConversationLogging?: boolean;
  dedicatedServerPlanId?: number;
}

interface AppResponse {
  message: string;
  app: AppAttributes;
}

interface AppsResponse {
  message: string;
  apps: AppAttributes[];
}

// POST route to create an application
router.post(
  "/",
  validateSessionToken,
  async (
    req: RequestWithSession<{}, AppResponse, CreateAppBody>,
    res: Response<AppResponse>,
    next: NextFunction
  ) => {
    const {
      name,
      description,
      enableCalls,
      enableVideoCalls,
      enableConversationLogging,
      dedicatedServerPlanId,
    } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      next(new HttpError(401, "Unauthorized"));
      return;
    }
    let transaction: Transaction | null = null;

    try {
      transaction = await sequelize.transaction();

      const user = await User.findByPk(userId);
      if (!user) throw new HttpError(500, "Error retrieving user");

      let dedicatedServerPlan = dedicatedServerPlanId
        ? await DedicatedServerPlan.findByPk(dedicatedServerPlanId)
        : await DedicatedServerPlan.findOne({ where: { size: "Free" } });

      if (!dedicatedServerPlan) {
        await transaction.rollback();
        throw new HttpError(404, "Dedicated server plan not found");
      }

      const newApp = await App.create(
        {
          name,
          description,
          enableCalls,
          enableVideoCalls,
          enableConversationLogging,
          userId,
          dedicatedServerPlanId: dedicatedServerPlan.getDataValue("id"),
        },
        { transaction }
      );

      const stripePriceId = dedicatedServerPlan.getDataValue("stripePriceId");
      if (dedicatedServerPlan && stripePriceId) {
        const stripeCustomerId = user.getDataValue("stripeCustomerId");
        if (!stripeCustomerId) {
          await transaction.rollback();
          throw new HttpError(400, "User has no stripe customer ID");
        }
        const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
        await stripe.subscriptions.create({
          customer: stripeCustomer.id,
          items: [{ price: stripePriceId }],
        });
      }

      await transaction.commit();

      res.status(201).json({
        message: "App created successfully",
        app: newApp.toJSON() as AppAttributes,
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      next(error);
    }
  }
);

// PUT route to update an application
router.put(
  "/:id",
  validateSessionToken,
  async (
    req: RequestWithSession<{ id: string }, AppResponse, UpdateAppBody>,
    res: Response<AppResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      next(new HttpError(401, "Unauthorized"));
      return;
    }

    try {
      const app = await App.findOne({ where: { id, userId } });
      if (!app) {
        throw new HttpError(404, "App not found");
      }

      const updatedApp = await app.update(req.body);

      res.json({
        message: "App updated successfully",
        app: updatedApp.toJSON() as AppAttributes,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE route to delete an application
router.delete(
  "/:id",
  validateSessionToken,
  async (
    req: RequestWithSession<{ id: string }, { message: string }, {}>,
    res: Response<{ message: string }>,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      next(new HttpError(401, "Unauthorized"));
      return;
    }

    try {
      const app = await App.findOne({ where: { id, userId } });
      if (!app) {
        throw new HttpError(404, "App not found");
      }

      await app.destroy();

      res.json({ message: "App deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// GET route to retrieve all applications for a user
router.get(
  "/",
  validateSessionToken,
  async (
    req: RequestWithSession,
    res: Response<AppsResponse>,
    next: NextFunction
  ) => {
    const userId = req.user?.id;
    if (!userId) {
      next(new HttpError(401, "Unauthorized"));
      return;
    }

    try {
      const apps = await App.findAll({ where: { userId } });

      res.json({
        message: "Apps retrieved successfully",
        apps: apps.map(app => app.toJSON() as AppAttributes),
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET route to retrieve a specific application
router.get(
  "/:id",
  validateSessionToken,
  async (
    req: RequestWithSession<{ id: string }, AppResponse, {}>,
    res: Response<AppResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      next(new HttpError(401, "Unauthorized"));
      return;
    }

    try {
      const app = await App.findOne({ where: { id, userId } });
      if (!app) {
        throw new HttpError(404, "App not found");
      }

      res.json({
        message: "App retrieved successfully",
        app: app.toJSON() as AppAttributes,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;