import express, { Request, Response, NextFunction } from "express";
import { Plan } from "../db";
import { HttpError } from "http-errors-enhanced";

const plansRouter = express.Router();

interface PlanData {
  id: number;
  name: string;
  code: string;
  basePrice: number;
  freeDataTransferGB: number;
  pricePerAdditional10GB: number;
  billingPeriod: string;
  supportLevel: string;
  apiIntegration: boolean;
  dedicatedAccountManager: boolean;
}

interface GetPlansSuccessResBody {
  message: string;
  total: number;
  data: PlanData[];
}

plansRouter.get(
  "/",
  async (req: Request, res: Response<GetPlansSuccessResBody>, next: NextFunction) => {
    try {
      const plans = await Plan.findAll().catch((error) => {
        throw new HttpError(500, "Error retrieving plans");
      });

      const planData: PlanData[] = plans.map((plan):PlanData => ({
        id: plan.getDataValue("id"),
        name: plan.getDataValue("name"),
        code: plan.getDataValue("code"),
        basePrice: Number(plan.getDataValue("basePrice")),
        freeDataTransferGB: plan.getDataValue("freeDataTransferGB"),
        pricePerAdditional10GB: Number(plan.getDataValue("pricePerAdditional10GB")),
        billingPeriod: plan.getDataValue("billingPeriod"),
        supportLevel: plan.getDataValue("supportLevel"),
        apiIntegration: plan.getDataValue("apiIntegration"),
        dedicatedAccountManager: plan.getDataValue("dedicatedAccountManager"),
      }));

      res.status(200).json({
        message: "Plans retrieved successfully",
        total: planData.length,
        data: planData,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default plansRouter;