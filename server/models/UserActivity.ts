import { DataTypes, Model, Sequelize, ModelStatic } from "sequelize";

export interface UserActivityAttributes {
  id: number;
  userId: number;
  activityType: string;
  description: string | null;
  metadata: object | null;
  timestamp: Date;
}

export interface UserActivityCreationAttributes
  extends Omit<UserActivityAttributes, "id" | "timestamp"> {}

interface UserActivityInstance
  extends Model<UserActivityAttributes, UserActivityCreationAttributes>,
    UserActivityAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserActivityModel extends ModelStatic<UserActivityInstance> {
  associate: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const UserActivityModel = (sequelize: Sequelize): UserActivityModel => {
  const UserActivity = sequelize.define<UserActivityInstance>(
    "userActivity",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "User ID is required" },
          isInt: { msg: "User ID must be an integer" },
        },
      },
      activityType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Activity type is required" },
          len: {
            args: [3, 50],
            msg: "Activity type must be between 3 and 50 characters long",
          },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: "Description cannot exceed 255 characters",
          },
        },
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
          isValidJSON(value: object) {
            if (value && typeof value !== "object") {
              throw new Error("Metadata must be a valid JSON object");
            }
          },
        },
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          notNull: { msg: "Timestamp is required" },
          isDate: { msg: "Timestamp must be a valid date", args: true },
        },
      },
    },
    {
      timestamps: true, // Adds createdAt and updatedAt fields
      defaultScope: {
        attributes: { exclude: ["metadata"] },
      },
      scopes: {
        withMetadata: {
          attributes: { include: ["metadata"] },
        },
      },
    }
  ) as UserActivityModel;

  UserActivity.associate = (models: { [key: string]: ModelStatic<Model> }) => {
    UserActivity.belongsTo(models.User, { foreignKey: "userId" });
  };

  return UserActivity;
};

export default UserActivityModel;
