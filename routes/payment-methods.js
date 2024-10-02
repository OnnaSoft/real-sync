import express from "express";
import { PaymentMethod, User, sequelize } from "../db.js";
import validateSessionToken from "../middlewares/validateSessionToken.js";
import { body, validationResult } from "express-validator";
import stripe from "../lib/stripe.js";
import { HttpError } from "http-errors-enhanced";
import { Transaction } from "sequelize";

const router = express.Router();

/**
 * @typedef {import('../types/http.d.ts').ErrorsMap} ErrorsMap
 */

/**
 * @typedef {Object} PaymentMethodData
 * @property {number} id - ID of the payment method
 * @property {string} type - Type of the payment method (credit or debit)
 * @property {string} last4 - Last 4 digits of the card
 * @property {string} expMonth - Expiration month
 * @property {string} expYear - Expiration year
 * @property {string} brand - Brand of the card
 * @property {boolean} isDefault - Whether this is the default payment method
 * @property {string} stripePaymentMethodId - Stripe Payment Method ID
 */

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

/**
 * @typedef {Object} GetPaymentMethodsSuccessResBody
 * @property {string} message - Success message
 * @property {number} total - Total number of records
 * @property {PaymentMethodData[]} data - Array of payment methods
 */

router.get(
  "/",
  validateSessionToken,
  /**
   * GET /payment-methods
   * @param {express.Request & { user: import('../types/models').User }} req
   * @param {express.Response<GetPaymentMethodsSuccessResBody>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    try {
      const paymentMethods = await PaymentMethod.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]],
      }).catch(() => {
        throw new HttpError(500, "Error retrieving payment methods");
      });

      res.status(200).json({
        message: "Payment methods retrieved successfully",
        total: paymentMethods.length,
        data: paymentMethods.map((pm) => pm.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @typedef {Object} AddPaymentMethodBody
 * @property {'credit' | 'debit'} type
 * @property {string} last4
 * @property {string} expMonth
 * @property {string} expYear
 * @property {string} brand
 * @property {string} stripePaymentMethodId
 */

/**
 * @typedef {Object} AddPaymentMethodSuccessResBody
 * @property {string} message - Success message
 * @property {PaymentMethodData} paymentMethod - Newly added payment method
 */

router.post(
  "/",
  validateSessionToken,
  validatePaymentMethod,
  /**
   * POST /payment-methods
   * @param {express.Request<{}, AddPaymentMethodSuccessResBody, AddPaymentMethodBody> & { user: import('../types/models').User }} req
   * @param {express.Response<AddPaymentMethodSuccessResBody>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      /** @type {ErrorsMap} */
      const errorMap = {};
      errors.array().forEach((error) => {
        // @ts-ignore
        errorMap[error.path] = { message: error.msg };
      });
      throw new HttpError(400, "Validation error", { errors: errorMap });
    }

    const { type, last4, expMonth, expYear, brand, stripePaymentMethodId } =
      req.body;

    /** @type{Transaction | null} */
    let transaction = null;

    try {
      transaction = await sequelize.transaction().catch(() => {
        throw new HttpError(500, "Error starting transaction");
      });

      const user = await User.findByPk(req.user.id).catch(() => {
        throw new HttpError(500, "Error retrieving user");
      });
      if (!user) {
        await transaction.rollback().catch(() => {
          throw new HttpError(500, "Error rolling back transaction");
        });
        throw new HttpError(404, "User not found", {
          errors: { user: { message: "User not found" } },
        });
      }

      let stripeCustomerId = user.getDataValue("stripeCustomerId");

      if (!stripeCustomerId) {
        // Create a new Stripe customer
        const customer = await stripe.customers
          .create({
            email: user.getDataValue("email"),
            name: user.getDataValue("fullname"),
          })
          .catch(() => {
            throw new HttpError(500, "Error creating Stripe customer");
          });

        stripeCustomerId = customer.id;

        // Update the user with the new Stripe customer ID
        await user.update({ stripeCustomerId }, { transaction }).catch(() => {
          throw new HttpError(500, "Error updating user");
        });
      }

      // Attach the payment method to the Stripe customer
      await stripe.paymentMethods
        .attach(stripePaymentMethodId, {
          customer: stripeCustomerId,
        })
        .catch(() => {
          throw new HttpError(500, "Error attaching payment method");
        });

      const existingDefaultMethod = await PaymentMethod.findOne({
        where: { userId: req.user.id, isDefault: true },
        transaction,
      }).catch(() => {
        throw new HttpError(500, "Error retrieving payment method");
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
      ).catch(() => {
        throw new HttpError(500, "Error creating payment method");
      });

      // If this is the first payment method, set it as the default for the customer
      if (!existingDefaultMethod) {
        await stripe.customers
          .update(stripeCustomerId, {
            invoice_settings: { default_payment_method: stripePaymentMethodId },
          })
          .catch(() => {
            throw new HttpError(500, "Error updating default payment method");
          });
      }

      await transaction.commit().catch(() => {
        throw new HttpError(500, "Error committing transaction");
      });

      res.status(201).json({
        message: "Payment method added successfully",
        paymentMethod: newPaymentMethod.toJSON(),
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      /** @type {Error} */
      // @ts-ignore
      const err = error;
      if (err.name === "SequelizeUniqueConstraintError") {
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

/**
 * @typedef {Object} UpdatePaymentMethodParams
 * @property {string} id - ID of the payment method to update
 */

/**
 * @typedef {Object} UpdatePaymentMethodBody
 * @property {'credit' | 'debit'} [type]
 * @property {string} [last4]
 * @property {string} [expMonth]
 * @property {string} [expYear]
 * @property {string} [brand]
 */

/**
 * @typedef {Object} UpdatePaymentMethodSuccessResBody
 * @property {string} message - Success message
 * @property {PaymentMethodData} paymentMethod - Updated payment method
 */

router.put(
  "/:id",
  validateSessionToken,
  validatePaymentMethod,
  /**
   * PUT /payment-methods/:id
   * @param {express.Request<UpdatePaymentMethodParams, UpdatePaymentMethodSuccessResBody, UpdatePaymentMethodBody> & { user: import('../types/models').User }} req
   * @param {express.Response<UpdatePaymentMethodSuccessResBody>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      /** @type {ErrorsMap} */
      const errorMap = {};
      errors.array().forEach((error, index) => {
        // @ts-ignore
        errorMap[error.path] = { message: error.msg };
      });
      throw new HttpError(400, "Validation error", { errors: errorMap });
    }

    const { id } = req.params;
    const { type, last4, expMonth, expYear, brand } = req.body;

    try {
      const paymentMethod = await PaymentMethod.findOne({
        where: { id, userId: req.user.id },
      }).catch(() => {
        throw new HttpError(500, "Error retrieving payment method");
      });

      if (!paymentMethod) {
        throw new HttpError(404, "Payment method not found", {
          errors: { id: { message: "Payment method not found" } },
        });
      }

      // Update the payment method in Stripe
      await stripe.paymentMethods
        .update(paymentMethod.getDataValue("stripePaymentMethodId"), {
          card: {
            exp_month: parseInt(expMonth ?? "0"),
            exp_year: parseInt(expYear ?? "0"),
          },
        })
        .catch((error) => {
          throw new HttpError(500, "Error updating payment method", {
            errors: { server: { message: error.message } },
          });
        });

      await paymentMethod
        .update({ type, last4, expMonth, expYear, brand })
        .catch((error) => {
          throw new HttpError(500, "Error updating payment method", {
            errors: { server: { message: error.message } },
          });
        });

      res.status(200).json({
        message: "Payment method updated successfully",
        paymentMethod: paymentMethod.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @typedef {Object} DeletePaymentMethodParams
 * @property {string} id - ID of the payment method to delete
 */

/**
 * @typedef {Object} DeletePaymentMethodSuccessResBody
 * @property {string} message - Success message
 */

router.delete(
  "/:id",
  validateSessionToken,
  /**
   * DELETE /payment-methods/:id
   * @param {express.Request<DeletePaymentMethodParams, DeletePaymentMethodSuccessResBody> & { user: import('../types/models').User}} req
   * @param {express.Response<DeletePaymentMethodSuccessResBody>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const paymentMethod = await PaymentMethod.findOne({
        where: { id, userId: req.user.id },
      }).catch(() => {
        throw new HttpError(500, "Error retrieving payment method");
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

      // Detach the payment method from the Stripe customer
      await stripe.paymentMethods
        .detach(paymentMethod.getDataValue("stripePaymentMethodId"))
        .catch(() => {
          throw new HttpError(500, "Error deleting payment method");
        });

      await paymentMethod.destroy().catch(() => {
        throw new HttpError(500, "Error deleting payment method");
      });

      res.status(200).json({ message: "Payment method deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @typedef {Object} SetDefaultPaymentMethodParams
 * @property {string} id - ID of the payment method to set as default
 */

/**
 * @typedef {Object} SetDefaultPaymentMethodSuccessResBody
 * @property {string} message - Success message
 */

router.post(
  "/:id/set-default",
  validateSessionToken,
  /**
   * POST /payment-methods/:id/set-default
   * @param {express.Request<SetDefaultPaymentMethodParams, SetDefaultPaymentMethodSuccessResBody> & { user: import('../types/models').User}} req
   * @param {express.Response<SetDefaultPaymentMethodSuccessResBody>} res
   * @param {express.NextFunction} next
   */
  // @ts-ignore
  async (req, res, next) => {
    const { id } = req.params;

    /** @type {Transaction | null} */
    let transaction = null;
    try {
      // Start a transaction
      transaction = await sequelize.transaction().catch(() => {
        throw new HttpError(500, "Error starting transaction");
      });

      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new HttpError(404, "User not found", {
          errors: { user: { message: "User not found" } },
        });
      }

      // Set all payment methods for this user to non-default
      await PaymentMethod.update(
        { isDefault: false },
        {
          where: { userId: req.user.id },
          transaction,
        }
      ).catch(() => {
        throw new HttpError(500, "Error updating payment methods");
      });

      // Set the specified payment method as default
      const [updatedRows] = await PaymentMethod.update(
        { isDefault: true },
        {
          where: { id, userId: req.user.id },
          transaction,
        }
      );

      if (updatedRows === 0) {
        await transaction.rollback().catch(() => {
          throw new HttpError(500, "Error rolling back transaction");
        });
        throw new HttpError(404, "Payment method not found", {
          errors: { id: { message: "Payment method not found" } },
        });
      }

      const updatedPaymentMethod = await PaymentMethod.findByPk(id);
      if (!updatedPaymentMethod) {
        throw new Error("Updated payment method not found");
      }

      // Update the default payment method in Stripe
      const stripeCustomerId = user.getDataValue("stripeCustomerId");
      if (!stripeCustomerId) {
        throw new Error("User does not have a Stripe customer ID");
      }
      await stripe.customers
        .update(stripeCustomerId, {
          invoice_settings: {
            default_payment_method: updatedPaymentMethod.getDataValue(
              "stripePaymentMethodId"
            ),
          },
        })
        .catch(() => {
          throw new HttpError(500, "Error updating default payment method");
        });

      // Commit the transaction
      await transaction.commit().catch(() => {
        throw new HttpError(500, "Error committing transaction");
      });

      res
        .status(200)
        .json({ message: "Payment method set as default successfully" });
    } catch (error) {
      // If there's an error, rollback the transaction
      if (transaction) await transaction.rollback();
      next(error);
    }
  }
);

export default router;
