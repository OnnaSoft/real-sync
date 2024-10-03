import { DataTypes, Model, Sequelize } from "sequelize";

/**
 * @typedef {Object} UserSubscriptionAttributes
 * @property {number} id
 * @property {number} userId
 * @property {string} stripePriceId
 * @property {string} stripeSubscriptionId
 * @property {Date} activatedAt
 * @property {Date|null} [cancelRequestedAt]
 * @property {Date|null} [effectiveCancelDate]
 * @property {'active' | 'pending_cancellation' | 'inactive' | 'cancelled'} status
 * @property {string} stripeSubscriptionItemId
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<UserSubscriptionAttributes, Omit<UserSubscriptionAttributes, 'id'>>>} UserSubscriptionModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {UserSubscriptionModel & {associate: (models: any) => void}}
 */
const UserSubscriptionModel = (sequelize) => {
  /** @type {UserSubscriptionModel & { associate: (models: any) => void }} */
  // @ts-ignore
  const UserSubscription = sequelize.define(
    "userSubscription",
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
      stripePriceId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "plans",
          key: "stripePriceId",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      stripeSubscriptionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "compositeIndex",
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
        type: DataTypes.ENUM(
          "active",
          "pending_cancellation",
          "cancelled",
          "inactive"
        ),
        allowNull: false,
        defaultValue: "active",
      },
      stripeSubscriptionItemId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "stripeSubscriptionId"],
          name: "compositeIndex",
        },
      ],
      hooks: {
        beforeUpdate: async (userSubscription) => {
          if (
            // @ts-ignore
            userSubscription.changed("cancelRequestedAt") &&
            userSubscription.getDataValue("cancelRequestedAt")
          ) {
            const activationDate = new Date(
              userSubscription.getDataValue("activatedAt")
            );
            const cancelRequestDate = new Date(
              // @ts-ignore
              userSubscription.getDataValue("cancelRequestedAt")
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

            userSubscription.setDataValue("effectiveCancelDate", effectiveDate);
            userSubscription.setDataValue("status", "pending_cancellation");
          }
        },
      },
    }
  );

  UserSubscription.associate =
    /**
     * @param {{ [x:string]: import("sequelize").ModelStatic<Model> }} models
     */
    (models) => {
      UserSubscription.belongsTo(models.User, { foreignKey: "userId" });
      UserSubscription.belongsTo(models.Plan, {
        foreignKey: "stripePriceId",
        targetKey: "stripePriceId",
      });
    };

  return UserSubscription;
};

export default UserSubscriptionModel;
