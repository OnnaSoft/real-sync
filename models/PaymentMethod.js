import { DataTypes } from "sequelize";
import { Model, Sequelize } from "sequelize";

/**
 * @typedef {Object} PaymentMethodAttributes
 * @property {number} id
 * @property {number} userId
 * @property {'credit' | 'debit'} type
 * @property {string} last4
 * @property {string} expMonth
 * @property {string} expYear
 * @property {string} brand
 * @property {boolean} isDefault
 * @property {string} stripePaymentMethodId
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<PaymentMethodAttributes, Omit<PaymentMethodAttributes, 'id'>>>} PaymentMethodModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {PaymentMethodModel}
 */
const PaymentMethodModel = (sequelize) => {
  const PaymentMethod = sequelize.define(
    "payment-method",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [["credit", "debit"]],
            msg: "Type must be either 'credit' or 'debit'",
          },
        },
      },
      last4: {
        type: DataTypes.STRING(4),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Last 4 digits are required" },
          len: {
            args: [4, 4],
            msg: "Last 4 digits must be exactly 4 characters long",
          },
          isNumeric: { msg: "Last 4 digits must be numeric" },
        },
      },
      expMonth: {
        type: DataTypes.STRING(2),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Expiration month is required" },
          len: {
            args: [1, 2],
            msg: "Expiration month must be 1 or 2 characters long",
          },
          isNumeric: { msg: "Expiration month must be numeric" },
          min: { args: [1], msg: "Expiration month must be between 1 and 12" },
          max: { args: [12], msg: "Expiration month must be between 1 and 12" },
        },
      },
      expYear: {
        type: DataTypes.STRING(4),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Expiration year is required" },
          len: {
            args: [4, 4],
            msg: "Expiration year must be exactly 4 characters long",
          },
          isNumeric: { msg: "Expiration year must be numeric" },
        },
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      stripePaymentMethodId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Stripe payment method ID is required" },
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  return PaymentMethod;
};

export default PaymentMethodModel;
