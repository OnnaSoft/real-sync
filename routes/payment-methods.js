import express from "express";
import { PaymentMethod, sequelize } from "../db.js"; // Assuming you've set up your models index file
import validateSessionToken from "../middlewares/validateSessionToken.js";

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
 */

/**
 * @typedef {Object} GetPaymentMethodsSuccessResBody
 * @property {PaymentMethodData[]} paymentMethods - Array of payment methods
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

      res
        .status(200)
        .json({ paymentMethods: paymentMethods.map((pm) => pm.toJSON()) });
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
    }
  }
);

/**
 * @typedef {Object} AddPaymentMethodBody
 * @property {string} type
 * @property {string} last4
 * @property {string} expMonth
 * @property {string} expYear
 * @property {string} brand
 */

/**
 * @typedef {Object} AddPaymentMethodSuccessResBody
 * @property {string} message - Success message
 * @property {PaymentMethodData} paymentMethod - Newly added payment method
 */

router.post(
  "/",
  validateSessionToken,
  /**
   * POST /payment-methods
   * @param {express.Request<{}, AddPaymentMethodSuccessResBody | ErrorResBody, AddPaymentMethodBody> & { user: import('../types/models').User }} req
   * @param {express.Response<AddPaymentMethodSuccessResBody | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
    const { type, last4, expMonth, expYear, brand } = req.body;

    if (type !== "credit" && type !== "debit") {
      return res
        .status(400)
        .json({ errors: { type: { message: "Invalid payment method type" } } });
    }

    try {
      const newPaymentMethod = await PaymentMethod.create({
        userId: req.user.id,
        type,
        last4,
        expMonth,
        expYear,
        brand,
        isDefault: false, // New payment methods are not default by default
      });

      res.status(201).json({
        message: "Payment method added successfully",
        paymentMethod: newPaymentMethod.toJSON(),
      });
    } catch (error) {
      /**
       * @type {import("sequelize").ValidationError}
       */
      // @ts-ignore
      const err = error;

      if (err.name === "SequelizeValidationError") {
        /** @type {ErrorsMap} */
        const errors = {};
        err.errors.forEach((validationError, index) => {
          const errorKey = validationError.path || `error_${index}`;
          errors[errorKey] = { message: validationError.message };
        });
        return res.status(400).json({ errors });
      }
      console.error("Error adding payment method:", error);
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
 * @property {string} [type]
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
  /**
   * PUT /payment-methods/:id
   * @param {express.Request<UpdatePaymentMethodParams, UpdatePaymentMethodSuccessResBody | ErrorResBody, UpdatePaymentMethodBody> & { user: import('../types/models').User }} req
   * @param {express.Response<UpdatePaymentMethodSuccessResBody | ErrorResBody>} res
   */
  // @ts-ignore
  async (req, res) => {
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

      await paymentMethod.update({
        last4,
        expMonth,
        expYear,
        brand,
        type: type === "credit" || type === "debit" ? type : undefined,
      });

      res.status(200).json({
        message: "Payment method updated successfully",
        paymentMethod: paymentMethod.toJSON(),
      });
    } catch (error) {
      /**
       * @type {import("sequelize").ValidationError}
       */
      // @ts-ignore
      const err = error;

      if (err.name === "SequelizeValidationError") {
        /** @type {ErrorsMap} */
        const errors = {};
        err.errors.forEach((validationError, index) => {
          const errorKey = validationError.path || `error_${index}`;
          errors[errorKey] = { message: validationError.message };
        });
        return res.status(400).json({ errors });
      }
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
      const result = await PaymentMethod.destroy({
        where: { id, userId: req.user.id },
      });

      if (result === 0) {
        return res.status(404).json({
          errors: { id: { message: "Payment method not found" } },
        });
      }

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
