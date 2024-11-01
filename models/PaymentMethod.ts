import { DataTypes, Model, Sequelize, ModelStatic } from "sequelize";

export interface PaymentMethodAttributes {
  id: number;
  userId: number;
  type: 'credit' | 'debit';
  last4: string;
  expMonth: string;
  expYear: string;
  brand: string | null;
  isDefault: boolean;
  stripePaymentMethodId: string;
}

export interface PaymentMethodCreationAttributes extends Omit<PaymentMethodAttributes, "id"> {}

interface PaymentMethodInstance
  extends Model<PaymentMethodAttributes, PaymentMethodCreationAttributes>,
    PaymentMethodAttributes {
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface PaymentMethodModel extends ModelStatic<PaymentMethodInstance> {
  associate: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const PaymentMethodModel = (sequelize: Sequelize): PaymentMethodModel => {
  const PaymentMethod = sequelize.define<PaymentMethodInstance>(
    "paymentMethod",
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
      type: {
        type: DataTypes.ENUM("credit", "debit"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["credit", "debit"]],
            msg: "Type must be either 'credit' or 'debit'",
          },
        },
      },
      last4: {
        type: DataTypes.STRING(4),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Last 4 digits are required" },
          len: {
            args: [4, 4],
            msg: "Last 4 digits must be exactly 4 characters long",
          },
          isNumeric: { msg: "Last 4 digits must be numeric" },
        },
      },
      expMonth: {
        type: DataTypes.STRING(2),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Expiration month is required" },
          len: {
            args: [1, 2],
            msg: "Expiration month must be 1 or 2 characters long",
          },
          isNumeric: { msg: "Expiration month must be numeric" },
          min: { args: [1], msg: "Expiration month must be between 1 and 12" },
          max: { args: [12], msg: "Expiration month must be between 1 and 12" },
        },
      },
      expYear: {
        type: DataTypes.STRING(4),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Expiration year is required" },
          len: {
            args: [4, 4],
            msg: "Expiration year must be exactly 4 characters long",
          },
          isNumeric: { msg: "Expiration year must be numeric" },
        },
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      stripePaymentMethodId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Stripe payment method ID is required" },
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  ) as PaymentMethodModel;

  PaymentMethod.associate = (models: { [key: string]: ModelStatic<Model> }) => {
    PaymentMethod.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return PaymentMethod;
};

export default PaymentMethodModel;