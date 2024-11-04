import { DataTypes, Model, Sequelize, ModelStatic } from "sequelize";

export interface PlanAttributes {
  id: number;
  code: string;
  name: string;
  basePrice: number;
  freeDataTransferGB: number;
  pricePerAdditional10GB: number;
  billingPeriod: 'monthly' | 'yearly';
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  apiIntegration: boolean;
  dedicatedAccountManager: boolean;
  stripePriceId: string;
}

export interface PlanCreationAttributes extends Omit<PlanAttributes, "id"> { }

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
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          isDecimal: { msg: "Base price must be a valid decimal number" },
          min: { args: [0], msg: "Base price must be greater than or equal to 0" },
        },
        get() {
          const value = this.getDataValue('basePrice');
          return value === null ? null : Number(value);
        },
      },
      freeDataTransferGB: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
          isInt: { msg: "Free data transfer must be an integer" },
          min: { args: [0], msg: "Free data transfer must be at least 0 GB" },
        },
      },
      pricePerAdditional10GB: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1.00,
        validate: {
          isDecimal: { msg: "Price must be a valid decimal number" },
          min: { args: [0], msg: "Price must be greater than or equal to 0" },
        },
        get() {
          const value = this.getDataValue('pricePerAdditional10GB');
          return value === null ? null : Number(value);
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
      indexes: [
        {
          unique: true,
          fields: ['code'],
        },
        {
          unique: true,
          fields: ['stripePriceId'],
        },
      ]
    }
  ) as PlanModel;

  Plan.associate = (models: { [key: string]: ModelStatic<Model> }) => {
    Plan.hasMany(models.UserSubscription, { foreignKey: "planId" });
  };

  return Plan;
};

export default PlanModel;