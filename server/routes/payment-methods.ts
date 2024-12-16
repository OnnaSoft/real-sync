import express, { Response, NextFunction } from "express";
import { PaymentMethod, User, UserActivity, sequelize } from "../db";
import validateSessionToken from "../middlewares/validateSessionToken";
import { body, validationResult } from "express-validator";
import stripe from "../lib/stripe";
import { HttpError } from "http-errors-enhanced";
import { Transaction } from "sequelize";
import { RequestWithSession } from "../types/http";
import { getClientMetadata } from "&/lib/utils";

const paymentMethodRouter = express.Router();

interface ErrorsMap {
  [key: string]: { message: string };
}

interface PaymentMethodData {
  id: number;
  type: 'credit' | 'debit';
  last4: string;
  expMonth: string;
  expYear: string;
  brand: string;
  isDefault: boolean;
  stripePaymentMethodId: string;
}

interface GetPaymentMethodsSuccessResBody {
  message: string;
  total: number;
  data: PaymentMethodData[];
}

interface AddPaymentMethodBody {
  type: 'credit' | 'debit';
  last4: string;
  expMonth: string;
  expYear: string;
  brand: string;
  stripePaymentMethodId: string;
}

interface AddPaymentMethodSuccessResBody {
  message: string;
  paymentMethod: PaymentMethodData;
}

interface UpdatePaymentMethodParams {
  id?: string;
}

interface UpdatePaymentMethodBody {
  type?: 'credit' | 'debit';
  last4?: string;
  expMonth?: string;
  expYear?: string;
  brand?: string;
}

interface UpdatePaymentMethodSuccessResBody {
  message: string;
  paymentMethod: PaymentMethodData;
}

interface DeletePaymentMethodParams {
  id?: string;
}

interface DeletePaymentMethodSuccessResBody {
  message: string;
}

interface SetDefaultPaymentMethodParams {
  id?: string;
}

interface SetDefaultPaymentMethodSuccessResBody {
  message: string;
}

const validatePaymentMethod = [
  body("type")
    .isIn(["credit", "debit"])
    .withMessage("Type must be either credit or debit"),
  body("last4")
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage("Last 4 digits must be 4 numbers"),
  body("expMonth")
    .isInt({ min: 1, max: 12 })
    .withMessage("Invalid expiration month"),
  body("expYear")
    .isInt({
      min: new Date().getFullYear(),
      max: new Date().getFullYear() + 20,
    })
    .withMessage("Invalid expiration year"),
  body("stripePaymentMethodId")
    .notEmpty()
    .withMessage("Stripe payment method ID is required"),
];

paymentMethodRouter.get(
  "/",
  validateSessionToken,
  async (req: RequestWithSession, res: Response<GetPaymentMethodsSuccessResBody>, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new HttpError(401, "Unauthorized");
      }

      const paymentMethods = await PaymentMethod.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]],
      });

      UserActivity.create({
        userId: req.user.id,
        activityType: "payment_methods",
        description: "Viewed payment methods",
        metadata: getClientMetadata(req),
      });

      res.status(200).json({
        message: "Payment methods retrieved successfully",
        total: paymentMethods.length,
        data: paymentMethods.map((pm) => pm.toJSON() as PaymentMethodData),
      });
    } catch (error) {
      next(error);
    }
  }
);

paymentMethodRouter.post(
  "/",
  validateSessionToken,
  validatePaymentMethod,
  async (req: RequestWithSession<{}, AddPaymentMethodSuccessResBody, AddPaymentMethodBody>, res: Response<AddPaymentMethodSuccessResBody>, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMap: ErrorsMap = {};
      errors.array().forEach((error) => {
        if (error.type === "field") {
          errorMap[error.path] = { message: error.msg };
        }
      });
      throw new HttpError(400, "Validation error", { errors: errorMap });
    }

    const { type, last4, expMonth, expYear, brand, stripePaymentMethodId } = req.body;

    let transaction: Transaction | null = null;

    try {
      if (!req.user?.id) {
        throw new HttpError(401, "Unauthorized");
      }

      transaction = await sequelize.transaction();

      const user = await User.findByPk(req.user.id);
      if (!user) {
        await transaction.rollback();
        throw new HttpError(404, "User not found", {
          errors: { user: { message: "User not found" } },
        });
      }

      let stripeCustomerId = user.getDataValue("stripeCustomerId");

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.getDataValue("email"),
          name: user.getDataValue("fullname"),
        });

        stripeCustomerId = customer.id;

        await user.update({ stripeCustomerId }, { transaction });
      }

      await stripe.paymentMethods.attach(stripePaymentMethodId, {
        customer: stripeCustomerId,
      });

      const existingDefaultMethod = await PaymentMethod.findOne({
        where: { userId: req.user.id, isDefault: true },
        transaction,
      });

      const newPaymentMethod = await PaymentMethod.create(
        {
          userId: req.user.id,
          type,
          last4,
          expMonth,
          expYear,
          brand,
          isDefault: !existingDefaultMethod,
          stripePaymentMethodId,
        },
        { transaction }
      );

      if (!existingDefaultMethod) {
        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: { default_payment_method: stripePaymentMethodId },
        });
      }

      await transaction.commit();

      UserActivity.create({
        userId: req.user.id,
        activityType: "payment_method_added",
        description: "Added payment method",
        metadata: getClientMetadata(req),
      });

      res.status(201).json({
        message: "Payment method added successfully",
        paymentMethod: newPaymentMethod.toJSON() as PaymentMethodData,
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      if (error instanceof Error && error.name === "SequelizeUniqueConstraintError") {
        const newError = new HttpError(400, "Payment method exists", {
          errors: {
            stripePaymentMethodId: { message: "Payment method exists" },
          },
        });
        return next(newError);
      }
      next(error);
    }
  }
);

