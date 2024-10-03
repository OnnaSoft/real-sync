import { DataTypes } from "sequelize";
import { Model, Sequelize } from "sequelize";

/**
 * @typedef {Object} DedicatedServerPlanAttributes
 * @property {number} id
 * @property {string} size
 * @property {number} price
 * @property {string} stripePriceId
 * @property {string} description
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<DedicatedServerPlanAttributes, Omit<DedicatedServerPlanAttributes, 'id'>>>} DedicatedServerPlanModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {DedicatedServerPlanModel & {associate: (models: any) => void}}
 */
const DedicatedServerPlanModel = (sequelize) => {
  /** @type {DedicatedServerPlanModel & { associate: (models: any) => void }} */
  // @ts-ignore
  const DedicatedServerPlan = sequelize.define(
    "dedicatedServerPlan",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Server size is required" },
          isIn: {
            args: [["Small", "Medium", "Large", "XLarge", "XXLarge"]],
            msg: "Invalid server size",
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
      stripePriceId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Stripe price ID is required" },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Description is required" },
        },
      },
    },
    {
      timestamps: true,
    }
  );

  DedicatedServerPlan.associate =
    /**
     * @param {{ [x:string]: import("sequelize").ModelStatic<Model> }} models
     */
    (models) => {
      DedicatedServerPlan.hasMany(models.App, {
        foreignKey: "dedicatedServerPlanId",
        as: "apps",
      });
    };

  return DedicatedServerPlan;
};

export default DedicatedServerPlanModel;
