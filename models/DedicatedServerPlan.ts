import { DataTypes, Model, Sequelize, ModelStatic, Association } from "sequelize";

interface DedicatedServerPlanAttributes {
  id: number;
  size: "Free" | "Small" | "Medium" | "Large" | "XLarge" | "XXLarge";
  price: number;
  stripePriceId: string | null;
  description: string;
}

interface DedicatedServerPlanCreationAttributes extends Omit<DedicatedServerPlanAttributes, "id"> {}

interface DedicatedServerPlanInstance
  extends Model<DedicatedServerPlanAttributes, DedicatedServerPlanCreationAttributes>,
    DedicatedServerPlanAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

interface DedicatedServerPlanModel extends ModelStatic<DedicatedServerPlanInstance> {
  associate: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const DedicatedServerPlanModel = (sequelize: Sequelize): DedicatedServerPlanModel => {
  const DedicatedServerPlan = sequelize.define<DedicatedServerPlanInstance>(
    "dedicatedServerPlan",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Server size is required" },
          isIn: {
            args: [["Free", "Small", "Medium", "Large", "XLarge", "XXLarge"]],
            msg: "Invalid server size",
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
      stripePriceId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          notEmpty: { msg: "Stripe price ID is required" },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Description is required" },
        },
      },
    },
    {
      timestamps: true,
    }
  ) as DedicatedServerPlanModel;

  DedicatedServerPlan.associate = (models: { [key: string]: ModelStatic<Model> }) => {
    DedicatedServerPlan.hasMany(models.App, {
      foreignKey: "dedicatedServerPlanId",
      as: "apps",
    });
  };

  return DedicatedServerPlan;
};

export default DedicatedServerPlanModel;