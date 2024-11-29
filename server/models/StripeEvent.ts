import { DataTypes, Model, Sequelize, ModelStatic } from "sequelize";

export interface StripeEventAttributes {
  id: number;
  eventId: string;
  type: string;
  data: object;
}

export interface StripeEventCreationAttributes extends Omit<StripeEventAttributes, "id"> {}

interface StripeEventInstance extends Model<StripeEventAttributes, StripeEventCreationAttributes>, StripeEventAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

interface StripeEventModel extends ModelStatic<StripeEventInstance> {
  associate: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const StripeEventModel = (sequelize: Sequelize): StripeEventModel => {
  const StripeEvent = sequelize.define<StripeEventInstance>(
    "stripeEvent",
    {
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
    },
    {
      timestamps: true,
    }
  ) as StripeEventModel;

  StripeEvent.associate = (models: { [key: string]: ModelStatic<Model> }) => {
    StripeEvent.belongsTo(models.User, {
      foreignKey: "customerId",
      targetKey: "stripeCustomerId",
    });
  };

  return StripeEvent;
};

export default StripeEventModel;