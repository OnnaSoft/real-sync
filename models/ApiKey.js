import { DataTypes } from "sequelize";
import { Model, Sequelize } from "sequelize";

/**
 * @typedef {Object} ApiKeyAttributes
 * @property {number} id
 * @property {string} key
 * @property {Date} lastUsed
 * @property {number} appId
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<ApiKeyAttributes, Omit<ApiKeyAttributes, 'id'>>>} ApiKeyModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {ApiKeyModel & {associate: (models: any) => void}}
 */
const ApiKeyModel = (sequelize) => {
  /** @type {ApiKeyModel & { associate: (models: any) => void }} */
  // @ts-ignore
  const ApiKey = sequelize.define(
    "apiKey",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "API key is required" },
        },
      },
      lastUsed: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      appId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "apps",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
    }
  );

  ApiKey.associate =
    /**
     * @param {{ [x:string]: import("sequelize").ModelStatic<Model> }} models
     */
    (models) => {
      ApiKey.belongsTo(models.App, { foreignKey: "appId" });
    };

  return ApiKey;
};

export default ApiKeyModel;
