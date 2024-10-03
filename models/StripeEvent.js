import { DataTypes } from "sequelize";
import { Model, Sequelize } from "sequelize";

/**
 * @typedef {Object} StripeEventAttributes
 * @property {string} id
 * @property {string} eventId
 * @property {string} type
 * @property {Object} data
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<StripeEventAttributes, Omit<StripeEventAttributes, 'id'>>>} StripeEventModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {StripeEventModel & {associate: (models: any) => void}}
 */
const StripeEventModel = (sequelize) => {
  /** @type {StripeEventModel & { associate: (models: any) => void }} */
  // @ts-ignore
  const StripeEvent = sequelize.define("stripeEvent", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Event ID is required" },
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Event type is required" },
      },
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Event data is required" },
      },
    },
  });

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
