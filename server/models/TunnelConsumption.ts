import { DataTypes, Model, Sequelize, ModelStatic } from "sequelize";

export interface TunnelConsumptionAttributes {
  id: number;
  tunnelId: number;
  year: number;
  month: number;
  dataUsage: bigint;
  createdAt: Date;
  updatedAt: Date;
}

export interface TunnelConsumptionCreationAttributes extends Omit<TunnelConsumptionAttributes, "id" | "createdAt" | "updatedAt"> {}

interface TunnelConsumptionInstance extends Model<TunnelConsumptionAttributes, TunnelConsumptionCreationAttributes>, TunnelConsumptionAttributes {
  createdAt: Date;
  updatedAt: Date;
}

interface TunnelConsumptionModel extends ModelStatic<TunnelConsumptionInstance> {
  associate: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const TunnelConsumptionModel = (sequelize: Sequelize): TunnelConsumptionModel => {
  const TunnelConsumption = sequelize.define<TunnelConsumptionInstance>(
    "tunnelConsumption",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tunnelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "tunnels",
          key: "id",
        },
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 2000,
          max: 9999,
        },
      },
      month: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 12,
        },
      },
      dataUsage: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['tunnelId', 'year', 'month'],
        },
      ],
    }
  ) as TunnelConsumptionModel;

  TunnelConsumption.associate = (models: { [key: string]: ModelStatic<Model> }) => {
    TunnelConsumption.belongsTo(models.Tunnel, { foreignKey: "tunnelId" });
  };

  return TunnelConsumption;
};

export default TunnelConsumptionModel;

