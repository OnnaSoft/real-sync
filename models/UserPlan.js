import { DataTypes, Model, Sequelize } from "sequelize";

/**
 * @typedef {Object} UserPlanAttributes
 * @property {number} id
 * @property {number} userId
 * @property {number} planId
 * @property {Date} activatedAt
 * @property {Date|null} [cancelRequestedAt]
 * @property {Date|null} [effectiveCancelDate]
 * @property {'active' | 'pending_cancellation' | 'cancelled'} status
 * @property {string} stripeSubscriptionId
 * @property {string} stripeSubscriptionItemId
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<UserPlanAttributes, Omit<UserPlanAttributes, 'id'>>>} UserPlanModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {UserPlanModel}
 */
const UserPlanModel = (sequelize) => {
  /**
   * @type {UserPlanModel}
   */
  const UserPlan = sequelize.define(
    "user-plan",
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
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "plans",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      activatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      cancelRequestedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          /**
           * @param {Date} value
           */
          isAfterActivation(value) {
            if (value && this.activatedAt && value <= this.activatedAt) {
              throw new Error(
                "Cancel request date must be after activation date"
              );
            }
          },
        },
      },
      effectiveCancelDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "pending_cancellation", "cancelled"),
        allowNull: false,
        defaultValue: "active",
      },
      stripeSubscriptionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      stripeSubscriptionItemId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      hooks: {
        beforeUpdate: async (userPlan) => {
          if (
            // @ts-ignore
            userPlan.changed("cancelRequestedAt") &&
            userPlan.getDataValue("cancelRequestedAt")
          ) {
            const activationDate = new Date(
              userPlan.getDataValue("activatedAt")
            );
            const cancelRequestDate = new Date(
              // @ts-ignore
              userPlan.getDataValue("cancelRequestedAt")
            );

            // Set the effective cancel date to the last day of the next month
            const effectiveDate = new Date(
              cancelRequestDate.getFullYear(),
              cancelRequestDate.getMonth() + 2,
              0
            );

            // If the effective date is before the activation date + 1 month, adjust it
            const minEffectiveDate = new Date(
              activationDate.getFullYear(),
              activationDate.getMonth() + 1,
              activationDate.getDate()
            );
            if (effectiveDate < minEffectiveDate) {
              effectiveDate.setMonth(minEffectiveDate.getMonth());
              effectiveDate.setDate(minEffectiveDate.getDate() - 1);
            }

            userPlan.setDataValue("effectiveCancelDate", effectiveDate);
            userPlan.setDataValue("status", "pending_cancellation");
          }
        },
      },
    }
  );

  return UserPlan;
};

export default UserPlanModel;

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {string} fullname
 */

/**
 * @typedef {Object} Plan
 * @property {number} id
 * @property {string} name
 * @property {string} code
 * @property {string} price
 */

/**
 * @typedef {UserPlanAttributes & {plan: Plan}} UserPlanWithPlan
 */
