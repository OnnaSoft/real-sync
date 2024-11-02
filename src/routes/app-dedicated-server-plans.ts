import express, { Request, Response, NextFunction } from 'express';
import { DedicatedServerPlan } from '../db';
import { HttpError } from 'http-errors-enhanced';

const router = express.Router();

interface DedicatedServerPlanAttributes {
  id: number;
  size: "Free" | "Small" | "Medium" | "Large" | "XLarge" | "XXLarge";
  price: number;
  stripePriceId: string | null;
  description: string;
}

interface GetDedicatedServerPlansResponse {
  message: string;
  data: DedicatedServerPlanAttributes[];
  total: number;
}

router.get(
  '/',
  async (req: Request, res: Response<GetDedicatedServerPlansResponse>, next: NextFunction) => {
    try {
      const plans = await DedicatedServerPlan.findAll({
        order: [['price', 'ASC']],
      }).catch((error) => {
        throw new HttpError(500, 'Error retrieving dedicated server plans');
      });
      res.json({
        message: 'Dedicated server plans retrieved successfully',
        data: plans.map((plan) => plan.toJSON()),
        total: plans.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

interface GetDedicatedServerPlanResponse {
  message: string;
  data: DedicatedServerPlanAttributes;
}

router.get(
  '/:id',
  async (
    req: Request<{ id: string }>,
    res: Response<GetDedicatedServerPlanResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params;
    try {
      const plan = await DedicatedServerPlan.findByPk(id).catch((error) => {
        throw new HttpError(500, 'Error retrieving dedicated server plan');
      });
      if (!plan) {
        throw new HttpError(404, 'Dedicated server plan not found', {
          errors: { plan: { message: 'Dedicated server plan not found' } },
        });
      }
      res.json({
        message: 'Dedicated server plan retrieved successfully',
        data: plan.toJSON() as DedicatedServerPlanAttributes,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;