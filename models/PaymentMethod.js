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
 * @returns {PaymentMethodModel & {associate: (models: any) => void}}
 */
const PaymentMethodModel = (sequelize) => {
  /** @type {PaymentMethodModel & { associate: (models: any) => void }} */
  // @ts-ignore
  const PaymentMethod = sequelize.define(
    "paymentMethod",
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
        type: DataTypes.ENUM("credit", "debit"),
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

  PaymentMethod.associate =
    /**
     * @param {{ [x:string]: import("sequelize").ModelStatic<Model> }} models
     */
    (models) => {
      PaymentMethod.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    };

  return PaymentMethod;
};

export default PaymentMethodModel;
