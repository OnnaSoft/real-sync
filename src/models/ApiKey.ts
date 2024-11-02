import { DataTypes, Model, Sequelize, ModelStatic } from "sequelize";

export interface ApiKeyAttributes {
  id: number;
  key: string;
  lastUsed: Date | null;
  appId: number;
}

export interface ApiKeyCreationAttributes extends Omit<ApiKeyAttributes, "id"> {}

interface ApiKeyInstance extends Model<ApiKeyAttributes, ApiKeyCreationAttributes>, ApiKeyAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

interface ApiKeyModel extends ModelStatic<ApiKeyInstance> {
  associate: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const ApiKeyModel = (sequelize: Sequelize): ApiKeyModel => {
  const ApiKey = sequelize.define<ApiKeyInstance>(
    "apiKey",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "API key is required" },
        },
      },
      lastUsed: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      appId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "apps",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
    }
  ) as ApiKeyModel;

  ApiKey.associate = (models: { [key: string]: ModelStatic<Model> }) => {
    ApiKey.belongsTo(models.App, { foreignKey: "appId" });
  };

  return ApiKey;
};

export default ApiKeyModel;