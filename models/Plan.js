import { DataTypes } from "sequelize";
import { Model, Sequelize } from "sequelize";

/**
 * @typedef {Object} PlanAttributes
 * @property {number} id
 * @property {string} code
 * @property {string} name
 * @property {number} price
 * @property {'monthly' | 'yearly'} billingPeriod
 * @property {boolean} realTimeChat
 * @property {boolean} voiceCalls
 * @property {boolean} videoCalls
 * @property {number} maxApps
 * @property {number} secureConnections
 * @property {'community' | 'email' | 'priority' | 'dedicated'} supportLevel
 * @property {boolean} apiIntegration
 * @property {boolean} dedicatedAccountManager
 * @property {string} stripePriceId
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<PlanAttributes, Omit<PlanAttributes, 'id'>>>} PlanModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {PlanModel & {associate: (models: any) => void}}
 */
const PlanModel = (sequelize) => {
  /** @type {PlanModel & { associate: (models: any) => void }} */
  // @ts-ignore
  const Plan = sequelize.define(
    "plan",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Plan code is required" },
          len: {
            args: [2, 20],
            msg: "Plan code must be between 2 and 20 characters long",
          },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Plan name is required" },
          len: {
            args: [2, 50],
            msg: "Plan name must be between 2 and 50 characters long",
          },
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: { msg: "Price must be a valid decimal number" },
          min: { args: [0], msg: "Price must be greater than or equal to 0" },
        },
      },
      billingPeriod: {
        type: DataTypes.ENUM("monthly", "yearly"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["monthly", "yearly"]],
            msg: "Billing period must be either 'monthly' or 'yearly'",
          },
        },
      },
      realTimeChat: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      voiceCalls: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      videoCalls: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      maxApps: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: "Max apps must be an integer" },
          min: { args: [0], msg: "Max apps must be at least 0" },
        },
      },
      secureConnections: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: "Secure connections must be an integer" },
          min: { args: [0], msg: "Secure connections must be at least 0" },
        },
      },
      supportLevel: {
        type: DataTypes.ENUM("community", "email", "priority", "dedicated"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["community", "email", "priority", "dedicated"]],
            msg: "Support level must be either 'community', 'email', 'priority', or 'dedicated'",
          },
        },
      },
      apiIntegration: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      dedicatedAccountManager: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      stripePriceId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Stripe price ID is required" },
        },
      },
    },
    {
      timestamps: true,
    }
  );

  Plan.associate =
    /**
     * @param {{ [x:string]: import("sequelize").ModelStatic<Model> }} models
     */
    (models) => {
      Plan.hasMany(models.UserSubscription, { foreignKey: "planId" });
    };

  return Plan;
};

export default PlanModel;
