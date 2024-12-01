import { DataTypes, Model, Sequelize, ModelStatic } from "sequelize";

export interface TunnelAttributes {
  id: number;
  domain: string;
  userId: number;
  allowMultipleConnections: boolean;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TunnelCreationAttributes extends Omit<TunnelAttributes, "id" | "createdAt" | "updatedAt"> {}

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
      domain: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*$/i,
          len: [3, 253],
          notEmpty: true,
          customValidator(value: string) {
            if (value.split('.').some(part => part.length > 63)) {
              throw new Error('Each part of the domain (between dots) must be 63 characters or less');
            }
            if (value.startsWith('-') || value.endsWith('-')) {
              throw new Error('Domain parts cannot start or end with a hyphen');
            }
            if (value.includes('..')) {
              throw new Error('Domain cannot have consecutive dots');
            }
          },
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
      allowMultipleConnections: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

