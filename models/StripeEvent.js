import { DataTypes } from "sequelize";
import { Model, Sequelize } from "sequelize";

/**
 * @typedef {Object} StripeEventAttributes
 * @property {string} id
 * @property {string} object
 * @property {string | null} accountCountry
 * @property {string | null} accountName
 * @property {number} amountDue
 * @property {number} amountPaid
 * @property {number} amountRemaining
 * @property {number} attemptCount
 * @property {boolean} attempted
 * @property {boolean | null} autoAdvance
 * @property {string | null} billingReason
 * @property {string} collectionMethod
 * @property {number} created
 * @property {string} currency
 * @property {string | null} customerId
 * @property {string | null} customerEmail
 * @property {string | null} customerName
 * @property {string | null} description
 * @property {number | null} dueDate
 * @property {number | null} effectiveAt
 * @property {number | null} endingBalance
 * @property {string | null} hostedInvoiceUrl
 * @property {string | null} invoicePdf
 * @property {string | null} number
 * @property {boolean} paid
 * @property {number} periodEnd
 * @property {number} periodStart
 * @property {string | null} status
 * @property {string | null} subscription
 * @property {number} subtotal
 * @property {number|null} tax
 * @property {number} total
 * @property {number | null} webhooksDeliveredAt
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<StripeEventAttributes, StripeEventAttributes>>} StripeEventModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {StripeEventModel & {associate: (models: any) => void}}
 */
const StripeEventModel = (sequelize) => {
  /** @type {StripeEventModel & { associate: (models: any) => void }} */
  // @ts-ignore
  const StripeEvent = sequelize.define(
    "stripeEvent",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Stripe event ID is required" },
        },
      },
      object: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Object type is required" },
        },
      },
      accountCountry: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amountDue: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amountPaid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amountRemaining: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attemptCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attempted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      autoAdvance: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      billingReason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      collectionMethod: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dueDate: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      effectiveAt: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      endingBalance: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hostedInvoiceUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      invoicePdf: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      periodEnd: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      periodStart: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subscription: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tax: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      webhooksDeliveredAt: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  StripeEvent.associate =
    /**
     * @param {{ [x:string]: import("sequelize").ModelStatic<Model> }} models
     */
    (models) => {
      StripeEvent.belongsTo(models.User, {
        foreignKey: "customerId",
        targetKey: "stripeCustomerId",
      });
    };

  return StripeEvent;
};

export default StripeEventModel;
