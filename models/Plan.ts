import { DataTypes, Model, Sequelize, ModelStatic } from "sequelize";

export interface PlanAttributes {
  id: number;
  code: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  realTimeChat: boolean;
  voiceCalls: boolean;
  videoCalls: boolean;
  maxApps: number;
  secureConnections: number;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  apiIntegration: boolean;
  dedicatedAccountManager: boolean;
  stripePriceId: string;
}

export interface PlanCreationAttributes extends Omit<PlanAttributes, "id"> {}

interface PlanInstance extends Model<PlanAttributes, PlanCreationAttributes>, PlanAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlanModel extends ModelStatic<PlanInstance> {
  associate: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const PlanModel = (sequelize: Sequelize): PlanModel => {
  const Plan = sequelize.define<PlanInstance>(
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
  ) as PlanModel;

  Plan.associate = (models: { [key: string]: ModelStatic<Model> }) => {
    Plan.hasMany(models.UserSubscription, { foreignKey: "planId" });
  };

  return Plan;
};

export default PlanModel;