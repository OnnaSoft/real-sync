import { DataTypes, Model, Sequelize, ModelStatic } from "sequelize";

export interface UserSubscriptionAttributes {
  id: number;
  userId: number;
  stripePriceId: string;
  stripeSubscriptionId: string;
  activatedAt: Date;
  cancelRequestedAt?: Date | null;
  effectiveCancelDate?: Date | null;
  status: 'active' | 'pending_cancellation' | 'inactive' | 'cancelled';
  stripeSubscriptionItemId: string | null;
}

export interface UserSubscriptionCreationAttributes extends Omit<UserSubscriptionAttributes, "id"> {}

interface UserSubscriptionInstance extends Model<UserSubscriptionAttributes, UserSubscriptionCreationAttributes>, UserSubscriptionAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserSubscriptionModel extends ModelStatic<UserSubscriptionInstance> {
  associate: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const UserSubscriptionModel = (sequelize: Sequelize): UserSubscriptionModel => {
  const UserSubscription = sequelize.define<UserSubscriptionInstance>(
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
          isAfterActivation(value: Date) {
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
        beforeUpdate: async (userSubscription: UserSubscriptionInstance) => {
          if (
            userSubscription.changed("cancelRequestedAt") &&
            userSubscription.cancelRequestedAt
          ) {
            const activationDate = new Date(userSubscription.activatedAt);
            const cancelRequestDate = new Date(userSubscription.cancelRequestedAt);

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
  ) as UserSubscriptionModel;

  UserSubscription.associate = (models: { [key: string]: ModelStatic<Model> }) => {
    UserSubscription.belongsTo(models.User, { foreignKey: "userId" });
    UserSubscription.belongsTo(models.Plan, {
      foreignKey: "stripePriceId",
      targetKey: "stripePriceId",
    });
  };

  return UserSubscription;
};

export default UserSubscriptionModel;