import { DataTypes, Model, Sequelize, ModelStatic } from "sequelize";

interface TunnelAttributes {
  id: number;
  subdomain: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TunnelCreationAttributes extends Omit<TunnelAttributes, "id" | "createdAt" | "updatedAt"> {}

interface TunnelInstance extends Model<TunnelAttributes, TunnelCreationAttributes>, TunnelAttributes {
  createdAt: Date;
  updatedAt: Date;
}

interface TunnelModel extends ModelStatic<TunnelInstance> {
  associate: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const TunnelModel = (sequelize: Sequelize): TunnelModel => {
  const Tunnel = sequelize.define<TunnelInstance>(
    "tunnel",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      subdomain: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9]+(-[a-z0-9]+)*$/i,
          len: [3, 63],
          notEmpty: true,
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
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
    }
  ) as TunnelModel;

  Tunnel.associate = (models: { [key: string]: ModelStatic<Model> }) => {
    Tunnel.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Tunnel;
};

export default TunnelModel;