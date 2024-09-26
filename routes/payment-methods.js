import express from "express";
import { PaymentMethod, User, sequelize } from "../db.js";
import validateSessionToken from "../middlewares/validateSessionToken.js";
import { body, validationResult } from "express-validator";
import stripe from "../lib/stripe.js";

const router = express.Router();

/**
 * @typedef {import('../types/http.d.ts').ErrorResBody} ErrorResBody
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
   * @param {express.Response<GetPaymentMethodsSuccessResBody | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    try {
      const paymentMethods = await PaymentMethod.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        message: "Payment methods retrieved successfully",
        total: paymentMethods.length,
        data: paymentMethods.map((pm) => pm.toJSON()),
      });
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
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
   * @param {express.Request<{}, AddPaymentMethodSuccessResBody | ErrorResBody, AddPaymentMethodBody> & { user: import('../types/models').User }} req
   * @param {express.Response<AddPaymentMethodSuccessResBody | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      /** @type {ErrorsMap} */
      const errorMap = {};
      errors.array().forEach((error, index) => {
        // @ts-ignore
        errorMap[error.path] = { message: error.msg };
      });
      return res.status(400).json({ errors: errorMap });
    }

    const { type, last4, expMonth, expYear, brand, stripePaymentMethodId } =
      req.body;

    const transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          errors: { user: { message: "User not found" } },
        });
      }

      let stripeCustomerId = user.getDataValue("stripeCustomerId");

      if (!stripeCustomerId) {
        // Create a new Stripe customer
        const customer = await stripe.customers.create({
          email: user.getDataValue("email"),
          name: user.getDataValue("fullname"),
        });

        stripeCustomerId = customer.id;

        // Update the user with the new Stripe customer ID
        await user.update({ stripeCustomerId }, { transaction });
      }

      // Attach the payment method to the Stripe customer
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

      // If this is the first payment method, set it as the default for the customer
      if (!existingDefaultMethod) {
        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: { default_payment_method: stripePaymentMethodId },
        });
      }

      await transaction.commit();

      res.status(201).json({
        message: "Payment method added successfully",
        paymentMethod: newPaymentMethod.toJSON(),
      });
    } catch (error) {
      await transaction.rollback();
      /** @type {Error} */
      // @ts-ignore
      const err = error;
      if (err.name === "SequelizeUniqueConstraintError") {
        res.status(400).json({
          errors: {
            stripePaymentMethodId: { message: "Payment method exists" },
          },
        });
        return;
      }
      console.error("Error adding payment method:", err);

      res.status(500).json({ errors: { server: { message: "Server error" } } });
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
   * @param {express.Request<UpdatePaymentMethodParams, UpdatePaymentMethodSuccessResBody | ErrorResBody, UpdatePaymentMethodBody> & { user: import('../types/models').User }} req
   * @param {express.Response<UpdatePaymentMethodSuccessResBody | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      /** @type {ErrorsMap} */
      const errorMap = {};
      errors.array().forEach((error, index) => {
        // @ts-ignore
        errorMap[error.path] = { message: error.msg };
      });
      return res.status(400).json({ errors: errorMap });
    }

    const { id } = req.params;
    const { type, last4, expMonth, expYear, brand } = req.body;

    try {
      const paymentMethod = await PaymentMethod.findOne({
        where: { id, userId: req.user.id },
      });

      if (!paymentMethod) {
        return res.status(404).json({
          errors: { id: { message: "Payment method not found" } },
        });
      }

      // Update the payment method in Stripe
      await stripe.paymentMethods.update(
        paymentMethod.getDataValue("stripePaymentMethodId"),
        {
          card: {
            exp_month: parseInt(expMonth ?? "0"),
            exp_year: parseInt(expYear ?? "0"),
          },
        }
      );

      await paymentMethod.update({ type, last4, expMonth, expYear, brand });

      res.status(200).json({
        message: "Payment method updated successfully",
        paymentMethod: paymentMethod.toJSON(),
      });
    } catch (error) {
      console.error("Error updating payment method:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
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
   * @param {express.Request<DeletePaymentMethodParams, DeletePaymentMethodSuccessResBody | ErrorResBody> & { user: import('../types/models').User}} req
   * @param {express.Response<DeletePaymentMethodSuccessResBody | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    const { id } = req.params;

    try {
      const paymentMethod = await PaymentMethod.findOne({
        where: { id, userId: req.user.id },
      });

      if (!paymentMethod) {
        return res.status(404).json({
          errors: { id: { message: "Payment method not found" } },
        });
      }

      if (paymentMethod.getDataValue("isDefault")) {
        return res.status(400).json({
          errors: {
            id: { message: "Cannot delete the default payment method" },
          },
        });
      }

      // Detach the payment method from the Stripe customer
      await stripe.paymentMethods.detach(
        paymentMethod.getDataValue("stripePaymentMethodId")
      );

      await paymentMethod.destroy();

      res.status(200).json({ message: "Payment method deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
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
   * @param {express.Request<SetDefaultPaymentMethodParams, SetDefaultPaymentMethodSuccessResBody | ErrorResBody> & { user: import('../types/models').User}} req
   * @param {express.Response<SetDefaultPaymentMethodSuccessResBody | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    const { id } = req.params;

    try {
      // Start a transaction
      const transaction = await sequelize.transaction();

      try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
          throw new Error("User not found");
        }

        // Set all payment methods for this user to non-default
        await PaymentMethod.update(
          { isDefault: false },
          {
            where: { userId: req.user.id },
            transaction,
          }
        );

        // Set the specified payment method as default
        const [updatedRows] = await PaymentMethod.update(
          { isDefault: true },
          {
            where: { id, userId: req.user.id },
            transaction,
          }
        );

        if (updatedRows === 0) {
          await transaction.rollback();
          return res.status(404).json({
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
        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: {
            default_payment_method: updatedPaymentMethod.getDataValue(
              "stripePaymentMethodId"
            ),
          },
        });

        // Commit the transaction
        await transaction.commit();

        res
          .status(200)
          .json({ message: "Payment method set as default successfully" });
      } catch (error) {
        // If there's an error, rollback the transaction
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error("Error setting default payment method:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
    }
  }
);

export default router;
