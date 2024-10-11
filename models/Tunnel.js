import { DataTypes, Model, Sequelize } from "sequelize";

/**
 * @typedef {Object} TunnelAttributes
 * @property {number} id
 * @property {string} subdomain
 * @property {number} userId
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<TunnelAttributes, Omit<TunnelAttributes, 'id'>>>} TunnelModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {TunnelModel & {associate: (models: any) => void}}
 */
const TunnelModel = (sequelize) => {
  /** @type {TunnelModel & { associate: (models: any) => void }} */
  // @ts-ignore
  const Tunnel = sequelize.define(
    "tunnel",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      subdomain: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9]+(-[a-z0-9]+)*$/i,
          len: [3, 63],
          notEmpty: true,
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
    }
  );

  Tunnel.associate = (models) => {
    Tunnel.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Tunnel;
};

export default TunnelModel;