paymentMethodRouter.put(
  "/:id",
  validateSessionToken,
  validatePaymentMethod,
  async (req: RequestWithSession<UpdatePaymentMethodParams, UpdatePaymentMethodSuccessResBody, UpdatePaymentMethodBody>, res: Response<UpdatePaymentMethodSuccessResBody>, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMap: ErrorsMap = {};
      errors.array().forEach((error) => {
        if (error.type === "field") {
          errorMap[error.path] = { message: error.msg };
        }
      });
      throw new HttpError(400, "Validation error", { errors: errorMap });
    }

    const { id } = req.params;
    const { type, last4, expMonth, expYear, brand } = req.body;

    try {
      if (!req.user?.id) {
        throw new HttpError(401, "Unauthorized");
      }

      const paymentMethod = await PaymentMethod.findOne({
        where: { id, userId: req.user.id },
      });

      if (!paymentMethod) {
        throw new HttpError(404, "Payment method not found", {
          errors: { id: { message: "Payment method not found" } },
        });
      }

      await stripe.paymentMethods.update(paymentMethod.getDataValue("stripePaymentMethodId"), {
        card: {
          exp_month: parseInt(expMonth ?? "0"),
          exp_year: parseInt(expYear ?? "0"),
        },
      });

      await paymentMethod.update({ type, last4, expMonth, expYear, brand });

      UserActivity.create({
        userId: req.user.id,
        activityType: "payment_method_updated",
        description: "Updated payment method",
        metadata: getClientMetadata(req),
      });

      res.status(200).json({
        message: "Payment method updated successfully",
        paymentMethod: paymentMethod.toJSON() as PaymentMethodData,
      });
    } catch (error) {
      next(error);
    }
  }
);

paymentMethodRouter.delete(
  "/:id",
  validateSessionToken,
  async (req: RequestWithSession<DeletePaymentMethodParams, DeletePaymentMethodSuccessResBody>, res: Response<DeletePaymentMethodSuccessResBody>, next: NextFunction) => {
    const { id } = req.params;

    try {
      if (!req.user?.id) {
        throw new HttpError(401, "Unauthorized");
      }

      const paymentMethod = await PaymentMethod.findOne({
        where: { id, userId: req.user.id },
      });

      if (!paymentMethod) {
        throw new HttpError(404, "Payment method not found", {
          errors: { id: { message: "Payment method not found" } },
        });
      }

      if (paymentMethod.getDataValue("isDefault")) {
        throw new HttpError(400, "Cannot delete default payment method", {
          errors: {
            id: { message: "Cannot delete the default payment method" },
          },
        });
      }

      await stripe.paymentMethods.detach(paymentMethod.getDataValue("stripePaymentMethodId"))
        .catch(() => {
          throw new HttpError(400, "Failed to delete payment method", {
            errors: {
              id: { message: "Failed to delete payment method" },
            },
          });
        });

      await paymentMethod.destroy();

      UserActivity.create({
        userId: req.user.id,
        activityType: "payment_method_deleted",
        description: "Deleted payment method",
        metadata: getClientMetadata(req),
      });

      res.status(200).json({ message: "Payment method deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

paymentMethodRouter.post(
  "/:id/set-default",
  validateSessionToken,
  async (
    req: RequestWithSession<SetDefaultPaymentMethodParams, SetDefaultPaymentMethodSuccessResBody>,
    res: Response<SetDefaultPaymentMethodSuccessResBody>, next: NextFunction
  ) => {
    const { id } = req.params;

    let transaction: Transaction | null = null;
    try {
      if (!req.user?.id) {
        throw new HttpError(401, "Unauthorized");
      }

      transaction = await sequelize.transaction();

      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new HttpError(404, "User not found", {
          errors: { user: { message: "User not found" } },
        });
      }

      await PaymentMethod.update(
        { isDefault: false },
        {
          where: { userId: req.user.id },
          transaction,
        }
      );

      const [updatedRows] = await PaymentMethod.update(
        { isDefault: true },
        {
          where: { id, userId: req.user.id },
          transaction,
        }
      );

      if (updatedRows === 0) {
        await transaction.rollback();
        throw new HttpError(404, "Payment method not found", {
          errors: { id: { message: "Payment method not found" } },
        });
      }

      const updatedPaymentMethod = await PaymentMethod.findByPk(id);
      if (!updatedPaymentMethod) {
        throw new Error("Updated payment method not found");
      }

      const stripeCustomerId = user.getDataValue("stripeCustomerId");
      if (!stripeCustomerId) {
        throw new Error("User does not have a Stripe customer ID");
      }
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: updatedPaymentMethod.getDataValue("stripePaymentMethodId"),
        },
      });

      UserActivity.create({
        userId: req.user.id,
        activityType: "payment_method_set_default",
        description: "Set payment method as default",
        metadata: getClientMetadata(req),
      });

      await transaction.commit();

      res.status(200).json({ message: "Payment method set as default successfully" });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.trace(error);
      next(error);
    }
  }
);

export default paymentMethodRouter;